import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { room_id, passkey } = await req.json();
        if (!room_id) return NextResponse.json({ error: "Room ID required" }, { status: 400 });

        // Check if passkey is forced in settings
        const settings = await prisma.settings.findFirst();
        const forcePasskey = settings?.force_client_order_session_passKey ?? false;

        if (forcePasskey && !passkey) {
            return NextResponse.json({ error: "Passkey required" }, { status: 422 });
        }

        // Get today's start and end date for localized checking
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const whereClause: {
            room_id: string;
            accepted: boolean;
            completed: boolean;
            date_time: { gte: Date; lte: Date };
            order_passkey?: number;
        } = {
            room_id,
            accepted: true,
            completed: false,
            date_time: {
                gte: todayStart,
                lte: todayEnd,
            }
        };

        if (forcePasskey) {
            whereClause.order_passkey = Number(passkey);
        }

        const activeReservation = await prisma.reservation.findFirst({
            where: whereClause,
            include: {
                room: true
            }
        });

        if (!activeReservation) {
            const errorMsg = forcePasskey 
                ? "Invalid passkey or no active confirmed reservation for this table today." 
                : "No active confirmed reservation for this table today.";
            return NextResponse.json({ error: errorMsg }, { status: 404 });
        }

        return NextResponse.json({ session: activeReservation });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
