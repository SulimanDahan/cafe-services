import ItemModel from "@/models/data_models/item_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<ItemModel | { error: string }>,
) {
    const item_id: string = request.query.item as string;
    try {
        if (request.method === "GET") {
            const data = await prisma.item.findFirst({
                where: { id: item_id },
            });
            return response.status(200).json(data as ItemModel);
        } else if (request.method === "PUT") {
            const data = request.body;
            const result = await prisma.item.update({
                where: { id: item_id },
                data: data,
            });
            return response.status(200).json(result);
        } else if (request.method === "PATCH") {
            const data = request.body;
            const result = await prisma.item.update({
                where: { id: item_id },
                data: { is_disable: data.is_disable },
            });
            return response.status(200).json(result);
        } else if (request.method === "DELETE") {
            const result = await prisma.item.delete({
                where: { id: item_id },
            });
            return response.status(200).json(result);
        }
    } catch (error) {
        console.error("Error handling item API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
