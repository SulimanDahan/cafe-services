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
			name: t("sidebar.notifications"),
			path: ADMIN_NOTIFICATION_PAGE_ROUTE,
			icon: <BellIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.users"),
			path: ADMIN_USER_PAGE_ROUTE,
			icon: <UsersIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.settings"),
			path: ADMIN_SETTINGS_PAGE_ROUTE,
			icon: <SettingsIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.rooms"),
			path: ADMIN_ROOM_PAGE_ROUTE,
			icon: (
				<svg
					className="w-5 h-5 shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
			),
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
