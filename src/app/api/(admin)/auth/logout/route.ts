import { EMPTY_COOKIE } from "@/config/constants";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const { session_id } = await request.json();

	if (!session_id) {
		return NextResponse.json(
			{ success: false, error: "Session ID is required" },
			{ status: 400 },
		);
	}

	const result = await prisma.userSession.delete({
		where: { id: session_id },
	});

	if (!result) {
		return NextResponse.json(
			{ success: false, error: "Session not found" },
			{ status: 404 },
		);
	}

	// Set the session cookie to expire immediately
	const response = NextResponse.json({ success: true });
	response.headers.set("Set-Cookie", EMPTY_COOKIE);

	return response;
}
