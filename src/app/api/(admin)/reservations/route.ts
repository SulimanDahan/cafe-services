import ApiErrorModel from "@/models/app_models/api_error_model";
import ReservationModel from "@/models/data_models/reservation_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(request: NextApiRequest, response: NextApiResponse<ReservationModel[] | ReservationModel | ApiErrorModel>) {
    try {
        if (request.method === "GET") {
            const data = await prisma.reservation.findMany();
            return response.status(200).json(data as ReservationModel[]);
        } else if (request.method === "POST") {
            const data = request.body;
            const result = await prisma.reservation.create({ data });
            return response.status(200).json(result as ReservationModel);
        }
    } catch (error) {
        console.error("Error handling reservations API request:", error);
        return response.status(500).json({
            error: "An unexpected error occurred while processing the request.",
        });
    }
}