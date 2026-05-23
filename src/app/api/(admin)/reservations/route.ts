import { reservationSchema } from "@/lib/validations/reservation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET paginated reservations with optional search, status filter, and date range */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const perPage = Math.max(1, parseInt(searchParams.get("per_page") || "10", 10));
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all"; // all | pending | confirmed
        const all = searchParams.get("all") === "true"; // include past reservations

        const where: Record<string, unknown> = {};

        if (!all) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            where.date_time = { gte: todayStart };
        }

        if (status === "pending") where.accepted = false;
        if (status === "confirmed") where.accepted = true;

        if (search) {
            where.OR = [
                { client_name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { room: { name: { contains: search, mode: "insensitive" } } },
            ];
        }

        const fetchAll = searchParams.get("fetch_all") === "true";

        const [reservations, total] = await Promise.all([
            prisma.reservation.findMany({
                where,
                include: { room: true },
                orderBy: all ? { date_time: "desc" } : { date_time: "asc" },
                ...(fetchAll ? {} : {
                    skip: (page - 1) * perPage,
                    take: perPage,
                }),
            }),
            prisma.reservation.count({ where }),
        ]);

        return NextResponse.json({
            data: reservations,
            total,
            page: fetchAll ? 1 : page,
            totalPages: fetchAll ? 1 : Math.ceil(total / perPage),
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return NextResponse.json({ error: "apiMessages.error.fetchReservationsFailed" }, { status: 500 });
    }
}

/** POST a new reservation */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = reservationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "apiMessages.error.validationFailed", details: validation.error.format() },
                { status: 422 }
            );
        }

        const data = validation.data;

        let order_passkey = Math.floor(100000 + Math.random() * 900000);
        let isUnique = false;
        while (!isUnique) {
            const existing = await prisma.reservation.findUnique({ where: { order_passkey } });
            if (!existing) {
                isUnique = true;
            } else {
                order_passkey = Math.floor(100000 + Math.random() * 900000);
            }
        }

        const reservation = await prisma.reservation.create({
            data: {
                client_name: data.client_name,
                phone: data.phone,
                room_id: data.room_id,
                order_passkey,
                date_time: data.date_time,
                accepted: data.accepted ?? false,
                completed: data.completed ?? false,
            },
            include: { room: true },
        });

        return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
        console.error("Error creating reservation:", error);
        return NextResponse.json({ error: "apiMessages.error.createReservationFailed" }, { status: 500 });
    }
}