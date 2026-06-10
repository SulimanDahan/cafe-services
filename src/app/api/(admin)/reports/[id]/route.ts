import { reportSchema } from "@/lib/validations/report";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const resolvedParams = await params;
		const body = await request.json();

		// Use partial for updates since we might just want to update `is_read`
		const validation = reportSchema.partial().safeParse(body);

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

		const reportItem = await prisma.clientReports.update({
			where: { id: resolvedParams.id },
			data: {
				...(data.message_text && { message_text: data.message_text }),
				...(data.reservation_id && {
					reservation_id: data.reservation_id,
				}),
				...(typeof data.is_read !== "undefined" && {
					is_read: data.is_read,
				}),
			},
		});

		return NextResponse.json(reportItem);
	} catch (error: unknown) {
		console.error("Error updating report:", error);
		const err = error as { code?: string };
		if (err.code === "P2025") {
			return NextResponse.json(
				{ error: "apiMessages.error.notFound" },
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{ error: "apiMessages.error.updateFailed" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	if (!(await requireAuth()))
		return NextResponse.json(
			{ error: "apiMessages.error.unauthorized" },
			{ status: 401 },
		);
	try {
		const resolvedParams = await params;
		await prisma.clientReports.delete({
			where: { id: resolvedParams.id },
		});
		return new NextResponse(null, { status: 204 });
	} catch (error: unknown) {
		console.error("Error deleting report:", error);
		const err = error as { code?: string };
		if (err.code === "P2025") {
			return NextResponse.json(
				{ error: "apiMessages.error.notFound" },
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{ error: "apiMessages.error.deleteFailed" },
			{ status: 500 },
		);
	}
}
