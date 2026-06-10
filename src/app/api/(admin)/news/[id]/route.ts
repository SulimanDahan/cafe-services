import { newsSchema } from "@/lib/validations/news";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/** PUT to update a news item */
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
        const body = await request.json();
        // Allow partial updates
        const validation = newsSchema.partial().safeParse(body);

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
        const resolvedParams = await params;

        const newsItem = await prisma.news.update({
            where: { id: resolvedParams.id },
            data,
        });

        return NextResponse.json(newsItem);
    } catch (error: unknown) {
        console.error("Error updating news:", error);
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

/** DELETE a news item */
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
        await prisma.news.delete({
            where: { id: resolvedParams.id },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        console.error("Error deleting news:", error);
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
