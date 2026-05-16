import { AUTH_COOKIE_NAME } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";

/**  check if the session is valid*/
export async function GET(request: NextRequest) {
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

	return NextResponse.json({
		status: 200,
		success: true,
		message: "تم التحقق من الجلسة بنجاح.",
	});
}
