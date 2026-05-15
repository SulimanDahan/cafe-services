/**
 * Global Application Route Constants.
 * Centralizing all application path values to enable modification in a single file
 * without risking broken paths elsewhere.
 */

// admin routes
export const MAIN_ADMIN_ROUTE: string = "/admin";
export const ADMIN_DASHBOARD_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/dashboard`;
export const ADMIN_RESERVATION_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/reservation`;
export const ADMIN_ORDER_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/order`;
export const ADMIN_ITEM_GROUP_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/item_group`;
export const ADMIN_ITEM_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/item`;
export const ADMIN_NOTIFICATION_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/notifications`;
export const ADMIN_USER_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/user`;
export const ADMIN_SETTINGS_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/settings`;
export const ADMIN_ROOM_PAGE_ROUTE: string = `${MAIN_ADMIN_ROUTE}/room`;

// user routes
export const MAIN_PAGE_ROUTE: string = '/';
export const ORDER_PAGE_ROUTE: string = '/order';
export const RESERVATION_PAGE_ROUTE: string = '/reservation';
