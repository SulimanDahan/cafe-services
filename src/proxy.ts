import { NextRequest, NextResponse } from "next/server";
import {
    ADMIN_DASHBOARD_PAGE_ROUTE,
    MAIN_ADMIN_ROUTE,
    MAIN_PAGE_ROUTE,
    ORDER_PAGE_ROUTE,
} from "./config/page_routes";
import {
    LOGIN_API_ROUTE,
    SETTINGS_API_ROUTE,
    RESERVATION_USER_API_ROUTE,
    ROOMS_USER_API_ROUTE,
    ORDER_LOGIN_API_ROUTE,
    ORDER_ITEMS_USER_API_ROUTE,
    ORDER_USER_API_ROUTE,
    ORDER_SESSION_API_ROUTE,
    ORDER_LOGOUT_API_ROUTE,
    REPORT_USER_API_ROUTE,
    NEWS_API_ROUTE,
} from "./config/api_routes";
import { AUTH_COOKIE_NAME } from "./config/constants";
import { prisma } from "./lib/prisma";

const isProduction = process.env.NODE_ENV === "production";

/** Shared cookie options to keep settings consistent across set/clear operations. */
function cookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: isProduction && process.env.ALLOW_INSECURE_COOKIES !== "true",
        sameSite: "lax" as const,
        path: "/",
        maxAge,
    };
}

const PUBLIC_API_EXCEPTIONS = [
    { path: LOGIN_API_ROUTE, method: "POST" },
    { path: SETTINGS_API_ROUTE, method: "GET" },
    { path: RESERVATION_USER_API_ROUTE, method: "POST" },
    { path: ROOMS_USER_API_ROUTE, method: "GET" }, // Public rooms list for booking modal
    { path: ORDER_LOGIN_API_ROUTE, method: "POST" },
    { path: ORDER_ITEMS_USER_API_ROUTE, method: "GET" },
    { path: ORDER_SESSION_API_ROUTE, method: "GET" }, // Client session check (cookie-based)
    { path: ORDER_LOGOUT_API_ROUTE, method: "POST" }, // Client logout (clears cookie)
    { path: REPORT_USER_API_ROUTE, method: "POST" },
    { path: `${NEWS_API_ROUTE}/public`, method: "GET" },
];

function isAdminApiRoute(pathname: string, method: string) {
    const normalizedPath =
        pathname.endsWith("/") && pathname.length > 1
            ? pathname.slice(0, -1)
            : pathname;

    const isPublic = PUBLIC_API_EXCEPTIONS.some(
        (r) => r.path === normalizedPath && r.method === method,
    );
    if (isPublic) return false;

    if (
        normalizedPath.startsWith(`${ORDER_USER_API_ROUTE}/`) &&
        normalizedPath !== ORDER_LOGIN_API_ROUTE &&
        normalizedPath !== ORDER_ITEMS_USER_API_ROUTE
    ) {
        return false;
    }

    // حماية جميع المسارات المتبقية التي تبدأ بـ /api/
    return normalizedPath.startsWith("/api/");
}

/**
 * Next.js 16 Proxy — Auth guard with sliding-window session renewal.
 *
 * On every /admin/* request:
 * 1. No cookie → redirect to login (unless already on login page).
 * 2. Cookie exists → verify session in DB:
 * - Expired/missing → clear cookie + redirect to login.
 * - Valid → extend cookie maxAge AND update DB expires_at (sliding window).
 * 3. Logged-in user on login page → redirect to dashboard.
 */
const PUBLIC_PAGE_ROUTES = [
    MAIN_PAGE_ROUTE,
    ORDER_PAGE_ROUTE,
];

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const normalizedPath =
        pathname.endsWith("/") && pathname.length > 1
            ? pathname.slice(0, -1)
            : pathname;

    // استثناء مسارات الصفحات المحددة صراحة بناءً على طلبك
    if (PUBLIC_PAGE_ROUTES.includes(normalizedPath)) {
        return NextResponse.next();
    }

    const authCookie = req.cookies.get(AUTH_COOKIE_NAME);
    const isLoginPage =
        pathname === MAIN_ADMIN_ROUTE || pathname === `${MAIN_ADMIN_ROUTE}/`;
    const isApiAdmin = isAdminApiRoute(pathname, req.method);

    // ── No cookie → protect route ─────────────────────────────────────────────
    if (!authCookie?.value) {
        if (isApiAdmin) {
            return NextResponse.json(
                { error: "apiMessages.error.unauthorized" },
                { status: 401 },
            );
        }
        if (!isLoginPage && !pathname.startsWith("/api/")) {
            return NextResponse.redirect(new URL(MAIN_ADMIN_ROUTE, req.url));
        }
        return NextResponse.next();
    }

    // ── Cookie exists → verify in DB and apply sliding window ─────────────────
    try {
        // Parallel query: session validity + expiry duration from Settings
        const [session, settings] = await Promise.all([
            prisma.userSession.findUnique({
                where: { id: authCookie.value },
                include: { user: true },
            }),
            prisma.settings.findFirst({
                orderBy: { created_at: "asc" },
                select: { session_expiry_minutes: true },
            }),
        ]);

        const sessionMinutes = settings?.session_expiry_minutes ?? 30;
        const now = new Date();

        // Session missing or expired in DB or user disabled → force logout
        if (!session || session.expires_at < now || session?.user?.is_disable) {
            let response;
            if (isApiAdmin) {
                response = NextResponse.json(
                    { error: "apiMessages.error.unauthorized" },
                    { status: 401 },
                );
            } else if (!pathname.startsWith("/api/")) {
                response = NextResponse.redirect(
                    new URL(MAIN_ADMIN_ROUTE, req.url),
                );
            } else {
                response = NextResponse.next();
            }
            // Clear the stale cookie so the browser doesn't keep sending it
            response.cookies.set(AUTH_COOKIE_NAME, "", cookieOptions(0));
            return response;
        }

        // Session is valid → extend DB expiry in background (fire-and-forget)
        const newExpiry = new Date(now.getTime() + sessionMinutes * 60 * 1000);
        prisma.userSession
            .update({
                where: { id: session.id },
                data: { expires_at: newExpiry },
            })
            .catch(() => null);

        // Already authenticated → bounce away from login page
        if (isLoginPage) {
            return NextResponse.redirect(
                new URL(ADMIN_DASHBOARD_PAGE_ROUTE, req.url),
            );
        }

        // Extend the cookie maxAge (sliding window visible to the browser)
        const response = NextResponse.next();
        response.cookies.set(
            AUTH_COOKIE_NAME,
            authCookie.value,
            cookieOptions(sessionMinutes * 60),
        );
        return response;
    } catch (error) {
        // DB unavailable — fail open to avoid locking out the admin
        console.error("[PROXY] Session check error:", error);
        if (isLoginPage) {
            return NextResponse.next();
        }
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        // Match all /admin/* page routes; excludes _next/* and public assets automatically
        "/admin/:path*",
        "/api/:path*", // Include all APIs so we can intercept admin APIs
    ],
};
