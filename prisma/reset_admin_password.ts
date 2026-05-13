import "dotenv/config";
import encryptPassword from "../src/helpers/encrypters";
import { prisma } from "../src/lib/prisma";

async function main() {
	const password = process.env.DEFAULT_USER_PASSWORD;

	const admin = await prisma.user.findFirst({
		where: {
			is_admin: true,
		},
	});

	if (password && admin) {
		const hashedPassword = encryptPassword(password);
		await prisma.user.update({
			where: {
				id: admin.id,
			},
			data: {
				password: hashedPassword,
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
