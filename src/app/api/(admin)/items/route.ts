import ItemModel from "@/models/data_models/item_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<ItemModel[] | ItemModel | { error: string }>,
) {
    try {
        if (request.method === "GET") {
            const data = await prisma.item.findMany();
            return response.status(200).json(data as ItemModel[]);
        } else if (request.method === "POST") {
            const data = request.body;
            const result = await prisma.item.create({ data });
            return response.status(200).json(result as ItemModel);
        }
    } catch (error) {
        console.error("Error handling items API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
