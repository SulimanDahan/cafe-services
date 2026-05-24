import { z } from "zod";

export const reservationSchema = z.object({
 client_name: z.string().trim().min(1, { message: "validation.clientNameRequired" }),
 phone: z.string().trim().min(1, { message: "validation.phoneRequired" }),
 room_id: z.string().uuid({ message: "validation.roomIdRequired" }),
 date_time: z.preprocess(
 (val) => (typeof val === "string" && val ? new Date(val) : val),
 z.date({ message: "validation.bookingDateRequired" })
 ),
 accepted: z.boolean().optional(),
 completed: z.boolean().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
