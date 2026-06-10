import { z } from "zod";

export const newsSchema = z.object({
    news_text: z.string().min(1, "validation.required").max(500, "validation.maxLength500"),
    start_date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    end_date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    is_disable: z.boolean().default(false),
}).refine(data => data.end_date >= data.start_date, {
    message: "validation.endDateBeforeStartDate",
    path: ["end_date"],
});

export type NewsInput = z.infer<typeof newsSchema>;
