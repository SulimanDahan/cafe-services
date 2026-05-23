import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET paginated users with optional search */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const perPage = Math.max(1, parseInt(searchParams.get("per_page") || "10", 10));
        const search = searchParams.get("search") || "";

        const where = search
            ? { username: { contains: search, mode: "insensitive" as const } }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { created_at: "desc" },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            data: users,
            total,
            page,
            totalPages: Math.ceil(total / perPage),
        });
    } catch {
        return NextResponse.json({ error: "apiMessages.error.fetchUsersFailed" }, { status: 500 });
    }
}

/** POST a new user */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        if (!data.username || !data.password) {
            return NextResponse.json(
                { error: "apiMessages.error.userPassRequired" },
                { status: 400 }
            );
        }

        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                password: data.password,
                is_admin: data.is_admin ?? false,
                is_disable: data.is_disable ?? false,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return NextResponse.json({ error: "apiMessages.error.usernameExists" }, { status: 409 });
        }
        return NextResponse.json({ error: "apiMessages.error.createUserFailed" }, { status: 500 });
    }
}
