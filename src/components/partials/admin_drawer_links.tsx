import {
 ADMIN_DASHBOARD_PAGE_ROUTE,
 ADMIN_ITEM_GROUP_PAGE_ROUTE,
 ADMIN_ITEM_PAGE_ROUTE,
 ADMIN_NOTIFICATION_PAGE_ROUTE,
 ADMIN_ORDER_PAGE_ROUTE,
 ADMIN_RESERVATION_PAGE_ROUTE,
 ADMIN_ROOM_PAGE_ROUTE,
 ADMIN_SETTINGS_PAGE_ROUTE,
 ADMIN_USER_PAGE_ROUTE,
} from "@/config/page_routes";
import {
 BellIcon,
 CalendarIcon,
 DashboardIcon,
 ItemGroupIcon,
 ItemIcon,
 OrderIcon,
 SettingsIcon,
 UsersIcon,
} from "../icons";
import RoomIcon from "../icons/RoomIcon";
import DrawerButton from "@/components/button/drawer_button";

// Dynamic navigation links utilizing individual imported React icon components and translation handles
export const AdminDrawerLinks = ({
 t,
 pathname,
 setIsMobileOpen,
}: {
 t: (keyPath: string) => string;
 pathname: string;
 setIsMobileOpen: (value: boolean) => void;
}) => {
 const navLinks = [
 {
 name: t("sidebar.dashboard"),
 path: ADMIN_DASHBOARD_PAGE_ROUTE,
 icon: <DashboardIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.rooms"),
 path: ADMIN_ROOM_PAGE_ROUTE,
 icon: <RoomIcon className="w-5 h-5 shrink-0" />,
 },
 {
 name: t("sidebar.itemGroups"),
 path: ADMIN_ITEM_GROUP_PAGE_ROUTE,
 icon: <ItemGroupIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.items"),
 path: ADMIN_ITEM_PAGE_ROUTE,
 icon: <ItemIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.reservations"),
 path: ADMIN_RESERVATION_PAGE_ROUTE,
 icon: <CalendarIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.orders"),
 path: ADMIN_ORDER_PAGE_ROUTE,
 icon: <OrderIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.users"),
 path: ADMIN_USER_PAGE_ROUTE,
 icon: <UsersIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.notifications"),
 path: ADMIN_NOTIFICATION_PAGE_ROUTE,
 icon: <BellIcon size={20} className="shrink-0" />,
 },
 {
 name: t("sidebar.settings"),
 path: ADMIN_SETTINGS_PAGE_ROUTE,
 icon: <SettingsIcon size={20} className="shrink-0" />,
 },
 ];

 return (
 <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
 {navLinks.map((link) => {
 const isActive = pathname === link.path;
 return (
 <DrawerButton
 key={link.path}
 link={link}
 setIsMobileOpen={setIsMobileOpen}
 isActive={isActive}
 />
 );
 })}
 </nav>
 );
};
