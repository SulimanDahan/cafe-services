import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
	var prisma: PrismaClient | undefined;
}

const datasourceUrl = process.env.DATABASE_URL;

const pool = new Pool({ connectionString: datasourceUrl });
const pgAdapter = new PrismaPg(pool);

export const prisma =
	globalThis.prisma ||
	new PrismaClient({
		adapter: pgAdapter,
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}
