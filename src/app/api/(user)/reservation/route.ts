import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/emitter";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";
import { reservationSchema } from "@/lib/validations/reservation";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = reservationSchema.safeParse(body);
        if (!validation.success) {
            console.error("Validation failed:", validation.error.format());
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { client_name, phone, room_id, date_time } = validation.data;

        let order_passkey = Math.floor(100000 + Math.random() * 900000);
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.reservation.findUnique({
                where: { order_passkey },
            });
            if (!existing) {
                isUnique = true;
            } else {
                order_passkey = Math.floor(100000 + Math.random() * 900000);
            }
        }

        const resDate = date_time ? new Date(date_time) : new Date();

        const result = await prisma.reservation.create({
            data: {
                client_name,
                phone,
                room_id,
                order_passkey,
                date_time: resDate,
                accepted: false,
                completed: false,
            },
            include: {
                room: true,
            },
        });

        const settings = await getSystemSettings();
        const appLang =
            settings?.app_lang === "ar" || !settings?.app_lang ? "ar" : "en";
        const { t } = getServerTranslations(appLang);

        const title = t("notifications.newBookingTitle");
        const message = t("notifications.newBookingMessage").replace(
            "{room}",
            result.room.name,
        );

        // Notify Admin
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
            },
        });
        notificationEmitter.emit("notification-created", notification);
        notificationEmitter.emit("new-reservation", result);

        return NextResponse.json({ success: true, reservation: result });
    } catch (error: unknown) {
        console.error("User reservation error:", error);
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
