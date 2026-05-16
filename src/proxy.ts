import { NextRequest, NextResponse } from "next/server";
import {
	ADMIN_DASHBOARD_PAGE_ROUTE,
	MAIN_ADMIN_ROUTE,
} from "./config/page_routes";
import { AUTH_COOKIE_NAME } from "./config/constants";

/**
 * Next.js 16 Proxy (formerly middleware).
 * - Redirects unauthenticated users away from protected /admin/* routes → /admin (login).
 * - Redirects authenticated users away from the login page → /admin/dashboard.
 * - Non-admin routes pass through without checks.
 */
export async function proxy(req: NextRequest) {
	const pathname: string = req.nextUrl.pathname;
	const authSession = req.cookies.get(AUTH_COOKIE_NAME);
	const isLoginPage =
		pathname === MAIN_ADMIN_ROUTE || pathname === `${MAIN_ADMIN_ROUTE}/`;

	if (!authSession) {
		// No session → redirect to login if trying to access a protected admin sub-route
		if (!isLoginPage) {
			return Response.redirect(new URL(MAIN_ADMIN_ROUTE, req.url));
		}
	} else {
		// Has session → redirect away from login page to dashboard
		if (isLoginPage) {
			return Response.redirect(
				new URL(ADMIN_DASHBOARD_PAGE_ROUTE, req.url),
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all /admin/* page routes only (excludes static assets and API routes)
		"/admin/:path*",
	],
};
