import { z } from "zod";

export const itemSchema = z.object({
    name: z.string().trim().min(1, { message: "validation.itemNameRequired" }),
    price: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z
            .number({ message: "validation.priceRequired" })
            .min(0, { message: "validation.priceMinZero" }),
    ),
    group_id: z.string().uuid({ message: "validation.categoryIdRequired" }),
    is_disable: z.boolean().optional(),
    image: z.any().optional(),
    discount_percentage: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
        z.number().min(0, { message: "validation.discountPercentageMin" }).max(100, { message: "validation.discountPercentageMax" })
    ).optional().default(0),
    discount_value: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
        z.number().min(0, { message: "validation.discountValueMin" })
    ).optional().default(0),
});

export type ItemInput = z.infer<typeof itemSchema>;
