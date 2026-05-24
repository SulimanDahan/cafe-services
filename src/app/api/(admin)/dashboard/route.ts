import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET dashboard summary stats.
 * Returns aggregated metrics + recent reservations with room relation.
 */
export const dynamic = "force-dynamic";

export async function GET() {
 try {
 const [
 totalReservations,
 pendingReservations,
 acceptedReservations,
 totalRooms,
 totalItems,
 recentReservations,
 totalOrders,
 ] = await Promise.all([
 prisma.reservation.count(),
 prisma.reservation.count({ where: { accepted: false, completed: false } }),
 prisma.reservation.count({ where: { accepted: true, completed: false } }),
 prisma.room.count({ where: { is_disable: false } }),
 prisma.item.count({ where: { is_disable: false } }),
 prisma.reservation.findMany({
 orderBy: { created_at: "desc" },
 take: 20,
 include: { room: true },
 }),
 prisma.order.aggregate({
 _sum: { item_price: true, quantity: true },
 }),
 ]);

 // Total revenue: sum(item_price * quantity) — computed per order
 const orders = await prisma.order.findMany({
 select: { item_price: true, quantity: true },
 });
 const totalRevenue = orders.reduce(
 (sum, o) => sum + Number(o.item_price) * o.quantity,
 0
 );

 return NextResponse.json({
 stats: {
 totalReservations,
 pendingReservations,
 acceptedReservations,
 totalRooms,
 totalItems,
 totalRevenue,
 totalOrderedUnits: totalOrders._sum.quantity ?? 0,
 },
 recentReservations,
 });
 } catch (error) {
 console.error("Error fetching dashboard data:", error);
 return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
 }
}
