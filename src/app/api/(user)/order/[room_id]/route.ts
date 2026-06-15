import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/emitter";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";
import { orderBulkSchema } from "@/lib/validations/order";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ room_id: string }> },
) {
	try {
		const { room_id } = await params;
		const { searchParams } = new URL(req.url);
		const reservationId = searchParams.get("reservation_id");

		if (!reservationId) {
			return NextResponse.json(
				{ error: "apiMessages.error.reservationIdRequired" },
				{ status: 400 },
			);
		}

		// Verify reservation is active in the database and belongs to the room
		const reservation = await prisma.reservation.findUnique({
			where: { id: reservationId },
		});

		if (
			!reservation ||
			!reservation.accepted ||
			!reservation.activated ||
			reservation.completed
		) {
			return NextResponse.json(
				{
					error: "apiMessages.error.sessionExpired",
					sessionExpired: true,
				},
				{ status: 403 },
			);
		}

		if (reservation.room_id !== room_id) {
			return NextResponse.json(
				{ error: "apiMessages.error.roomChanged", roomChanged: true },
				{ status: 403 },
			);
		}

		const orders = await prisma.order.findMany({
			where: {
				reservation_id: reservationId,
			},
			include: {
				item: true,
			},
			orderBy: {
				created_at: "desc",
			},
		});

		return NextResponse.json({ success: true, orders });
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ room_id: string }> },
) {
	try {
		const { room_id } = await params;
		const body = await req.json();
		const validation = orderBulkSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.issues[0].message },
				{ status: 400 },
			);
		}

		const { items, reservation_id } = validation.data;

		// Verify reservation is active in the database and belongs to the room
		const reservation = await prisma.reservation.findUnique({
			where: { id: reservation_id },
			include: { room: true },
		});

		if (
			!reservation ||
			!reservation.accepted ||
			!reservation.activated ||
			reservation.completed
		) {
			return NextResponse.json(
				{
					error: "apiMessages.error.sessionExpired",
					sessionExpired: true,
				},
				{ status: 403 },
			);
		}

		if (reservation.room_id !== room_id) {
			return NextResponse.json(
				{ error: "apiMessages.error.roomChanged", roomChanged: true },
				{ status: 403 },
			);
		}

		const orders = [];

		// Check auto-accept setting once before the loop
		const orderSettings = await getSystemSettings();
		const autoAccept = orderSettings?.auto_accept_orders ?? false;

		for (const item of items) {
			const dbItem = await prisma.item.findUnique({
				where: { id: item.id },
			});
			if (dbItem) {
				const basePrice = Number(dbItem.price);
				// Type cast needed since Prisma hasn't been generated with new types in this run yet
				const dbItemAny = dbItem;
				const discountVal = Number(dbItemAny.discount_value || 0);
				const discountPct = Number(dbItemAny.discount_percentage || 0);

				const finalPrice = Math.max(
					0,
					basePrice - discountVal - basePrice * (discountPct / 100),
				);

				const order = await prisma.order.create({
					data: {
						reservation_id,
						item_id: item.id,
						item_price: finalPrice,
						quantity: item.quantity,
						notes: item.notes,
						// Auto-accept the order if the setting is enabled
						accepted: autoAccept,
					},
					include: { item: true },
				});
				orders.push(order);
				notificationEmitter.emit("new-order", order);
			}
		}

		// Notify Admin
		if (reservation) {
			const settings = await getSystemSettings();
			const appLang =
				settings?.app_lang === "ar" || !settings?.app_lang
					? "ar"
					: "en";
			const { t } = getServerTranslations(appLang);

			const title = t("notifications.newOrderTitle");
			const message = t("notifications.newOrderMessage").replace(
				"{room}",
				reservation.room.name,
			);

			const notification = await prisma.notification.create({
				data: {
					title,
					message,
				},
			});
			notificationEmitter.emit("notification-created", {
				...notification,
			});
		}

		return NextResponse.json({ success: true, orders });
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ room_id: string }> },
) {
	try {
		const { room_id } = await params;
		const { searchParams } = new URL(req.url);
		const orderId = searchParams.get("order_id");
		const reservationId = searchParams.get("reservation_id");

		if (!orderId || !reservationId) {
			return NextResponse.json(
				{ error: "apiMessages.error.orderResRequired" },
				{ status: 400 },
			);
		}

		// Verify reservation is active
		const reservation = await prisma.reservation.findUnique({
			where: { id: reservationId },
			include: { room: true },
		});

		if (
			!reservation ||
			!reservation.accepted ||
			!reservation.activated ||
			reservation.completed
		) {
			return NextResponse.json(
				{
					error: "apiMessages.error.sessionExpired",
					sessionExpired: true,
				},
				{ status: 403 },
			);
		}

		if (reservation.room_id !== room_id) {
			return NextResponse.json(
				{ error: "apiMessages.error.roomChanged", roomChanged: true },
				{ status: 403 },
			);
		}

		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				reservation_id: reservationId,
			},
			include: {
				item: true,
			},
		});

		if (!order) {
			return NextResponse.json(
				{ error: "apiMessages.error.orderNotFound" },
				{ status: 404 },
			);
		}

		if ((order as unknown as { accepted: boolean }).accepted) {
			return NextResponse.json(
				{ error: "apiMessages.error.cannotCancelApproved" },
				{ status: 400 },
			);
		}

		await prisma.order.delete({
			where: {
				id: orderId,
			},
		});

		// Notify Admin of cancellation
		if (reservation) {
			const settings = await getSystemSettings();
			const appLang =
				settings?.app_lang === "ar" || !settings?.app_lang
					? "ar"
					: "en";
			const { t } = getServerTranslations(appLang);

			const title = t("notifications.orderCancelledTitle");
			const message = t("notifications.orderCancelledMessage")
				.replace("{item}", order.item?.name || "")
				.replace("{room}", reservation.room.name);

			const notification = await prisma.notification.create({
				data: {
					title,
					message,
				},
			});
			notificationEmitter.emit("notification-created", {
				...notification,
			});
		}

		notificationEmitter.emit("order-deleted", orderId);

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
