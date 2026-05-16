import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function check() {
	const settings = await prisma.settings.findFirst();
	console.log("Current Settings:", settings);
	const users = await prisma.user.findMany({
		select: { id: true, username: true, is_admin: true },
	});
	console.log("Users:", users);
}

check()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
