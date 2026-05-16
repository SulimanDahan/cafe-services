import ApiErrorModel from "@/models/app_models/api_error_model";
import OrderModel from "@/models/data_models/order_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(request: NextApiRequest, response: NextApiResponse<OrderModel | ApiErrorModel>) {
    try {
        const order_id: string = request.query.order as string;
        if (request.method === "GET") {
            const data = await prisma.order.findFirst({
                where: { id: order_id },
            });
            return response.status(200).json(data as OrderModel);
        } else if (request.method === "PUT") {
            const data = request.body;
            const result = await prisma.order.update({
                where: { id: order_id },
                data: data,
            });
            return response.status(200).json(result as OrderModel);
        // } else if (request.method === "PATCH") {
        //     const data = request.body;
        //     const result = await prisma.order.update({
        //         where: { id: order_id },
        //         data: { is_disable: data.is_disable },
        //     });
        //     return response.status(200).json(result);
        } else if (request.method === "DELETE") {
            const result = await prisma.order.delete({
                where: { id: order_id },
            });
            return response.status(200).json(result as OrderModel);
        }
    } catch (error) {
        console.error("Error handling order API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}