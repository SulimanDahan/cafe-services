import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/config/constants";
import { prisma } from "@/lib/prisma";

/**
 * Validates the current session using the auth cookie and database.
 * Returns the user object if valid, false otherwise.
 */
export async function requireAuth() {
    const cookieStore = await cookies();
    const authSession = cookieStore.get(AUTH_COOKIE_NAME);
    
    if (!authSession?.value) return false;

    const session = await prisma.userSession.findUnique({
        where: { id: authSession.value },
        include: { user: true }
    });

    if (!session || session.expires_at < new Date() || session.user.is_disable) {
        return false;
    }
    
    return session.user;
}
