import { z } from "zod";

export const settingsSchema = z.object({
	currency_name: z
		.string()
		.trim()
		.min(1, { message: "validation.currencyNameRequired" }),
	notification_threshold: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z.number().int().min(1, { message: "validation.thresholdMinOne" }),
	),
	app_lang: z.enum(["ar", "en"], {
		message: "validation.languageInvalid",
	}),
	per_page: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z.number().int().min(1, { message: "validation.perPageMinOne" }),
	),
	session_expiry_minutes: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z
			.number()
			.int()
			.min(1, { message: "validation.expiryMinOne" }),
	),
	client_session_expiry_minutes: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z
			.number()
			.int()
			.min(1, { message: "validation.clientExpiryMinOne" }),
	),
	force_client_order_session_passKey: z.boolean().optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
