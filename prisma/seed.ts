import "dotenv/config";
import encryptPassword from "../src/helpers/encrypters";
import { prisma } from "../src/lib/prisma";

async function main() {
	const password = process.env.DEFAULT_USER_PASSWORD;

	const name = process.env.DEFAULT_USERNAME;

	if (name && password) {
		const hashedPassword = encryptPassword(password);
		await prisma.user.upsert({
			where: { username: name },
			update: {
				password: hashedPassword,
				is_admin: true,
			},
			create: {
				username: name,
				password: hashedPassword,
				is_admin: true,
			},
		});
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
