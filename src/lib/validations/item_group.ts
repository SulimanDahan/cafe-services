import { z } from "zod";

export const itemGroupSchema = z.object({
 name: z.string().trim().min(1, { message: "validation.categoryNameRequired" }),
 is_disable: z.boolean().optional(),
});

export type ItemGroupInput = z.infer<typeof itemGroupSchema>;
