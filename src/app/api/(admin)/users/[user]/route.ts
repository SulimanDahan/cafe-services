import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { userSchema } from "@/lib/validations/user";

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
 return NextResponse.json({ error: "apiMessages.error.userNotFound" }, { status: 404 });
 }

 return NextResponse.json(user);
 } catch (error) {
 console.error("Error fetching user:", error);
 return NextResponse.json({ error: "apiMessages.error.fetchUserFailed" }, { status: 500 });
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
 const validation = userSchema.partial().safeParse(data);

 if (!validation.success) {
 return NextResponse.json(
 { error: validation.error.issues[0].message },
 { status: 400 }
 );
 }

 const validData = validation.data;

 const updatedUser = await prisma.user.update({
 where: { id: userId },
 data: {
 username: validData.username,
 password: validData.password, // Only if provided
 is_admin: validData.is_admin,
 is_disable: validData.is_disable,
 },
 });

 return NextResponse.json(updatedUser);
 } catch (error) {
 console.error("Error updating user:", error);
 if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
 return NextResponse.json({ error: "apiMessages.error.userNotFound" }, { status: 404 });
 }
 return NextResponse.json({ error: "apiMessages.error.updateUserFailed" }, { status: 500 });
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
 return NextResponse.json({ error: "apiMessages.error.userNotFound" }, { status: 404 });
 }
 return NextResponse.json({ error: "apiMessages.error.deleteUserFailed" }, { status: 500 });
 }
}
