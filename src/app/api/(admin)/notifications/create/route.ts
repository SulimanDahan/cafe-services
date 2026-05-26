/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/emitter";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";
import { requireAuth } from "@/lib/auth";

// Add GET handler for easy testing from a browser URL!
export async function GET(req: NextRequest) {
    if (!(await requireAuth())) return NextResponse.json({ error: "apiMessages.error.unauthorized" }, { status: 401 });
	const appSettings = await getSystemSettings();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	try {
		const { searchParams } = new URL(req.url);
		const title = searchParams.get("title") || "New Order!";
		const message = searchParams.get("message") || "A new order has been received.";
		const notification = await prisma.notification.create({
			data: {
				title,
				message,
			},
		});

		// Emit event to all SSE streams
		notificationEmitter.emit("notification-created", notification);

		return NextResponse.json({
			success: true,
			message: t("apiMessages.success.notificationCreated"),
			notification,
		});
	} catch (error: any) {
		console.error("Error creating notification via GET:", error);
		return NextResponse.json(
			{ error: error.message || t("apiMessages.error.serverError") },
			{ status: 500 },
		);
	}
}
