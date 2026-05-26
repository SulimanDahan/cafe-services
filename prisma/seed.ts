import "dotenv/config";
import encryptPassword from "../src/helpers/encrypters";
import { prisma } from "../src/lib/prisma";

async function main() {
	const password = process.env.DEFAULT_USER_PASSWORD;

	const name = process.env.DEFAULT_USERNAME;

	if (name && password) {
		const hashedPassword = encryptPassword(password);
		const existingUser = await prisma.user.findUnique({
			where: { username: name },
		});
		
		if (!existingUser) {
			await prisma.user.create({
				data: {
					username: name,
					password: hashedPassword,
					is_admin: true,
				},
			});
			console.log(`Created default user: ${name}`);
		} else {
			console.log(`User ${name} already exists. Skipping creation.`);
		}

		// Initialize default settings only if none exist
		const existingSettings = await prisma.settings.findFirst();
		if (!existingSettings) {
			await prisma.settings.create({
				data: {
					currency_name: "YER",
					app_lang: "ar",
					per_page: 25,
					notification_threshold: 100,
					session_expiry_minutes: 30,
					force_client_order_session_passKey: false,
				},
			});
			console.log("Created default settings.");
		} else {
			console.log("Settings already exist. Skipping creation.");
		}
	} else {
		throw "check default username and password in .env file";
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(0);
	})
	.finally(async () => await prisma.$disconnect());
