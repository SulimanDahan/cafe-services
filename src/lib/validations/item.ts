import { z } from "zod";

export const itemSchema = z.object({
    name: z.string().trim().min(1, { message: "validation.itemNameRequired" }),
    price: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z
            .number({ message: "validation.priceRequired" })
            .min(1, { message: "validation.priceMinOne" }),
    ),
    group_id: z.string().uuid({ message: "validation.categoryIdRequired" }),
    is_disable: z.boolean().optional(),
    image: z.any().optional(),
});

export type ItemInput = z.infer<typeof itemSchema>;
