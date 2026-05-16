import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const settings = await prisma.settings.findFirst();

		if (!settings) {
			return NextResponse.json(
				{
					success: false,
					message: "Settings not found.",
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: settings,
		});
	} catch (error) {
		console.error("Error fetching settings:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error.",
			},
			{ status: 500 },
		);
	}
}
