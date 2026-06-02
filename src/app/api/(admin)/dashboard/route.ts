import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Decimal } from "@prisma/client/runtime/client";
import { Prisma } from "@prisma/client";

/**
 * GET dashboard summary stats.
 * Returns aggregated metrics + recent reservations with room relation.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    if (!(await requireAuth()))
        return NextResponse.json(
            { error: "apiMessages.error.unauthorized" },
            { status: 401 },
        );
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "today"; // today | week | month | all

        const whereReservation: Prisma.ReservationWhereInput = {};
        const whereOrder: Prisma.OrderWhereInput = {};

        if (range !== "all") {
            const now = new Date();
            // Adjust current time to local cafe timezone (UTC+3)
            const localTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

            let start: Date;
            let end: Date;

            if (range === "today") {
                const yyyy = localTime.getUTCFullYear();
                const mm = String(localTime.getUTCMonth() + 1).padStart(2, "0");
                const dd = String(localTime.getUTCDate()).padStart(2, "0");
                start = new Date(`${yyyy}-${mm}-${dd}T00:00:00+03:00`);
                end = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999+03:00`);
            } else if (range === "week") {
                const currentDay = localTime.getUTCDay(); // 0 is Sunday, 6 is Saturday
                const diffToSaturday = (currentDay + 1) % 7;

                const saturday = new Date(localTime);
                saturday.setUTCDate(saturday.getUTCDate() - diffToSaturday);

                const yyyyStart = saturday.getUTCFullYear();
                const mmStart = String(saturday.getUTCMonth() + 1).padStart(
                    2,
                    "0",
                );
                const ddStart = String(saturday.getUTCDate()).padStart(2, "0");

                start = new Date(
                    `${yyyyStart}-${mmStart}-${ddStart}T00:00:00+03:00`,
                );

                const friday = new Date(saturday);
                friday.setUTCDate(friday.getUTCDate() + 6);

                const yyyyEnd = friday.getUTCFullYear();
                const mmEnd = String(friday.getUTCMonth() + 1).padStart(2, "0");
                const ddEnd = String(friday.getUTCDate()).padStart(2, "0");

                end = new Date(
                    `${yyyyEnd}-${mmEnd}-${ddEnd}T23:59:59.999+03:00`,
                );
            } else {
                // month
                const yyyy = localTime.getUTCFullYear();
                const mm = String(localTime.getUTCMonth() + 1).padStart(2, "0");

                start = new Date(`${yyyy}-${mm}-01T00:00:00+03:00`);

                // Get last day of month
                const nextMonth = new Date(
                    yyyy,
                    localTime.getUTCMonth() + 1,
                    0,
                );
                const ddEnd = String(nextMonth.getDate()).padStart(2, "0");

                end = new Date(`${yyyy}-${mm}-${ddEnd}T23:59:59.999+03:00`);
            }

            whereReservation.date_time = { gte: start, lte: end };
            whereOrder.reservation = { date_time: { gte: start, lte: end } };
        }

        const [
            totalReservations,
            pendingReservations,
            acceptedReservations,
            totalRooms,
            totalItems,
            recentReservations,
            orders,
        ] = await Promise.all([
            prisma.reservation.count({ where: whereReservation }),
            prisma.reservation.count({
                where: {
                    ...whereReservation,
                    accepted: false,
                    completed: false,
                },
            }),
            prisma.reservation.count({
                where: {
                    ...whereReservation,
                    accepted: true,
                    completed: false,
                },
            }),
            prisma.room.count({ where: { is_disable: false } }),
            prisma.item.count({ where: { is_disable: false } }),
            prisma.reservation.findMany({
                where: whereReservation,
                orderBy: { created_at: "desc" },
                take: 20,
                include: { room: true },
            }),
            // Single query to compute both revenue and ordered units
            prisma.order.findMany({
                where: whereOrder,
                select: { item_price: true, quantity: true },
            }),
        ]);

        // Compute revenue and ordered units from the single orders query
        const totalRevenue = orders.reduce(
            (sum: number, o: { item_price: Decimal; quantity: number }) =>
                sum + Number(o.item_price) * o.quantity,
            0,
        );
        const totalOrderedUnits = orders.reduce(
            (sum: number, o: { item_price: Decimal; quantity: number }) =>
                sum + o.quantity,
            0,
        );

        return NextResponse.json({
            stats: {
                totalReservations,
                pendingReservations,
                acceptedReservations,
                totalRooms,
                totalItems,
                totalRevenue,
                totalOrderedUnits,
            },
            recentReservations,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json(
            { error: "apiMessages.error.serverError" },
            { status: 500 },
        );
    }
}
