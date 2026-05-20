import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET paginated notifications with optional search */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const perPage = Math.max(1, parseInt(searchParams.get("per_page") || "10", 10));
        const search = searchParams.get("search") || "";

        const where = search
            ? {
                  OR: [
                      { title: { contains: search, mode: "insensitive" as const } },
                      { message: { contains: search, mode: "insensitive" as const } },
                  ],
              }
            : {};

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.notification.count({ where }),
        ]);

        return NextResponse.json({
            data: notifications,
            total,
            page,
            totalPages: Math.ceil(total / perPage),
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await prisma.notification.deleteMany();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
    }
}
