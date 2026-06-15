import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const now = new Date();
		now.setHours(0, 0, 0, 0); // Ignore time to keep showing the news throughout the end_date

		// Auto-disable expired news
		await prisma.news.updateMany({
			where: {
				is_disable: false,
				end_date: { lt: now },
			},
			data: {
				is_disable: true,
			},
		});

		const news = await prisma.news.findMany({
			where: {
				is_disable: false,
				start_date: { lte: now }, // start date should still compare with exact current time if needed, or we can use the zeroed 'now'. Let's use 'new Date()' for precise start
				end_date: { gte: now },
			},
			orderBy: { created_at: "desc" },
		});
		return NextResponse.json({ success: true, data: news });
	} catch (error: unknown) {
		const err = error as { message?: string };
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
