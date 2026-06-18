import { reservationSchema } from "@/lib/validations/reservation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { notificationEmitter } from "@/lib/emitter";

type Params = { params: Promise<{ reservation: string }> };

/** GET a specific reservation with room relation */
export async function GET(_req: Request, { params }: Params) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { reservation: id } = await params;
		const reservation = await prisma.reservation.findUnique({
			where: { id },
			include: { room: true, orders: { include: { item: true } } },
		});
		if (!reservation)
			return NextResponse.json(
				{ error: "apiMessages.error.reservationNotFound" },
				{ status: 404 },
			);
		return NextResponse.json(reservation);
	} catch (error) {
		console.error("Error fetching reservation:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.fetchReservationFailed" },
			{ status: 500 },
		);
	}
}

/** PUT (update) a specific reservation — used for accept/reject */
export async function PUT(request: Request, { params }: Params) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { reservation: id } = await params;
		const body = await request.json();
		const validation = reservationSchema.partial().safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "apiMessages.error.validationFailed",
					details: validation.error.format(),
				},
				{ status: 422 },
			);
		}

		const data = validation.data;

		const currentRes = await prisma.reservation.findUnique({
			where: { id },
			include: { orders: true },
		});
		if (!currentRes)
			return NextResponse.json(
				{ error: "apiMessages.error.reservationNotFound" },
				{ status: 404 },
			);

		// Check if room is being changed
		if (data.room_id && data.room_id !== currentRes.room_id) {
			if (currentRes.completed) {
				return NextResponse.json(
					{ error: "apiMessages.error.cannotChangeRoomUnlessActive" },
					{ status: 400 },
				);
			}
		}

		let isEditingData = false;
		if (data.client_name !== undefined && data.client_name !== currentRes.client_name) isEditingData = true;
		if (data.phone !== undefined && data.phone !== currentRes.phone) isEditingData = true;
		if (
			data.date_time !== undefined &&
			new Date(data.date_time).getTime() !== currentRes.date_time.getTime()
		) {
			isEditingData = true;
		}

		if (isEditingData && (currentRes.completed || currentRes.activated)) {
			return NextResponse.json(
				{ error: "apiMessages.error.cannotEditProcessedReservation" },
				{ status: 400 },
			);
		}

		if (
			data.activated === false &&
			currentRes.activated === true &&
			currentRes.orders &&
			currentRes.orders.length > 0
		) {
			return NextResponse.json(
				{ error: "apiMessages.error.cannotUndoActivateWithOrders" },
				{ status: 400 },
			);
		}

		const isActivated =
			data.activated !== undefined
				? data.activated
				: currentRes.activated;
		const isCompleted =
			data.completed !== undefined
				? data.completed
				: currentRes.completed;
		const targetRoomId = data.room_id || currentRes.room_id;

		if (isActivated && !isCompleted) {
			const activeExisting = await prisma.reservation.findFirst({
				where: {
					room_id: targetRoomId,
					activated: true,
					completed: false,
					id: { not: id },
				},
			});
			if (activeExisting) {
				return NextResponse.json(
					{ error: "apiMessages.error.roomAlreadyActive" },
					{ status: 400 },
				);
			}
		}

		const updated = await prisma.reservation.update({
			where: { id },
			data: {
				client_name: data.client_name,
				phone: data.phone,
				room_id: data.room_id,
				date_time: data.date_time,
				accepted: data.accepted,
				activated: data.activated,
				completed: data.completed,
			},
			include: { room: true },
		});

		if (updated.completed && !currentRes.completed) {
			notificationEmitter.emit("session-ended", updated);
		}

		return NextResponse.json(updated);
	} catch (error: unknown) {
		console.error("Error updating reservation:", error);
		const err = error as { code?: string };
		if (err.code === "P2025")
			return NextResponse.json(
				{ error: "apiMessages.error.reservationNotFound" },
				{ status: 404 },
			);
		return NextResponse.json(
			{ error: "apiMessages.error.updateReservationFailed" },
			{ status: 500 },
		);
	}
}

/** DELETE a specific reservation (cascade deletes orders) */
export async function DELETE(_req: Request, { params }: Params) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const { reservation: id } = await params;

		const currentRes = await prisma.reservation.findUnique({
			where: { id },
		});
		if (!currentRes)
			return NextResponse.json(
				{ error: "apiMessages.error.reservationNotFound" },
				{ status: 404 },
			);

		if (
			currentRes.accepted ||
			currentRes.activated ||
			currentRes.completed
		) {
			return NextResponse.json(
				{ error: "apiMessages.error.cannotDeleteActiveReservation" },
				{ status: 400 },
			);
		}

		// Delete associated orders first (no cascade in schema)
		await prisma.order.deleteMany({ where: { reservation_id: id } });
		await prisma.reservation.delete({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("Error deleting reservation:", error);
		const err = error as { code?: string };
		if (err.code === "P2025")
			return NextResponse.json(
				{ error: "apiMessages.error.reservationNotFound" },
				{ status: 404 },
			);
		return NextResponse.json(
			{ error: "apiMessages.error.deleteReservationFailed" },
			{ status: 500 },
		);
	}
}
