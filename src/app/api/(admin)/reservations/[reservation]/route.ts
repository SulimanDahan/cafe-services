import ApiErrorModel from "@/models/app_models/api_error_model";
import ReservationModel from "@/models/data_models/reservation_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(request: NextApiRequest, response: NextApiResponse<ReservationModel | ApiErrorModel>) {
    try {
        const reservation_id: string = request.query.reservation as string;
        if (request.method === "GET") {
            const data = await prisma.reservation.findFirst({
                where: { id: reservation_id },
            });
            return response.status(200).json(data as ReservationModel);
        } else if (request.method === "PUT") {
            const data = request.body;
            const result = await prisma.reservation.update({
                where: { id: reservation_id },
                data,
            });
            return response.status(200).json(result as ReservationModel);
        } else if (request.method === "DELETE") {
            const result = await prisma.reservation.delete({
                where: { id: reservation_id },
            });
            return response.status(200).json(result as ReservationModel);
        }
    } catch (error) {
        console.error("Error handling reservation API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}