import ApiErrorModel from "@/models/app_models/api_error_model";
import ItemGroupModel from "@/models/data_models/item_group_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(request: NextApiRequest, response: NextApiResponse<ItemGroupModel | ApiErrorModel>) {
    try {
        const item_group_id: string = request.query.item_group as string;
        if (request.method === "GET") {
            const data = await prisma.itemGroup.findFirst({
                where: { id: item_group_id },
            });
            return response.status(200).json(data as ItemGroupModel);
        } else if (request.method === "PUT") {
            const data = request.body;
            const result = await prisma.itemGroup.update({
                where: { id: item_group_id },
                data: data,
            });
            return response.status(200).json(result);
        } else if (request.method === "PATCH") {
            const data = request.body;
            const result = await prisma.itemGroup.update({
                where: { id: item_group_id },
                data: { is_disable: data.is_disable },
            });
            return response.status(200).json(result);
        } else if (request.method === "DELETE") {
            const result = await prisma.itemGroup.delete({
                where: { id: item_group_id },
            });
            return response.status(200).json(result);
        }
    } catch (error) {
        console.error("Error handling item group API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}