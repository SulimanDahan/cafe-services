import { roomSchema } from "@/lib/validations/room";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

type Params = { params: Promise<{ room: string }> };

/** GET a specific room */
export async function GET(_req: Request, { params }: Params) {
    if (!(await requireAuth())) return NextResponse.json({ error: "apiMessages.error.unauthorized" }, { status: 401 });
    try {
        const { room: id } = await params;
        const room = await prisma.room.findUnique({ where: { id } });
        if (!room)
            return NextResponse.json(
                { error: "apiMessages.error.roomNotFound" },
                { status: 404 },
            );
        return NextResponse.json(room);
    } catch (error) {
        console.error("Error fetching room:", error);
        return NextResponse.json(
            { error: "apiMessages.error.fetchRoomFailed" },
            { status: 500 },
        );
    }
}

/** PUT (full update) a specific room */
export async function PUT(request: Request, { params }: Params) {
    if (!(await requireAuth())) return NextResponse.json({ error: "apiMessages.error.unauthorized" }, { status: 401 });
    try {
        const { room: id } = await params;
        const body = await request.json();
        const validation = roomSchema.partial().safeParse(body);

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

        const updated = await prisma.room.update({
            where: { id },
            data: {
                name: data.name,
                qr_code: data.qr_code,
                is_disable: data.is_disable,
            },
        });

        return NextResponse.json(updated);
    } catch (error: unknown) {
        console.error("Error updating room:", error);
        const err = error as { code?: string };
        if (err.code === "P2025")
            return NextResponse.json(
                { error: "apiMessages.error.roomNotFound" },
                { status: 404 },
            );
        return NextResponse.json(
            { error: "apiMessages.error.updateRoomFailed" },
            { status: 500 },
        );
    }
}

/** DELETE a specific room */
export async function DELETE(_req: Request, { params }: Params) {
    if (!(await requireAuth())) return NextResponse.json({ error: "apiMessages.error.unauthorized" }, { status: 401 });
    try {
        const { room: id } = await params;

        // Check if room has reservations
        const reservationsCount = await prisma.reservation.count({ where: { room_id: id } });
        if (reservationsCount > 0) {
            return NextResponse.json({ error: "apiMessages.error.roomHasReservations" }, { status: 400 });
        }

        await prisma.room.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error deleting room:", error);
        const err = error as { code?: string };
        if (err.code === "P2025")
            return NextResponse.json(
                { error: "apiMessages.error.roomNotFound" },
                { status: 404 },
            );
        return NextResponse.json(
            { error: "apiMessages.error.deleteRoomFailed" },
            { status: 500 },
        );
    }
}
