import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
	var prisma: PrismaClient | undefined;
}

let connectionString = process.env.DATABASE_URL;
if (connectionString?.includes("${DATABASE_USER}")) {
	connectionString = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@localhost:5432/${process.env.DATABASE_NAME}?schema=public`;
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}
