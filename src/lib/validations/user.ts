import { z } from "zod";

export const userSchema = z.object({
 username: z.string().trim().min(3, { message: "validation.usernameRequired" }),
 password: z.string().min(6, { message: "validation.passwordMinLength" }).optional(),
 is_admin: z.boolean().optional(),
 is_disable: z.boolean().optional(),
});

export const createUserSchema = userSchema.extend({
 password: z.string().min(6, { message: "validation.passwordMinLength" }),
});

export type UserInput = z.infer<typeof userSchema>;
