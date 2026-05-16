import ApiErrorModel from "@/models/app_models/api_error_model";
import ItemGroupModel from "@/models/data_models/item_group_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<
        ItemGroupModel[] | ItemGroupModel | ApiErrorModel
    >,
) {
    try {
        if (request.method === "GET") {
            const data = await prisma.itemGroup.findMany();
            return response.status(200).json(data as ItemGroupModel[]);
        } else if (request.method === "POST") {
            const data = request.body;
            const result = await prisma.itemGroup.create({ data });
            return response.status(200).json(result as ItemGroupModel);
        }
    } catch (error) {
        console.error("Error handling item groups API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
