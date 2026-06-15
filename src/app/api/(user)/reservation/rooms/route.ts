import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public GET endpoint for fetching available rooms.
 * Used exclusively by the customer-facing homepage booking modal.
 * No authentication required.
 */
export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            where: { is_disable: false },
            orderBy: { name: "asc" },
            select: { id: true, name: true, is_disable: true },
        });

        return NextResponse.json({ data: rooms });
    } catch (error) {
        console.error("Error fetching public rooms:", error);
        return NextResponse.json(
            { error: "apiMessages.error.fetchRoomsFailed" },
            { status: 500 },
        );
    }
}
