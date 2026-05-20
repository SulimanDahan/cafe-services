import { z } from "zod";

export const roomSchema = z.object({
	name: z.string().trim().min(1, { message: "Name is required" }),
	qr_code: z.string().trim().min(1, { message: "QR Code token is required" }),
	is_disable: z.boolean().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;
