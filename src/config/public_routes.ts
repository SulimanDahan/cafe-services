import {
 MAIN_ADMIN_ROUTE,
 MAIN_PAGE_ROUTE,
 ORDER_PAGE_ROUTE,
} from "./page_routes";
import { LOGIN_API_ROUTE } from "./api_routes";

const publicRoutes = [
 MAIN_PAGE_ROUTE,
 ORDER_PAGE_ROUTE,
 MAIN_ADMIN_ROUTE,
 LOGIN_API_ROUTE,
];

export default publicRoutes;
