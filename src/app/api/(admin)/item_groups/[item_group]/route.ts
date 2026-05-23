import { itemGroupSchema } from "@/lib/validations/item_group";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ item_group: string }> };

/** GET a specific item group */
export async function GET(_req: Request, { params }: Params) {
    try {
        const { item_group: id } = await params;
        const group = await prisma.itemGroup.findUnique({
            where: { id },
            include: { _count: { select: { items: true } } },
        });
        if (!group) return NextResponse.json({ error: "apiMessages.error.notFound" }, { status: 404 });
        return NextResponse.json(group);
    } catch (error) {
        console.error("Error fetching item group:", error);
        return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
    }
}

/** PUT (full update) a specific item group */
export async function PUT(request: Request, { params }: Params) {
    try {
        const { item_group: id } = await params;
        const body = await request.json();
        const validation = itemGroupSchema.partial().safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "apiMessages.error.validationFailed", details: validation.error.format() },
                { status: 422 }
            );
        }

        const data = validation.data;

        const updated = await prisma.itemGroup.update({
            where: { id },
            data: {
                name: data.name,
                is_disable: data.is_disable,
            },
        });

        return NextResponse.json(updated);
    } catch (error: unknown) {
        console.error("Error updating item group:", error);
        const err = error as { code?: string };
        if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.notFound" }, { status: 404 });
        return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
    }
}

/** DELETE a specific item group */
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const { item_group: id } = await params;
        await prisma.itemGroup.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error deleting item group:", error);
        const err = error as { code?: string };
        if (err.code === "P2025") return NextResponse.json({ error: "apiMessages.error.notFound" }, { status: 404 });
        if (err.code === "P2003") return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 409 });
        return NextResponse.json({ error: "apiMessages.error.serverError" }, { status: 500 });
    }
}