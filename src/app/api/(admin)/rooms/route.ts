// import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import RoomModel from "@/models/data_models/room_model";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<RoomModel[] | RoomModel>,
) {
    if (request.method === "GET") {
        const data = await prisma.room.findMany();
        return response.status(200).json(data as RoomModel[]);
    } else if (request.method === "POST") {
        const data = request.body;
        const result = await prisma.room.create({ data });
        return response.status(200).json(result as RoomModel);
    }
}
