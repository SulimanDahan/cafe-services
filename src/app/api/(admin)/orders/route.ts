import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validations/order";
import { requireAuth } from "@/lib/auth";

/** GET all orders with item relation. Optionally filter by reservation_id via query param. */
export async function GET(request: Request) {
    if (!(await requireAuth())) return NextResponse.json({ error: "apiMessages.error.unauthorized" }, { status: 401 });
 try {
 const { searchParams } = new URL(request.url);
 const reservationId = searchParams.get("reservation_id");

 const orders = await prisma.order.findMany({
 where: reservationId ? { reservation_id: reservationId } : undefined,
 include: { item: true },
 orderBy: { created_at: "desc" },
 });
 return NextResponse.json(orders);
 } catch (error) {
 console.error("Error fetching orders:", error);
 return NextResponse.json({ error: "apiMessages.error.fetchOrdersFailed" }, { status: 500 });
 }
}

/** POST a new order */
export async function POST(request: Request) {
    if (!(await requireAuth())) return NextResponse.json({ error: "apiMessages.error.unauthorized" }, { status: 401 });
 try {
 const data = await request.json();
 const validation = orderSchema.safeParse(data);

 if (!validation.success) {
 return NextResponse.json(
 { error: validation.error.issues[0].message },
 { status: 400 }
 );
 }

 const validData = validation.data;

 // Fetch item price at time of order
 const item = await prisma.item.findUnique({ where: { id: validData.item_id } });
 if (!item) {
 return NextResponse.json({ error: "apiMessages.error.itemNotFound" }, { status: 404 });
 }

 const order = await prisma.order.create({
 data: {
 reservation_id: validData.reservation_id,
 item_id: validData.item_id,
 item_price: item.price,
 quantity: validData.quantity,
 },
 include: { item: true },
 });

 return NextResponse.json(order, { status: 201 });
 } catch (error) {
 console.error("Error creating order:", error);
 return NextResponse.json({ error: "apiMessages.error.createOrderFailed" }, { status: 500 });
 }
}
