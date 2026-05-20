/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/emitter";
import { getServerTranslations } from "@/lib/i18n_server";

export async function POST(req: NextRequest) {
	const appSettings = await prisma.settings.findFirst();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	try {
		const body = await req.json();
		const { title, message, type = "info" } = body;

		if (!title || !message) {
			return NextResponse.json(
				{ error: t("apiMessages.error.missingFields") },
				{ status: 400 },
			);
		}

		const notification = await prisma.notification.create({
			data: {
				title,
				message,
			},
		});

		// Emit event to all SSE streams
		notificationEmitter.emit("notification-created", { ...notification, type });

		return NextResponse.json({ success: true, notification });
	} catch (error: any) {
		console.error("Error creating notification:", error);
		return NextResponse.json(
			{ error: error.message || t("apiMessages.error.serverError") },
			{ status: 500 },
		);
	}
}

// Add GET handler for easy testing from a browser URL!
export async function GET(req: NextRequest) {
	const appSettings = await prisma.settings.findFirst();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	try {
		const { searchParams } = new URL(req.url);
		const title = searchParams.get("title") || "New Order!";
		const message = searchParams.get("message") || "A new order has been received.";
		const type = searchParams.get("type") || "info";

		const notification = await prisma.notification.create({
			data: {
				title,
				message,
			},
		});

		// Emit event to all SSE streams
		notificationEmitter.emit("notification-created", { ...notification, type });

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
