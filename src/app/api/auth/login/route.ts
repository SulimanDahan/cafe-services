import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import encryptPassword from "@/helpers/encrypters";
import arApiMessages from "@/translations/ar/api_messages";
import enApiMessages from "@/translations/en/api_messages";
import appLanguages from "@/config/app_languages";

export async function POST(request: NextRequest) {
	const { username, password } = await request.json();

	// Fetch settings for language and expiry
	const settings = await prisma.settings.findFirst();
	const messages =
		settings?.app_lang === appLanguages.en ? enApiMessages : arApiMessages;

	if (username && password) {
		const hashedPassword = encryptPassword(password);

		const user = await prisma.user.findFirst({
			where: {
				username,
				password: hashedPassword,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: messages.error.dataError },
				{ status: 401 },
			);
		}

		const sessionExpiryTime = settings?.session_expiry_minutes || 30;

		// Create session
		const session = await prisma.userSession.create({
			data: {
				userId: user.id,
				expiresAt: new Date(Date.now() + sessionExpiryTime * 60 * 1000),
			},
		});

		// Create session cookie
		const sessionCookie = `cafe_session=${session.id}; Path=/; Max-Age=${sessionExpiryTime * 60}; HttpOnly; Secure; SameSite=Lax`;

		// Set the session cookie in the response
		const response = NextResponse.json({
			success: true,
			data: { user },
		});
		response.headers.set("Set-Cookie", sessionCookie);
		return response;
	} else {
		return NextResponse.json(
			{ error: messages.error.dataError },
			{ status: 401 },
		);
	}
}
