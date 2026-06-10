import { z } from "zod";

export const reportSchema = z.object({
    message_text: z.string().trim().min(1, { message: "validation.messageRequired" }),
    is_read: z.boolean().optional(),
    reservation_id: z.string().uuid({ message: "validation.reservationIdRequired" }),
});

export type ReportInput = z.infer<typeof reportSchema>;
