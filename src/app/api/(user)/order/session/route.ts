import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_COOKIE_NAME } from "@/config/constants";

/**
 * Returns the active client session from the HttpOnly order cookie.
 * Verifies the reservation is still active and not completed.
 */
export async function GET(req: NextRequest) {
	try {
		const reservationId = req.cookies.get(ORDER_COOKIE_NAME)?.value;

		if (!reservationId) {
			return NextResponse.json({ session: null }, { status: 401 });
		}

		const reservation = await prisma.reservation.findUnique({
			where: { id: reservationId },
			include: { room: true },
		});

		// Reject if reservation doesn't exist, isn't active, or has been completed
		if (
			!reservation ||
			!reservation.accepted ||
			!reservation.activated ||
			reservation.completed
		) {
			const response = NextResponse.json(
				{ session: null, sessionExpired: true },
				{ status: 401 },
			);
			// Clear stale cookie
			response.cookies.set(ORDER_COOKIE_NAME, "", {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "true",
				sameSite: "lax",
				path: "/",
				maxAge: 0,
			});
			return response;
		}

		const session = {
			id: reservation.id,
			number: reservation.number,
			client_name: reservation.client_name,
			phone: reservation.phone,
			room_id: reservation.room_id,
			room_name: reservation.room?.name || "",
			accepted: reservation.accepted,
		};

		return NextResponse.json({ session });
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
