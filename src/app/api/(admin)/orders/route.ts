import ApiErrorModel from "@/models/app_models/api_error_model";
import OrderModel from "@/models/data_models/order_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<OrderModel[] | OrderModel | ApiErrorModel>,
) {
    try {
        if (request.method === "GET") {
            const data = await prisma.order.findMany();
            return response.status(200).json(data as OrderModel[]);
        } else if (request.method === "POST") {
            const data = request.body;
            const result = await prisma.order.create({ data });
            return response.status(200).json(result as OrderModel);
        }
    } catch (error) {
        console.error("Error handling orders API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}
