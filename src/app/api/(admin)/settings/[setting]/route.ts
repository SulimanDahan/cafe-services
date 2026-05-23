import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSystemSettings } from "@/lib/settings";

/** PUT /api/settings/[setting] — update a settings record by ID */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ setting: string }> },
) {
	try {
		await params;
		const body = await request.json();

		console.log("[SETTINGS] PUT received body:", JSON.stringify(body));

		// Build the update payload — only include recognised fields that are actually present
		const data: Record<string, unknown> = {};
		if (body.currency_name !== undefined) data.currency_name = String(body.currency_name);
		if (body.app_lang !== undefined) data.app_lang = String(body.app_lang);
		if (body.per_page !== undefined) data.per_page = Number(body.per_page);
		if (body.notification_threshold !== undefined) data.notification_threshold = Number(body.notification_threshold);
		if (body.session_expiry_minutes !== undefined) data.session_expiry_minutes = Number(body.session_expiry_minutes);
		if (body.force_client_order_session_passKey !== undefined) data.force_client_order_session_passKey = Boolean(body.force_client_order_session_passKey);

		if (Object.keys(data).length === 0) {
			return NextResponse.json(
				{ error: "apiMessages.error.noValidSettings" },
				{ status: 422 }
			);
		}

		// Retrieve or create the singleton settings record to guarantee updates target the correct row
		const appSettings = await getSystemSettings();
		if (!appSettings) {
			console.error("[SETTINGS] PUT: getSystemSettings returned null");
			return NextResponse.json(
				{ error: "apiMessages.error.settingsNotFound" },
				{ status: 404 }
			);
		}

		console.log("[SETTINGS] PUT updating row:", appSettings.id, "with data:", JSON.stringify(data));

		const result = await prisma.settings.update({
			where: { id: appSettings.id },
			data,
		});

		console.log("[SETTINGS] PUT success — updated currency:", result.currency_name);

		// Force invalidation of layouts and pages cache to propagate the new configuration immediately
		revalidatePath("/", "layout");

		return NextResponse.json(result);
	} catch (error) {
		console.error("[SETTINGS] PUT error:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.serverError" },
			{ status: 500 },
		);
	}
}
