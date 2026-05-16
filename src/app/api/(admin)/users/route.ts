import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET all users
 */
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { created_at: "desc" },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

/**
 * POST a new user
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Basic validation
        if (!data.username || !data.password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                password: data.password, // Note: In a real app, hash this!
                is_admin: data.is_admin ?? false,
                is_disable: data.is_disable ?? false,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Error creating user:", error);
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Username already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}

