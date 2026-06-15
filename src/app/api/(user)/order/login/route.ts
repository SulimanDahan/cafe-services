import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { orderLoginSchema } from "@/lib/validations/auth";
import { getServerTranslations } from "@/lib/i18n_server";
import { ORDER_COOKIE_NAME } from "@/config/constants";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const validation = orderLoginSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.issues[0].message },
				{ status: 400 },
			);
		}

		const { room_id, qr_code, passkey } = validation.data;

		// Check if passkey is forced in settings
		const settings = await getSystemSettings();
		const appLang =
			settings?.app_lang === "ar" || !settings?.app_lang ? "ar" : "en";
		const { t } = getServerTranslations(appLang);

		const forcePasskey =
			settings?.force_client_order_session_passKey ?? false;

		// Check passkey if it is forced in settings
		const checkPasskey = forcePasskey;

		if (checkPasskey && !passkey) {
			return NextResponse.json(
				{ error: t("apiMessages.error.passkeyRequired") },
				{ status: 422 },
			);
		}

		let resolvedRoomId = room_id;
		let resolvedRoomName = "";

		if (!resolvedRoomId && qr_code) {
			const room = await prisma.room.findUnique({
				where: { qr_code: qr_code.trim().toLowerCase() },
			});
			if (!room) {
				return NextResponse.json(
					{ error: t("apiMessages.error.invalidQrCode") },
					{ status: 404 },
				);
			}
			if (room.is_disable) {
				return NextResponse.json(
					{ error: t("apiMessages.error.roomDisabled") },
					{ status: 403 },
				);
			}
			resolvedRoomId = room.id;
			resolvedRoomName = room.name;
		}

		if (!resolvedRoomId) {
			return NextResponse.json(
				{ error: t("apiMessages.error.roomRequired") },
				{ status: 400 },
			);
		}

		const whereClause: {
			room_id: string;
			accepted: boolean;
			activated: boolean;
			completed: boolean;
			order_passkey?: number;
		} = {
			room_id: resolvedRoomId,
			accepted: true,
			activated: true,
			completed: false,
		};

		if (checkPasskey) {
			whereClause.order_passkey = Number(passkey);
		}

		const activeReservation = await prisma.reservation.findFirst({
			where: whereClause,
			include: {
				room: true,
			},
		});

		if (!activeReservation) {
			const pendingReservation = await prisma.reservation.findFirst({
				where: {
					room_id: resolvedRoomId,
					accepted: false,
					completed: false,
				},
			});

			if (pendingReservation) {
				return NextResponse.json(
					{ error: t("apiMessages.error.pendingReservation") },
					{ status: 403 },
				);
			}

			const errorMsg = checkPasskey
				? t("apiMessages.error.reservationNotActivated")
				: t("apiMessages.error.noActivatedReservation");
			return NextResponse.json({ error: errorMsg }, { status: 404 });
		}

		// Compute client session expiry based on settings
		const clientExpiryMinutes =
			settings?.client_session_expiry_minutes ?? 360;
		const sessionExpiresAt = new Date(
			Date.now() + clientExpiryMinutes * 60 * 1000,
		);

		const session = {
			...activeReservation,
			room_name: activeReservation.room?.name || resolvedRoomName,
			session_expires_at: sessionExpiresAt.toISOString(),
		};

		const isProduction = process.env.NODE_ENV === "production";

		// Set HttpOnly cookie with the reservation ID (server-side session, like admin)
		const response = NextResponse.json({ session });
		response.cookies.set(ORDER_COOKIE_NAME, activeReservation.id, {
			httpOnly: true,
			secure:
				isProduction && process.env.ALLOW_INSECURE_COOKIES !== "true",
			sameSite: "lax",
			path: "/",
			maxAge: clientExpiryMinutes * 60,
		});
		return response;
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
