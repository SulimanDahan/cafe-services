/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { notificationEmitter } from "@/lib/emitter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Establishes a persistent Server-Sent Events (SSE) connection.
 * Sends the 20 most recent notifications on connect and streams new updates in real-time.
 *
 * @param req - The incoming NextRequest instance.
 * @returns A streaming HTTP Response with appropriate SSE headers.
 */
export async function GET(req: NextRequest) {
	const responseStream = new TransformStream();
	const writer = responseStream.writable.getWriter();
	const encoder = new TextEncoder();

	// Helper function to format and send SSE events
	const sendEvent = (event: string, data: any) => {
		try {
			writer.write(
				encoder.encode(
					`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
				),
			);
		} catch (err) {
			console.error("Error writing to stream:", err);
		}
	};

	// 1. Send all existing unread/recent notifications as an initial sync
	try {
		const recentNotifications = await prisma.notification.findMany({
			orderBy: { createdAt: "desc" },
			take: 20,
		});
		sendEvent("initial-notifications", recentNotifications);
	} catch (dbError) {
		console.error(
			"Failed to fetch initial notifications from DB:",
			dbError,
		);
		// Even if database fails initially (e.g., table not created yet), keep the connection open
		sendEvent("initial-notifications", []);
	}

	// 2. Event listener for real-time notifications
	const onNotificationCreated = (notification: any) => {
		sendEvent("new-notification", notification);
	};

	notificationEmitter.on("notification-created", onNotificationCreated);

	// 3. Keep Connection Alive (Ping)
	const pingInterval = setInterval(() => {
		try {
			writer.write(encoder.encode(": ping\n\n"));
		} catch (err) {
			console.error("Failed sending ping:", err);
		}
	}, 20000); // Send ping every 20 seconds

	// Clean up on client disconnect
	const cleanup = () => {
		clearInterval(pingInterval);
		notificationEmitter.off("notification-created", onNotificationCreated);
		try {
			writer.close();
		} catch {
			// Stream might already be closed
		}
	};

	req.signal.addEventListener("abort", () => {
		cleanup();
	});

	return new Response(responseStream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}
