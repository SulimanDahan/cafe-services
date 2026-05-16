import ApiErrorModel from "@/models/app_models/api_error_model";
import UserModel from "@/models/data_models/user_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * API route handler for managing users. Supports GET for fetching all users and POST for creating a new user.
 *
 * @param NextApiRequest request
 * @param NextApiResponse<UserModel[] | UserModel | ApiErrorModel> response
 * @returns UserModel[] | UserModel | ApiErrorModel
 */
export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<UserModel[] | UserModel | ApiErrorModel>,
) {
    try {
        if (request.method === "GET") {
            const data = await prisma.user.findMany();
            return response.status(200).json(data as UserModel[]);
        } else if (request.method === "POST") {
            const data = request.body;
            const result = await prisma.user.create({ data });
            return response.status(200).json(result as UserModel);
        }
    } catch (error) {
        console.error("Error handling users API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
