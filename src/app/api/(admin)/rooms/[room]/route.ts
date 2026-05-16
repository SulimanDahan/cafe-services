import RoomModel from "@/models/data_models/room_model";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<RoomModel>,
) {
    const room_id: string = request.query.room as string;
    if (request.method === "GET") {
        const data = await prisma.room.findFirst({
            where: { id: room_id },
        });
        return response.status(200).json(data as RoomModel);
    } else if (request.method === "PUT") {
        const data = request.body;
        const result = await prisma.room.update({
            where: { id: room_id },
            data: data,
        });
        return response.status(200).json(result);
    } else if (request.method === "PATCH") {
        const data = request.body;
        const result = await prisma.room.update({
            where: { id: room_id },
            data: { is_disable: data.is_disable },
        });
        return response.status(200).json(result);
    } else if (request.method === "DELETE") {
        const result = await prisma.room.delete({
            where: { id: room_id },
        });
        return response.status(200).json(result);
    }
}
