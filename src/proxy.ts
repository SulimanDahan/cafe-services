import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ROUTES } from "./config/admin_routes";

export default async function proxy(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const isAdminPath = pathname.startsWith("/admin") && !pathname.includes("manifest");
	if (isAdminPath) {
		const authSession = req.cookies.get("auth_session");
		const isLoginPage = req.nextUrl.pathname === ADMIN_ROUTES.login;

		if (!authSession) {
			if (!isLoginPage) {
				return Response.redirect(new URL(ADMIN_ROUTES.login, req.url));
			}
		} else {
			if (isLoginPage) {
				return Response.redirect(new URL(ADMIN_ROUTES.dashboard, req.url));
			}
		}
	}

	return NextResponse.next();
}
