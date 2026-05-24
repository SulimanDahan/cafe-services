import { roomSchema } from "@/lib/validations/room";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET paginated rooms with optional search */
export async function GET(request: Request) {
 try {
 const { searchParams } = new URL(request.url);
 const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
 const perPage = Math.max(1, parseInt(searchParams.get("per_page") || "10", 10));
 const search = searchParams.get("search") || "";
 // If fetch_all=true skip pagination (used by reservation/order pages for room dropdowns)
 const fetchAll = searchParams.get("fetch_all") === "true";

 const where = search
 ? {
 OR: [
 { name: { contains: search, mode: "insensitive" as const } },
 { qr_code: { contains: search, mode: "insensitive" as const } },
 ],
 }
 : {};

 if (fetchAll) {
 const rooms = await prisma.room.findMany({ orderBy: { created_at: "desc" } });
 return NextResponse.json({ data: rooms, total: rooms.length, page: 1, totalPages: 1 });
 }

 const [rooms, total] = await Promise.all([
 prisma.room.findMany({
 where,
 orderBy: { created_at: "desc" },
 skip: (page - 1) * perPage,
 take: perPage,
 }),
 prisma.room.count({ where }),
 ]);

 return NextResponse.json({
 data: rooms,
 total,
 page,
 totalPages: Math.ceil(total / perPage),
 });
 } catch (error) {
 console.error("Error fetching rooms:", error);
 return NextResponse.json({ error: "apiMessages.error.fetchRoomsFailed" }, { status: 500 });
 }
}

/** POST a new room */
export async function POST(request: Request) {
 try {
 const body = await request.json();
 const validation = roomSchema.safeParse(body);

 if (!validation.success) {
 return NextResponse.json(
 { error: "apiMessages.error.validationFailed", details: validation.error.format() },
 { status: 422 }
 );
 }

 const data = validation.data;

 const room = await prisma.room.create({
 data: {
 name: data.name,
 qr_code: data.qr_code,
 is_disable: data.is_disable ?? false,
 },
 });

 return NextResponse.json(room, { status: 201 });
 } catch (error: unknown) {
 console.error("Error creating room:", error);
 const err = error as { code?: string };
 if (err.code === "P2002") {
 return NextResponse.json(
 { error: "apiMessages.error.roomExists" },
 { status: 409 }
 );
 }
 return NextResponse.json({ error: "apiMessages.error.createRoomFailed" }, { status: 500 });
 }
}
