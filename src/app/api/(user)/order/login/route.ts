import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { orderLoginSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const validation = orderLoginSchema.safeParse(body);
 if (!validation.success) {
 return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
 }

 const { room_id, qr_code, passkey } = validation.data;

 // Check if passkey is forced in settings
 const settings = await getSystemSettings();
 const appLang = settings?.app_lang ?? "ar";
 const forcePasskey = settings?.force_client_order_session_passKey ?? false;

 // Check passkey if it is forced in settings
 const checkPasskey = forcePasskey;

 if (checkPasskey && !passkey) {
 return NextResponse.json({ error: "apiMessages.error.passkeyRequired" }, { status: 422 });
 }

 let resolvedRoomId = room_id;
 let resolvedRoomName = "";

 if (!resolvedRoomId && qr_code) {
 const room = await prisma.room.findUnique({
 where: { qr_code: qr_code },
 });
 if (!room) {
 const isAr = appLang === "ar";
 const errorMsg = isAr 
 ? "رمز الـ QR غير صالح. لم يتم العثور على الغرفة."
 : "Invalid QR code. Room not found.";
 return NextResponse.json({ error: errorMsg }, { status: 404 });
 }
 if (room.is_disable) {
 const isAr = appLang === "ar";
 const errorMsg = isAr
 ? "هذه الغرفة/الطاولة غير مفعلة حالياً."
 : "This room/table is currently disabled.";
 return NextResponse.json({ error: errorMsg }, { status: 403 });
 }
 resolvedRoomId = room.id;
 resolvedRoomName = room.name;
 }

 // Get today's start and end date for localized checking
 const todayStart = new Date();
 todayStart.setHours(0, 0, 0, 0);
 const todayEnd = new Date();
 todayEnd.setHours(23, 59, 59, 999);

 if (!resolvedRoomId) {
 return NextResponse.json({ error: "apiMessages.error.roomRequired" }, { status: 400 });
 }

 const whereClause: {
 room_id: string;
 accepted: boolean;
 completed: boolean;
 date_time: { gte: Date; lte: Date };
 order_passkey?: number;
 } = {
 room_id: resolvedRoomId,
 accepted: true,
 completed: false,
 date_time: {
 gte: todayStart,
 lte: todayEnd,
 }
 };

 if (checkPasskey) {
 whereClause.order_passkey = Number(passkey);
 }

 const activeReservation = await prisma.reservation.findFirst({
 where: whereClause,
 include: {
 room: true
 }
 });

 if (!activeReservation) {
 const isAr = appLang === "ar";
 let errorMsg = "";
 if (checkPasskey) {
 errorMsg = isAr 
 ? "رمز التحقق غير صحيح أو لا يوجد حجز مؤكد نشط لهذه الطاولة اليوم."
 : "Invalid passkey or no active confirmed reservation for this table today.";
 } else {
 errorMsg = isAr
 ? "لا يوجد حجز مؤكد نشط لهذه الطاولة اليوم."
 : "No active confirmed reservation for this table today.";
 }
 return NextResponse.json({ error: errorMsg }, { status: 404 });
 }

 // Return session mapping room_name for frontend compatibility
 const session = {
 ...activeReservation,
 room_name: activeReservation.room?.name || resolvedRoomName
 };

 return NextResponse.json({ session });
 } catch (error: unknown) {
 const err = error as { message?: string };
 return NextResponse.json({ error: err.message }, { status: 500 });
 }
}
