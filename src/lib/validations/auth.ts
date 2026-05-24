import { z } from "zod";

export const loginSchema = z.object({
 username: z.string().trim().min(1, { message: "validation.usernameRequired" }),
 password: z.string().min(1, { message: "validation.passwordRequired" }),
});

export const orderLoginSchema = z.object({
 room_id: z.string().uuid({ message: "validation.roomIdRequired" }).optional(),
 qr_code: z.string().optional(),
 passkey: z.preprocess(
 (val) => (typeof val === "string" ? parseInt(val, 10) : val),
 z.number().int({ message: "validation.passkeyMustBeNumber" }).optional()
 ),
}).refine(data => data.room_id || data.qr_code, {
 message: "apiMessages.error.roomIdRequired",
 path: ["room_id"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OrderLoginInput = z.infer<typeof orderLoginSchema>;
