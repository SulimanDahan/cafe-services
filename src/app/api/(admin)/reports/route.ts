import { reportSchema } from "@/lib/validations/report";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

/** GET paginated reports with optional search and reservation filter */
export async function GET(request: Request) {
	if (!(await requireAuth())) {
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
		const perPage = Math.max(
			1,
			parseInt(searchParams.get("per_page") || "100", 10), // Allow fetching more reports per page since we want them by reservation
		);
		const search = searchParams.get("search") || "";
		const reservationId = searchParams.get("reservation_id");

		const where: Prisma.clientReportsWhereInput = {};

		if (search) {
			where.message_text = {
				contains: search,
				mode: "insensitive",
			};
		}

		if (reservationId) {
			where.reservation_id = reservationId;
		}

		const [reports, total] = await Promise.all([
			prisma.clientReports.findMany({
				where,
				orderBy: { created_at: "desc" },
				skip: (page - 1) * perPage,
				take: perPage,
				include: {
					reservation: true,
				},
			}),
			prisma.clientReports.count({ where }),
		]);

		return NextResponse.json({
			data: reports,
			total,
			page,
			totalPages: Math.ceil(total / perPage),
		});
	} catch (error) {
		console.error("Error fetching reports:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.fetchFailed" },
			{ status: 500 },
		);
	}
}

/** POST a new report */
export async function POST(request: Request) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const body = await request.json();
		const validation = reportSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "apiMessages.error.validationFailed",
					details: validation.error.format(),
				},
				{ status: 422 },
			);
		}

		const data = validation.data;

		const reportItem = await prisma.clientReports.create({
			data: {
				message_text: data.message_text,
				is_read: data.is_read ?? false,
				reservation_id: data.reservation_id,
			},
		});

		return NextResponse.json(reportItem, { status: 201 });
	} catch (error: unknown) {
		console.error("Error creating report:", error);
		return NextResponse.json(
			{ error: "apiMessages.error.createFailed" },
			{ status: 500 },
		);
	}
}
