import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
    params: Promise<{ user: string }>;
}

/**
 * GET a specific user
 */
export async function GET(
    request: Request,
    context: RouteContext
) {
    try {
        const { user: userId } = await context.params;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

/**
 * PUT (update) a specific user
 */
export async function PUT(
    request: Request,
    context: RouteContext
) {
    try {
        const { user: userId } = await context.params;
        const data = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username: data.username,
                password: data.password, // Only if provided
                is_admin: data.is_admin,
                is_disable: data.is_disable,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

/**
 * DELETE a specific user
 */
export async function DELETE(
    request: Request,
    context: RouteContext
) {
    try {
        const { user: userId } = await context.params;
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
