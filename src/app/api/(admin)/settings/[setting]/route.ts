import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSystemSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validations/settings";

/** PUT /api/settings/[setting] — update a settings record by ID */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ setting: string }> },
) {
	try {
		await params;
		const body = await request.json();

		console.log("[SETTINGS] PUT received body:", JSON.stringify(body));

		const validation = settingsSchema.partial().safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.issues[0].message },
				{ status: 400 }
			);
		}

		const data = validation.data;

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
