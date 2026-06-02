import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const execPromise = promisify(exec);

/**
 * GET /api/admin/settings/backup
 * Generates a PostgreSQL dump file using pg_dump by writing to a temporary file on disk,
 * then serves the file as a download and cleans up.
 */
export async function GET() {
    if (!(await requireAuth())) {
        return NextResponse.json(
            { error: "apiMessages.error.unauthorized" },
            { status: 401 },
        );
    }

    let tempFilePath = "";

    try {
        // Retrieve database URI components from environment variables
        const databaseUrl = process.env.DATABASE_URL || "";
        if (!databaseUrl) {
            return NextResponse.json(
                { error: "Database configuration not found" },
                { status: 500 },
            );
        }

        // Generate the backup filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `cafe_backup_${timestamp}.sql`;

        // pg_dump does not support Prisma-specific query parameters like ?schema=public in the connection URI.
        // We strip the query parameters from the database URL before passing it to pg_dump.
        const cleanedDatabaseUrl = databaseUrl.split("?")[0];

        // Extract password from connection string to set PGPASSWORD env variable to avoid any prompt issues
        const passMatch = cleanedDatabaseUrl.match(/:\/\/.*?:(.*?)@/);
        const pgPassword = passMatch ? decodeURIComponent(passMatch[1]) : "";

        // Define temporary file path on disk
        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, filename);

        // Command to execute pg_dump writing directly to the temporary file
        await execPromise(
            `pg_dump -d "${cleanedDatabaseUrl}" -f "${tempFilePath}"`,
            {
                maxBuffer: 100 * 1024 * 1024,
                env: {
                    ...process.env,
                    PGPASSWORD: pgPassword,
                },
            },
        );

        // Read the content of the backup file
        const fileContent = await fs.readFile(tempFilePath);

        // Delete the temporary file from disk immediately after reading
        await fs
            .unlink(tempFilePath)
            .catch((err) =>
                console.error("Failed to delete temporary backup file:", err),
            );

        // Return the dump file as a downloadable attachment
        return new Response(fileContent, {
            status: 200,
            headers: {
                "Content-Type": "application/sql",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: unknown) {
        console.error("Backup generation failed:", error);

        // Cleanup file if it exists and execution failed
        if (tempFilePath) {
            await fs.unlink(tempFilePath).catch(() => null);
        }

        const err = error as { stderr?: string; message?: string };
        if (err?.stderr) {
            console.error("pg_dump stderr output:", err.stderr);
        }
        return NextResponse.json(
            {
                error: "Failed to generate database backup",
                details: err?.message || String(error),
            },
            { status: 500 },
        );
    }
}
