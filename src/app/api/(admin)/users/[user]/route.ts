import ApiErrorModel from "@/models/app_models/api_error_model";
import UserModel from "@/models/data_models/user_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * API route handler for managing a specific user by ID. Supports GET, PUT, and DELETE methods.
 * 
 * @param NextApiRequest request
 * @param NextApiResponse<UserModel | ApiErrorModel> response
 * @returns UserModel
 */
export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<UserModel | ApiErrorModel>,
) {
    try {
        const user_id: string = request.query.user as string;
        if (request.method === "GET") {
            const data = await prisma.user.findFirst({
                where: { id: user_id },
            });
            return response.status(200).json(data as UserModel);
        } else if (request.method === "PUT") {
            const data = request.body;
            const result = await prisma.user.update({
                where: { id: user_id },
                data,
            });
            return response.status(200).json(result as UserModel);
        } else if (request.method === "DELETE") {
            const result = await prisma.user.delete({
                where: { id: user_id },
            });
            return response.status(200).json(result as UserModel);
        }
    } catch (error) {
        console.error("Error handling user API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
