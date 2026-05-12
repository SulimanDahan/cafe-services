import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationEmitter } from "@/lib/emitter";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { title, message } = body;

		if (!title || !message) {
			return NextResponse.json(
				{ error: "Missing title or message" },
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
		notificationEmitter.emit("notification-created", notification);

		return NextResponse.json({ success: true, notification });
	} catch (error: any) {
		console.error("Error creating notification:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}

// Add GET handler for easy testing from a browser URL!
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const title = searchParams.get("title") || "New Order!";
		const message =
			searchParams.get("message") || "A new order has been received.";

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
			message: "Notification created and broadcasted!",
			notification,
		});
	} catch (error: any) {
		console.error("Error creating notification via GET:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
