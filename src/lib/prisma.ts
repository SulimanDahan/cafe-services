import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
	var prisma: PrismaClient | undefined;
}

const datasourceUrl = process.env.DATABASE_URL;

const pgAdapter = new PrismaPg({ connectionString: datasourceUrl });

export const prisma =
	globalThis.prisma ||
	new PrismaClient({
		adapter: pgAdapter,
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}
