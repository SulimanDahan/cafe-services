import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET all orders with item relation. Optionally filter by reservation_id via query param. */
export async function GET(request: Request) {
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
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

/** POST a new order */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (!data.reservation_id || !data.item_id || !data.quantity) {
            return NextResponse.json(
                { error: "reservation_id, item_id, and quantity are required" },
                { status: 400 }
            );
        }

        // Fetch item price at time of order
        const item = await prisma.item.findUnique({ where: { id: data.item_id } });
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        const order = await prisma.order.create({
            data: {
                reservation_id: data.reservation_id,
                item_id: data.item_id,
                item_price: item.price,
                quantity: data.quantity,
            },
            include: { item: true },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
