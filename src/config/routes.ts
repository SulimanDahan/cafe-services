/**
 * Global Admin Route Constants.
 * Centralizing all application path values to enable modification in a single file
 * without risking broken paths elsewhere.
 */
export const ADMIN_ROUTES = {
	login: "/admin",
	dashboard: "/admin/dashboard",
	reservation: "/admin/reservation",
	order: "/admin/order",
	itemGroup: "/admin/item_group",
	item: "/admin/item",
	notifications: "/admin/notifications",
	user: "/admin/user",
	settings: "/admin/settings",
} as const;

export type AdminRouteType = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES];
