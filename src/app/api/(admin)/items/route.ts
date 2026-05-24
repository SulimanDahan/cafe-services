import { itemSchema } from "@/lib/validations/item";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET paginated items with optional search and group filter */
export async function GET(request: Request) {
 try {
 const { searchParams } = new URL(request.url);
 const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
 const perPage = Math.max(1, parseInt(searchParams.get("per_page") || "10", 10));
 const search = searchParams.get("search") || "";
 const groupId = searchParams.get("group_id") || "";

 const where = {
 ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
 ...(groupId ? { group_id: groupId } : {}),
 };

 const [items, total] = await Promise.all([
 prisma.item.findMany({
 where,
 include: { group: true },
 orderBy: { created_at: "desc" },
 skip: (page - 1) * perPage,
 take: perPage,
 }),
 prisma.item.count({ where }),
 ]);

 return NextResponse.json({
 data: items,
 total,
 page,
 totalPages: Math.ceil(total / perPage),
 });
 } catch (error) {
 console.error("Error fetching items:", error);
 return NextResponse.json({ error: "apiMessages.error.fetchItemsFailed" }, { status: 500 });
 }
}

/** POST a new item */
export async function POST(request: Request) {
 try {
 const body = await request.json();
 const validation = itemSchema.safeParse(body);

 if (!validation.success) {
 return NextResponse.json(
 { error: "apiMessages.error.validationFailed", details: validation.error.format() },
 { status: 422 }
 );
 }

 const data = validation.data;

 const item = await prisma.item.create({
 data: {
 name: data.name,
 price: data.price ?? 0,
 group_id: data.group_id,
 is_disable: data.is_disable ?? false,
 },
 include: { group: true },
 });

 return NextResponse.json(item, { status: 201 });
 } catch (error: unknown) {
 console.error("Error creating item:", error);
 const err = error as { code?: string };
 if (err.code === "P2002") {
 return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 409 });
 }
 return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
 }
}
