import { z } from "zod";

export const settingsSchema = z.object({
	currency_name: z
		.string()
		.trim()
		.min(1, { message: "Currency name is required" }),
	notification_threshold: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z.number().int().min(1, { message: "Threshold must be at least 1" }),
	),
	app_lang: z.enum(["ar", "en"], {
		message: "Language must be English or Arabic",
	}),
	per_page: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z.number().int().min(1, { message: "Per page must be at least 1" }),
	),
	session_expiry_minutes: z.preprocess(
		(val) => (typeof val === "string" ? parseInt(val) : val),
		z
			.number()
			.int()
			.min(1, { message: "Expiry minutes must be at least 1" }),
	),
	force_client_order_session_passKey: z.boolean().optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
