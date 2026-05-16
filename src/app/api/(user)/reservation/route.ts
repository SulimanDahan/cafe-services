import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const POST = async (request: NextRequest) => {
    // validation
    if (!request.body) {
        return new Response("Bad Request", { status: 400 });
    }

    const data = await request.json();
    const result = await prisma.reservation.create({ data });
    return new Response(JSON.stringify(result));
}

export default POST