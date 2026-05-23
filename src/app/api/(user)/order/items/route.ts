import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET dynamic list of active menu items and groups for customer ordering.
 */
export async function GET() {
    try {
        const [items, groups] = await Promise.all([
            prisma.item.findMany({
                where: {
                    is_disable: false,
                    group: {
                        is_disable: false
                    }
                },
                include: { group: true },
                orderBy: { name: "asc" },
            }),
            prisma.itemGroup.findMany({
                where: {
                    is_disable: false,
                    items: {
                        some: {
                            is_disable: false
                        }
                    }
                },
                orderBy: { name: "asc" },
            }),
        ]);

        return NextResponse.json({ items, groups });
    } catch (error) {
        console.error("Error fetching customer menu items:", error);
        return NextResponse.json({ error: "apiMessages.error.fetchItemsFailed" }, { status: 500 });
    }
}
