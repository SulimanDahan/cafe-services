/**
 * Global Admin Route Constants.
 * Centralizing all application path values to enable modification in a single file
 * without risking broken paths elsewhere.
 */

const MAIN_ADMIN_ROUTE: string = "/admin";

export const ADMIN_ROUTES = {
	login: MAIN_ADMIN_ROUTE,
	dashboard: `${MAIN_ADMIN_ROUTE}/dashboard`,
	reservation: `${MAIN_ADMIN_ROUTE}/reservation`,
	order: `${MAIN_ADMIN_ROUTE}/order`,
	itemGroup: `${MAIN_ADMIN_ROUTE}/item_group`,
	item: `${MAIN_ADMIN_ROUTE}/item`,
	notifications: `${MAIN_ADMIN_ROUTE}/notifications`,
	user: `${MAIN_ADMIN_ROUTE}/user`,
	settings: `${MAIN_ADMIN_ROUTE}/settings`,
	room: `${MAIN_ADMIN_ROUTE}/room`,
} as const;

export type AdminRouteType = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
