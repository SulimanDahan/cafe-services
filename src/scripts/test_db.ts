import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
	try {
		console.log("Testing connection...");
		await prisma.$connect();
		console.log("Connected successfully.");

		console.log("Checking Settings table...");
		const settings = await prisma.settings.findFirst();
		console.log("Settings:", settings);
	} catch (e) {
		console.error("Error:", e);
	} finally {
		await prisma.$disconnect();
	}
}

main();
