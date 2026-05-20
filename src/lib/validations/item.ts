import { z } from "zod";

export const itemSchema = z.object({
    name: z.string().trim().min(1, { message: "Item name is required" }),
    price: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number({ message: "Price is required" }).min(0, { message: "Price must be greater than or equal to 0" })
    ),
    group_id: z.string().uuid({ message: "Invalid Category ID" }),
    is_disable: z.boolean().optional(),
});

export type ItemInput = z.infer<typeof itemSchema>;
