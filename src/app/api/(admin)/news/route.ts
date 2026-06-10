import { newsSchema } from "@/lib/validations/news";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/** GET paginated news with optional search */
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
            parseInt(searchParams.get("per_page") || "10", 10),
        );
        const search = searchParams.get("search") || "";

        const where = search
            ? {
                  news_text: {
                      contains: search,
                      mode: "insensitive" as const,
                  },
              }
            : {};

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.news.count({ where }),
        ]);

        return NextResponse.json({
            data: news,
            total,
            page,
            totalPages: Math.ceil(total / perPage),
        });
    } catch (error) {
        console.error("Error fetching news:", error);
        return NextResponse.json(
            { error: "apiMessages.error.fetchFailed" },
            { status: 500 },
        );
    }
}

/** POST a new news item */
export async function POST(request: Request) {
    if (!(await requireAuth()))
        return NextResponse.json(
            { error: "apiMessages.error.unauthorized" },
            { status: 401 },
        );
    try {
        const body = await request.json();
        const validation = newsSchema.safeParse(body);

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

        const newsItem = await prisma.news.create({
            data: {
                news_text: data.news_text,
                start_date: data.start_date,
                end_date: data.end_date,
                is_disable: data.is_disable ?? false,
            },
        });

        return NextResponse.json(newsItem, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating news:", error);
        return NextResponse.json(
            { error: "apiMessages.error.createFailed" },
            { status: 500 },
        );
    }
}
