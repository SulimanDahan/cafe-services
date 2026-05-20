import { AUTH_COOKIE_NAME } from "@/config/constants";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/lib/i18n_server";

/** Check if the session is valid and return user data */
export async function GET(request: NextRequest) {
	const appSettings = await prisma.settings.findFirst();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	const authSession = request.cookies.get(AUTH_COOKIE_NAME);
	
	if (!authSession) {
		return NextResponse.json(
			{
				status: 401,
				success: false,
				message: t("apiMessages.error.unauthorized"),
			},
			{ status: 401 },
		);
	}

	try {
		// Find session in database
		const session = await prisma.userSession.findUnique({
			where: { id: authSession.value },
			include: { user: true },
		});

		if (!session || session.expires_at < new Date()) {
			return NextResponse.json(
				{
					status: 401,
					success: false,
					message: t("apiMessages.error.sessionExpired"),
				},
				{ status: 401 },
			);
		}

		return NextResponse.json({
			status: 200,
			success: true,
			data: {
				user: {
					id: session.user.id,
					username: session.user.username,
					is_admin: session.user.is_admin,
					is_disable: session.user.is_disable,
					created_at: session.user.created_at,
				}
			},
		});
	} catch (error) {
		console.error("Auth check failed:", error);
		return NextResponse.json(
			{
				status: 500,
				success: false,
				message: t("apiMessages.error.serverError"),
			},
			{ status: 500 },
		);
	}
}
