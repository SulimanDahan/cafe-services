import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createUserSchema } from "@/lib/validations/user";
import { requireAuth } from "@/lib/auth";
import encryptPassword from "@/helpers/encrypters";

/** GET paginated users with optional search */
export async function GET(request: Request) {
    if (!(await requireAuth()))
        return NextResponse.json(
            { error: "apiMessages.error.unauthorized" },
            { status: 401 },
        );
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const perPage = Math.max(
            1,
            parseInt(searchParams.get("per_page") || "10", 10),
        );
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
        return NextResponse.json(
            { error: "apiMessages.error.fetchUsersFailed" },
            { status: 500 },
        );
    }
}

/** POST a new user */
export async function POST(request: Request) {
    if (!(await requireAuth()))
        return NextResponse.json(
            { error: "apiMessages.error.unauthorized" },
            { status: 401 },
        );
    try {
        const data = await request.json();
        const validation = createUserSchema.safeParse(data);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const validData = validation.data;

        const newUser = await prisma.user.create({
            data: {
                username: validData.username,
                password: encryptPassword(validData.password), // Hash before storing
                is_admin: validData.is_admin ?? false,
                is_disable: validData.is_disable ?? false,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "apiMessages.error.usernameExists" },
                { status: 409 },
            );
        }
        return NextResponse.json(
            { error: "apiMessages.error.createUserFailed" },
            { status: 500 },
        );
    }
}
