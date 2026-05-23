import { itemGroupSchema } from "@/lib/validations/item_group";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET paginated item groups with optional search */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const perPage = Math.max(1, parseInt(searchParams.get("per_page") || "10", 10));
        const search = searchParams.get("search") || "";

        const where = search
            ? { name: { contains: search, mode: "insensitive" as const } }
            : {};

        const [groups, total] = await Promise.all([
            prisma.itemGroup.findMany({
                where,
                orderBy: { created_at: "desc" },
                include: { _count: { select: { items: true } } },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.itemGroup.count({ where }),
        ]);

        return NextResponse.json({
            data: groups,
            total,
            page,
            totalPages: Math.ceil(total / perPage),
        });
    } catch (error) {
        console.error("Error fetching item groups:", error);
        return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
    }
}

/** POST a new item group */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = itemGroupSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "apiMessages.error.validationFailed", details: validation.error.format() },
                { status: 422 }
            );
        }

        const data = validation.data;

        const group = await prisma.itemGroup.create({
            data: {
                name: data.name,
                is_disable: data.is_disable ?? false,
            },
        });

        return NextResponse.json(group, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating item group:", error);
        const err = error as { code?: string };
        if (err.code === "P2002") {
            return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 409 });
        }
        return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
    }
}
