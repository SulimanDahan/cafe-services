import { z } from "zod";

export const reservationSchema = z.object({
 client_name: z.string().trim().min(1, { message: "validation.clientNameRequired" }),
 phone: z.string().trim().min(1, { message: "validation.phoneRequired" }),
 room_id: z.string().uuid({ message: "validation.roomIdRequired" }),
 date_time: z.preprocess(
    (val) => {
        if (typeof val === "string" || typeof val === "number") {
            const d = new Date(val);
            return isNaN(d.getTime()) ? val : d;
        }
        return val;
    },
    z.date({ message: "validation.bookingDateRequired" })
 ),
 accepted: z.boolean().optional(),
 activated: z.boolean().optional(),
 completed: z.boolean().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
