import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * GET /api/admin/settings/backup
 * Generates a PostgreSQL dump file using pg_dump and sends it as a file download response.
 */
export async function GET() {
    if (!(await requireAuth())) {
        return NextResponse.json(
            { error: "apiMessages.error.unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Retrieve database URI components from environment variables
        const databaseUrl = process.env.DATABASE_URL || "";
        if (!databaseUrl) {
            return NextResponse.json(
                { error: "Database configuration not found" },
                { status: 500 }
            );
        }

        // Generate the backup filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `cafe_backup_${timestamp}.sql`;

        // Command to execute pg_dump. Using environment variable directly is safe here since databaseUrl comes from secure backend env.
        // We use pg_dump with the connection string directly
        const { stdout } = await execPromise(`pg_dump "${databaseUrl}"`);

        // Return the dump file as a downloadable attachment
        return new Response(stdout, {
            status: 200,
            headers: {
                "Content-Type": "application/sql",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("Backup generation failed:", error);
        return NextResponse.json(
            { error: "Failed to generate database backup" },
            { status: 500 }
        );
    }
}
