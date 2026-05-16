import { EMPTY_COOKIE } from "@/config/constants";
import { prisma } from "@/lib/prisma";
import ApiErrorModel from "@/models/app_models/api_error_model";
import ApiSuccessModel from "@/models/app_models/api_success_model";
import { NextApiRequest, NextApiResponse } from "next";

export async function POST(
    request: NextApiRequest,
    response: NextApiResponse<ApiErrorModel | ApiSuccessModel>,
) {
    const session_id = (await request.body.json()) as string;

    if (!session_id) {
        return response.status(400).json({
            error: "Session ID is required",
        });
    }

    const result = await prisma.userSession.delete({
        where: { id: session_id },
    });

    if (!result) {
        return response.status(404).json({
            error: "Session not found",
        });
    }

    // Set the session cookie to expire immediately

    return response
        .setHeader("Set-Cookie", EMPTY_COOKIE)
        .status(200)
        .json({ message: "Logout successful" });
}
