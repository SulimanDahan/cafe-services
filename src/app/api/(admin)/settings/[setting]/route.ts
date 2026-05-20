import { settingsSchema } from "@/lib/validations/settings";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** PUT /api/settings/[setting] — update a settings record by ID */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ setting: string }> },
) {
	try {
		const { setting: settingId } = await params;
		const body = await request.json();
		const validation = settingsSchema.partial().safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: validation.error.format() },
				{ status: 422 }
			);
		}

		const data = validation.data;

		const result = await prisma.settings.update({
			where: { id: settingId },
			data,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("[SETTINGS] PUT error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
