/**
 * Global API Route Constants.
 * Centralizing all application path values to enable modification in a single file
 * without risking broken paths elsewhere.
 */

const MAIN_API_ROUTE: string = "/api";
const AUTH_API_ROUTE: string = `${MAIN_API_ROUTE}/auth`;
export const LOGIN_API_ROUTE: string = `${AUTH_API_ROUTE}/login`;
export const LOGOUT_API_ROUTE: string = `${AUTH_API_ROUTE}/logout`;
export const REFRESH_API_ROUTE: string = `${AUTH_API_ROUTE}/refresh`;
export const ME_API_ROUTE: string = `${AUTH_API_ROUTE}/me`;
export const DASHBOARD_API_ROUTE: string = `${MAIN_API_ROUTE}/dashboard`;
export const RESERVATION_API_ROUTE: string = `${MAIN_API_ROUTE}/reservations`;
export const ORDER_API_ROUTE: string = `${MAIN_API_ROUTE}/orders`;
export const ITEM_GROUP_API_ROUTE: string = `${MAIN_API_ROUTE}/item_groups`;
export const ITEM_API_ROUTE: string = `${MAIN_API_ROUTE}/items`;
export const NOTIFICATION_API_ROUTE: string = `${MAIN_API_ROUTE}/notifications`;
export const NOTIFICATION_STREAM_API_ROUTE: string = `${NOTIFICATION_API_ROUTE}/stream`;
export const NOTIFICATION_CREATE_API_ROUTE: string = `${NOTIFICATION_API_ROUTE}/create`;
export const USER_API_ROUTE: string = `${MAIN_API_ROUTE}/users`;
export const SETTINGS_API_ROUTE: string = `${MAIN_API_ROUTE}/settings`;
export const ROOM_API_ROUTE: string = `${MAIN_API_ROUTE}/rooms`;
export const RESERVATION_USER_API_ROUTE: string = `${MAIN_API_ROUTE}/reservation`;
export const ROOMS_USER_API_ROUTE: string = `${MAIN_API_ROUTE}/reservation/rooms`;
export const ORDER_USER_API_ROUTE: string = `${MAIN_API_ROUTE}/order`;
export const ORDER_ITEMS_USER_API_ROUTE: string = `${ORDER_USER_API_ROUTE}/items`;
export const ORDER_LOGIN_API_ROUTE: string = `${ORDER_USER_API_ROUTE}/login`;
export const ORDER_SESSION_API_ROUTE: string = `${ORDER_USER_API_ROUTE}/session`;
export const ORDER_LOGOUT_API_ROUTE: string = `${ORDER_USER_API_ROUTE}/logout`;
