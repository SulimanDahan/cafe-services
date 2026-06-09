import { NextResponse } from "next/server";
import { ORDER_COOKIE_NAME } from "@/config/constants";

/**
 * Clears the client order session cookie, logging the customer out.
 */
export async function POST() {
	const response = NextResponse.json({ success: true });
	response.cookies.set(ORDER_COOKIE_NAME, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "true",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});
	return response;
}
