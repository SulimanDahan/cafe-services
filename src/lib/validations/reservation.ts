import { z } from "zod";

export const reservationSchema = z.object({
    client_name: z.string().trim().min(1, { message: "Client name is required" }),
    phone: z.string().trim().min(1, { message: "Phone number is required" }),
    room_id: z.string().uuid({ message: "Invalid Room ID" }),
    date_time: z.preprocess(
        (val) => (typeof val === "string" && val ? new Date(val) : val),
        z.date({ message: "Booking date and time is required" })
    ),
    accepted: z.boolean().optional(),
    completed: z.boolean().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
