import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerTranslations } from "@/lib/i18n_server";

export async function GET() {
	const appSettings = await prisma.settings.findFirst();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	try {
		if (!appSettings) {
			return NextResponse.json(
				{
					success: false,
					message: t("apiMessages.error.settingsNotFound"),
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: appSettings,
		});
	} catch (error) {
		console.error("Error fetching settings:", error);
		return NextResponse.json(
			{
				success: false,
				message: t("apiMessages.error.serverError"),
			},
			{ status: 500 },
		);
	}
}
