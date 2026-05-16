import { AUTH_COOKIE_NAME } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";

/** Refresh session auth */
export async function POST(request: NextRequest) {
	const authSession = request.cookies.get(AUTH_COOKIE_NAME);
	if (!authSession) {
		return NextResponse.json(
			{
				status: 401,
				success: false,
				message: "غير مصرح، يرجى تسجيل الدخول.",
			},
			{ status: 401 },
		);
	}

	// Refresh the session by setting a new cookie with the same value and an extended expiration time
	const newExpirationDate = new Date();
	newExpirationDate.setDate(newExpirationDate.getDate() + 7); // Extend by 7 days

	const response = NextResponse.json({
		status: 200,
		success: true,
		message: "تم تحديث الجلسة بنجاح.",
	});

	response.cookies.set(AUTH_COOKIE_NAME, authSession.value, {
		expires: newExpirationDate,
		httpOnly: true,
		secure: true,
		sameSite: "strict",
	});

	return response;
}