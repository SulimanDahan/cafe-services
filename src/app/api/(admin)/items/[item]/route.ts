import { itemSchema } from "@/lib/validations/item";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ item: string }> };

/** GET a specific item */
export async function GET(_req: Request, { params }: Params) {
 try {
 const { item: id } = await params;
 const item = await prisma.item.findUnique({
 where: { id },
 include: { group: true },
 });
 if (!item) return NextResponse.json({ error: "apiMessages.error.itemNotFound" }, { status: 404 });
 return NextResponse.json(item);
 } catch (error) {
 console.error("Error fetching item:", error);
 return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
 }
}

/** PUT (full update) a specific item */
export async function PUT(request: Request, { params }: Params) {
 try {
 const { item: id } = await params;
 const body = await request.json();
 const validation = itemSchema.partial().safeParse(body);

 if (!validation.success) {
 return NextResponse.json(
 { error: "apiMessages.error.validationFailed", details: validation.error.format() },
 { status: 422 }
 );
 }

 const data = validation.data;

 const updated = await prisma.item.update({
 where: { id },
 data: {
 name: data.name,
 price: data.price,
 group_id: data.group_id,
 is_disable: data.is_disable,
 },
 include: { group: true },
 });

 return NextResponse.json(updated);
 } catch (error: unknown) {
 console.error("Error updating item:", error);
 const err = error as { code?: string };
 if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.itemNotFound" }, { status: 404 });
 return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
 }
}

/** DELETE a specific item */
export async function DELETE(_req: Request, { params }: Params) {
 try {
 const { item: id } = await params;

 const ordersCount = await prisma.order.count({
 where: { item_id: id }
 });

 if (ordersCount > 0) {
 return NextResponse.json(
 { error: "apiMessages.error.itemHasOrders" },
 { status: 400 }
 );
 }

 await prisma.item.delete({ where: { id } });
 return NextResponse.json({ success: true });
 } catch (error: unknown) {
 console.error("Error deleting item:", error);
 const err = error as { code?: string };
 if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.itemNotFound" }, { status: 404 });
 return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
 }
}
