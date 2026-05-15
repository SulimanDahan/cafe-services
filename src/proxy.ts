import { NextRequest, NextResponse } from "next/server";
import {
    ADMIN_DASHBOARD_PAGE_ROUTE,
    MAIN_ADMIN_ROUTE,
} from "./config/page_routes";
import { publicRoutes } from "./config/public_routes";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (!publicRoutes.includes(pathname)) {
        const authSession = req.cookies.get("auth_session");
        const isLoginPage = req.nextUrl.pathname === MAIN_ADMIN_ROUTE;

        if (!authSession) {
            if (!isLoginPage) {
                return Response.redirect(new URL(MAIN_ADMIN_ROUTE, req.url));
            }
        } else {
            if (isLoginPage) {
                return Response.redirect(
                    new URL(ADMIN_DASHBOARD_PAGE_ROUTE, req.url),
                );
            }
        }
    }

    return NextResponse.next();
}
