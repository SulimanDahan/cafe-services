import { reservationSchema } from "@/lib/validations/reservation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ reservation: string }> };

/** GET a specific reservation with room relation */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { reservation: id } = await params;
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: { room: true, orders: { include: { item: true } } },
        });
        if (!reservation) return NextResponse.json({ error: "apiMessages.error.reservationNotFound" }, { status: 404 });
        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Error fetching reservation:", error);
        return NextResponse.json({ error: "apiMessages.error.fetchReservationFailed" }, { status: 500 });
    }
}

/** PUT (update) a specific reservation — used for accept/reject */
export async function PUT(request: Request, { params }: Params) {
    try {
        const { reservation: id } = await params;
        const body = await request.json();
        const validation = reservationSchema.partial().safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "apiMessages.error.validationFailed", details: validation.error.format() },
                { status: 422 }
            );
        }

        const data = validation.data;

        const updated = await prisma.reservation.update({
            where: { id },
            data: {
                client_name: data.client_name,
                phone: data.phone,
                room_id: data.room_id,
                date_time: data.date_time,
                accepted: data.accepted,
                completed: data.completed,
            },
            include: { room: true },
        });

        return NextResponse.json(updated);
    } catch (error: unknown) {
        console.error("Error updating reservation:", error);
        const err = error as { code?: string };
        if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.reservationNotFound" }, { status: 404 });
        return NextResponse.json({ error: "apiMessages.error.updateReservationFailed" }, { status: 500 });
    }
}

/** DELETE a specific reservation (cascade deletes orders) */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { reservation: id } = await params;

        // Delete associated orders first (no cascade in schema)
        await prisma.order.deleteMany({ where: { reservation_id: id } });
        await prisma.reservation.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error deleting reservation:", error);
        const err = error as { code?: string };
        if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.reservationNotFound" }, { status: 404 });
        return NextResponse.json({ error: "apiMessages.error.deleteReservationFailed" }, { status: 500 });
    }
}