import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import encryptPassword from "@/helpers/encrypters";
import arApiMessages from "@/translations/ar/api_messages";
import enApiMessages from "@/translations/en/api_messages";
import appLanguages from "@/config/app_languages";
import { SessionModel } from "@/models/data_models/session_model";
import { AUTH_COOKIE_NAME } from "@/config/constants";
import { getSystemSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();
		console.log(`[AUTH] Login attempt for user: ${username}`);

		// Fetch settings for language and expiry
		const settings = await getSystemSettings();
		const messages =
			settings?.app_lang === appLanguages.en ? enApiMessages : arApiMessages;

		if (username && password) {
			const hashedPassword = encryptPassword(password);
			console.log(`[AUTH] Hashed password attempt: ${hashedPassword}`);

			const user = await prisma.user.findFirst({
				where: {
					username,
					password: hashedPassword,
				},
			});

			if (!user) {
				console.log(`[AUTH] Login FAILED for user: ${username} (User not found or password mismatch)`);
				return NextResponse.json(
					{ error: messages.error.dataError },
					{ status: 401 },
				);
			}

			console.log(`[AUTH] Login SUCCESS for user: ${username} (ID: ${user.id})`);

			const sessionExpiryTime = settings?.session_expiry_minutes || 30;

			// Create session
			const session = await prisma.userSession.create({
				data: {
					userId: user.id,
					expires_at: new Date(Date.now() + sessionExpiryTime * 60 * 1000),
				},
			});

			const isProduction = process.env.NODE_ENV === "production";

			// Set the session cookie in the response
			const response = NextResponse.json({
				success: true,
				data: {
					username: user.username,
					id: session.id,
					expires_at: session.expires_at,
				} as SessionModel,
			});

			// Use HttpOnly cookie — omit Secure in dev so HTTP (Docker) works without HTTPS
			response.cookies.set(AUTH_COOKIE_NAME, session.id, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "lax",
				path: "/",
				maxAge: sessionExpiryTime * 60,
			});

			return response;
		} else {
			return NextResponse.json(
				{ error: messages.error.dataError },
				{ status: 401 },
			);
		}
	} catch (error) {
		console.error("[AUTH] Login error:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.serverError" },
			{ status: 500 },
		);
	}
}
