import { NextRequest, NextResponse } from "next/server";
import {
	ADMIN_DASHBOARD_PAGE_ROUTE,
	MAIN_ADMIN_ROUTE,
} from "./config/page_routes";
import { AUTH_COOKIE_NAME } from "./config/constants";
import { prisma } from "./lib/prisma";

const isProduction = process.env.NODE_ENV === "production";

/** Shared cookie options to keep settings consistent across set/clear operations. */
function cookieOptions(maxAge: number) {
	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: "lax" as const,
		path: "/",
		maxAge,
	};
}

/**
 * Next.js 16 Proxy — Auth guard with sliding-window session renewal.
 *
 * On every /admin/* request:
 * 1. No cookie → redirect to login (unless already on login page).
 * 2. Cookie exists → verify session in DB:
 *    - Expired/missing → clear cookie + redirect to login.
 *    - Valid → extend cookie maxAge AND update DB expires_at (sliding window).
 * 3. Logged-in user on login page → redirect to dashboard.
 */
export async function proxy(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const authCookie = req.cookies.get(AUTH_COOKIE_NAME);
	const isLoginPage =
		pathname === MAIN_ADMIN_ROUTE || pathname === `${MAIN_ADMIN_ROUTE}/`;

	// ── No cookie → protect route ─────────────────────────────────────────────
	if (!authCookie?.value) {
		if (!isLoginPage) {
			return NextResponse.redirect(new URL(MAIN_ADMIN_ROUTE, req.url));
		}
		return NextResponse.next();
	}

	// ── Cookie exists → verify in DB and apply sliding window ─────────────────
	try {
		// Parallel query: session validity + expiry duration from Settings
		const [session, settings] = await Promise.all([
			prisma.userSession.findUnique({ where: { id: authCookie.value } }),
			prisma.settings.findFirst({
				select: { session_expiry_minutes: true },
			}),
		]);

		const sessionMinutes = settings?.session_expiry_minutes ?? 30;
		const now = new Date();

		// Session missing or expired in DB → force logout
		if (!session || session.expires_at < now) {
			const response = NextResponse.redirect(
				new URL(MAIN_ADMIN_ROUTE, req.url),
			);
			// Clear the stale cookie so the browser doesn't keep sending it
			response.cookies.set(AUTH_COOKIE_NAME, "", cookieOptions(0));
			return response;
		}

		// Session is valid → extend DB expiry in background (fire-and-forget)
		// The cookie is extended synchronously; the DB update is best-effort
		// so it doesn't block the response.
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
	],
};
