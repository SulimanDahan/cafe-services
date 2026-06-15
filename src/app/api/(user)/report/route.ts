import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_COOKIE_NAME } from "@/config/constants";
import { notificationEmitter } from "@/lib/emitter";
import { getSystemSettings } from "@/lib/settings";
import { getServerTranslations } from "@/lib/i18n_server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}));
		const { message_text, reservation_id } = body;

		const reservationId = req.cookies.get(ORDER_COOKIE_NAME)?.value || reservation_id;

		if (!reservationId) {
			return NextResponse.json(
				{ error: "apiMessages.error.unauthorized" },
				{ status: 401 },
			);
		}

		// Verify the customer session is active
		const reservation = await prisma.reservation.findUnique({
			where: { id: reservationId },
			include: { room: true },
		});

		if (
			!reservation ||
			!reservation.accepted ||
			!reservation.activated ||
			reservation.completed
		) {
			return NextResponse.json(
				{ error: "apiMessages.error.sessionExpired" },
				{ status: 403 },
			);
		}

		if (
			!message_text ||
			typeof message_text !== "string" ||
			!message_text.trim()
		) {
			return NextResponse.json(
				{ error: "validation.messageRequired" },
				{ status: 400 },
			);
		}

		// Create the client report in the database
		const report = await prisma.clientReports.create({
			data: {
				message_text: message_text.trim(),
				reservation_id: reservation.id,
				is_read: false,
			},
		});

		// Create and emit notification for the Admin dashboard
		const settings = await getSystemSettings();
		const appLang =
			settings?.app_lang === "ar" || !settings?.app_lang ? "ar" : "en";
		const { t } = getServerTranslations(appLang);

		const title = t("notifications.newReportTitle");
		const message = t("notifications.newReportMessage")
			.replace("{room}", reservation.room.name)
			.replace(
				"{message}",
				`${message_text.trim().substring(0, 50)}${message_text.trim().length > 50 ? "..." : ""}`,
			);

		const notification = await prisma.notification.create({
			data: {
				title,
				message,
			},
		});

		notificationEmitter.emit("notification-created", notification);
		notificationEmitter.emit("new-report", report);

		return NextResponse.json(
			{ success: true, data: report },
			{ status: 201 },
		);
	} catch (error: unknown) {
		console.error("Error creating user report:", error);
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
