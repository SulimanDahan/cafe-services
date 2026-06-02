export const AUTH_COOKIE_NAME = "auth_session";

/** HttpOnly cookie used to persist the client (customer) order session. */
export const ORDER_COOKIE_NAME = "order_session";

// Omit Secure flag in development so cookie clears correctly over HTTP (Docker dev)
const isProduction = process.env.NODE_ENV === "production";
export const EMPTY_COOKIE = `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly;${isProduction ? " Secure;" : ""} SameSite=Lax`;
