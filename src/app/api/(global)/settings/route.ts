import { NextResponse } from "next/server";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const appSettings = await getSystemSettings();

		return NextResponse.json(
			{
				success: true,
				data: appSettings,
			},
			{
				headers: {
					"Cache-Control": "no-store, max-age=0, must-revalidate",
				},
			},
		);
	} catch (error) {
		console.error("Error fetching settings:", error);
		const fallbackLocale = "ar";
		const { t } = getServerTranslations(fallbackLocale);
		return NextResponse.json(
			{
				success: false,
				message: t("apiMessages.error.serverError"),
			},
			{ status: 500 },
		);
	}
}
