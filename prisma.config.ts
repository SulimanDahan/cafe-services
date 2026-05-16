import "dotenv/config";
import { defineConfig } from "prisma/config";

let databaseUrl = process.env.DATABASE_URL;

// Interpolate variables if they are present in the connection string (for local .env support)
if (databaseUrl?.includes("${DATABASE_USER}")) {
	const user = process.env.DATABASE_USER;
	const password = process.env.DATABASE_PASSWORD;
	const db = process.env.DATABASE_NAME;
	const host = process.env.DATABASE_HOST || "localhost";
	const port = process.env.DATABASE_PORT || "5432";
	databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${db}?schema=public`;
}

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: databaseUrl || "postgresql://dummy:dummy@localhost:5432/dummy",
	},
});
