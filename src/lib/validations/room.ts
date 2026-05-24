import { z } from "zod";

export const roomSchema = z.object({
	name: z.string().trim().min(1, { message: "validation.roomNameRequired" }),
	qr_code: z.string().trim().min(1, { message: "validation.qrCodeRequired" }),
	is_disable: z.boolean().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;
