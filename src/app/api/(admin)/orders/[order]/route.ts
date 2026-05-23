import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ order: string }> };

/** GET a specific order with item relation */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { order: id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: { item: true },
        });
        if (!order) return NextResponse.json({ error: "apiMessages.error.orderNotFound" }, { status: 404 });
        return NextResponse.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ error: "apiMessages.error.fetchOrderFailed" }, { status: 500 });
    }
}

/** DELETE a specific order */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { order: id } = await params;
        await prisma.order.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error deleting order:", error);
        const err = error as { code?: string };
        if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.orderNotFound" }, { status: 404 });
        return NextResponse.json({ error: "apiMessages.error.deleteOrderFailed" }, { status: 500 });
    }
}

/** PATCH/PUT to update an order (e.g., mark as accepted) */
export async function PATCH(request: Request, { params }: Params) {
    try {
        const { order: id } = await params;
        const body = await request.json();

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                accepted: body.accepted !== undefined ? body.accepted : undefined,
            } as unknown as never,
            include: { item: true },
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "apiMessages.error.updateOrderFailed" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: Params) {
    return PATCH(request, { params });
}