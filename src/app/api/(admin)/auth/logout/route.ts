import { AUTH_COOKIE_NAME } from "@/config/constants";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Read the session ID directly from the HttpOnly cookie (not the body)
		const sessionId = request.cookies.get(AUTH_COOKIE_NAME)?.value;

		if (sessionId) {
			// Delete the session from the database (best-effort — ignore if already gone)
			await prisma.userSession
				.delete({ where: { id: sessionId } })
				.catch(() => null);
		}

		const isProduction = process.env.NODE_ENV === "production";

		// Clear the HttpOnly session cookie regardless of whether session existed
		const response = NextResponse.json({ message: "Logout successful" });
		response.cookies.set(AUTH_COOKIE_NAME, "", {
			httpOnly: true,
			secure: isProduction,
			sameSite: "lax",
			path: "/",
			maxAge: 0, // Expire immediately
		});

		return response;
	} catch (error) {
		console.error("[AUTH] Logout error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
