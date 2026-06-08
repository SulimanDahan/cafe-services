import { prisma } from "./prisma";

/**
 * Robust self-healing singleton retriever for application settings.
 * Ensures duplicate settings rows are merged/cleaned up, race conditions on creation
 * are handled safely, and all queries consistently target the oldest active record.
 */
export async function getSystemSettings() {
	try {
		// Clean up duplicate settings records to ensure a single row exists
		const settingsCount = await prisma.settings.count();
		if (settingsCount > 1) {
			const firstSettings = await prisma.settings.findFirst({
				orderBy: { created_at: "asc" },
			});
			if (firstSettings) {
				await prisma.settings.deleteMany({
					where: {
						id: { not: firstSettings.id },
					},
				});
			}
		}
	} catch (err) {
		console.error("Failed to cleanup duplicate settings:", err);
	}

	let appSettings;

	try {
		appSettings = await prisma.settings.findFirst({
			orderBy: { created_at: "asc" },
		});

		if (!appSettings) {
			try {
				appSettings = await prisma.settings.create({
					data: {
						currency_name: "YER",
						app_lang: "ar",
						per_page: 25,
						notification_threshold: 100,
						session_expiry_minutes: 60,
						client_session_expiry_minutes: 360,
						force_client_order_session_passKey: false,
						auto_accept_orders: false,
					},
				});
			} catch {
				// In case of a concurrent create race, fetch the created row
				appSettings = await prisma.settings.findFirst({
					orderBy: { created_at: "asc" },
				});
			}
		}
	} catch (dbError) {
		console.warn(
			"Database connection failed, using default settings fallback:",
			dbError,
		);
		return {
			id: "default",
			currency_name: "YER",
			app_lang: "ar",
			per_page: 25,
			notification_threshold: 100,
			session_expiry_minutes: 60,
			client_session_expiry_minutes: 360,
			force_client_order_session_passKey: false,
			auto_accept_orders: false,
			created_at: new Date(),
			updated_at: new Date(),
		};
	}

	return appSettings;
}
