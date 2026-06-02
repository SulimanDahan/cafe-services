/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { notificationEmitter } from "@/lib/emitter";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Establishes a persistent Server-Sent Events (SSE) connection.
 * Sends the 20 most recent notifications on connect and streams new updates in real-time.
 *
 * @param req - The incoming NextRequest instance.
 * @returns A streaming HTTP Response with appropriate SSE headers.
 */
export async function GET(req: NextRequest) {
    if (!(await requireAuth())) return new Response("Unauthorized", { status: 401 });
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

	// 1. Send only unread notifications as an initial sync
	try {
		const recentNotifications = await prisma.notification.findMany({
			where: { read: false },
			orderBy: { created_at: "desc" },
			take: 50,
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

	const onNotificationCreated = (notification: any) => {
		sendEvent("new-notification", notification);
	};
	const onNewReservation = (res: any) => sendEvent("new-reservation", res);
	const onNewOrder = (order: any) => sendEvent("new-order", order);
	const onOrderDeleted = (orderId: any) => sendEvent("order-deleted", orderId);

	notificationEmitter.on("notification-created", onNotificationCreated);
	notificationEmitter.on("new-reservation", onNewReservation);
	notificationEmitter.on("new-order", onNewOrder);
	notificationEmitter.on("order-deleted", onOrderDeleted);

	// 3. Keep Connection Alive (Ping)
	const pingInterval = setInterval(() => {
		try {
			writer.write(encoder.encode(": ping\n\n"));
		} catch (err) {
			console.error("Failed sending ping:", err);
		}
	}, 20000); // Send ping every 20 seconds

	const cleanup = () => {
		clearInterval(pingInterval);
		notificationEmitter.off("notification-created", onNotificationCreated);
		notificationEmitter.off("new-reservation", onNewReservation);
		notificationEmitter.off("new-order", onNewOrder);
		notificationEmitter.off("order-deleted", onOrderDeleted);
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
			"Cache-Control": "no-cache, no-",
			Connection: "keep-alive",
		},
	});
}
