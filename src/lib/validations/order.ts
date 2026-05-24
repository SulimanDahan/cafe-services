import { z } from "zod";

export const orderSchema = z.object({
 reservation_id: z.string().uuid({ message: "validation.reservationIdRequired" }),
 item_id: z.string().uuid({ message: "validation.itemIdRequired" }),
 quantity: z.number().int().min(1, { message: "validation.quantityMinOne" }),
 accepted: z.boolean().optional(),
});

export const orderBulkSchema = z.object({
 reservation_id: z.string().uuid({ message: "validation.reservationIdRequired" }),
 items: z.array(
 z.object({
 id: z.string().uuid({ message: "validation.itemIdRequired" }),
 quantity: z.number().int().min(1, { message: "validation.quantityMinOne" }),
 })
 ).min(1, { message: "validation.atLeastOneItem" }),
});

export type OrderInput = z.infer<typeof orderSchema>;
