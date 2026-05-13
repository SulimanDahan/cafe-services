"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";
import { ADMIN_ROUTES } from "@/config/admin_routes";
import { useLanguage } from "@/config/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
	DashboardIcon,
	CalendarIcon,
	OrderIcon,
	ItemGroupIcon,
	ItemIcon,
	BellIcon,
	UsersIcon,
	SettingsIcon,
	LogoutIcon,
} from "@/components/icons";

import NotificationCenter from "@/components/NotificationCenter";
import PWAInstallBanner from "@/components/PWAInstallBanner";

interface LayoutProps {
	children: ReactNode;
}

/**
 * Full Screen Page Transition Loader component.
 * Features ultra-premium coffee gold / amber visual assets, modern micro-animations,
 * and high-contrast glassmorphic overlay for visual wow factor.
 * Automatically translates text using our global i18n handler.
 */
function PageLoader() {
	const { t } = useLanguage();
	return (
		<div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#07080a]/90 backdrop-blur-md transition-all duration-300">
			{/* Ambient Glowing Aura */}
			<div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

			<div className="relative flex flex-col items-center gap-6">
				{/* Modern Premium Loader Graphic */}
				<div className="relative h-20 w-20">
					{/* Outer Spinning Rim */}
					<div className="absolute inset-0 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin" />

					{/* Inner Pulse Circle with SVG Icon */}
					<div className="absolute inset-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
						<svg
							className="w-6 h-6 text-amber-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3"
							/>
						</svg>
					</div>
				</div>

				{/* Bilingual Text Indicators */}
				<div className="text-center space-y-1.5 z-10">
					<h3 className="text-sm font-black text-white tracking-wide animate-pulse">
						{t("common.loading")}
					</h3>
					<p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
						{t("common.logoTitle")} • {t("common.logoSubtitle")}
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * Premium Admin Layout with a highly-responsive glassmorphic sidebar/drawer on the right (or left in English LTR).
 * Applies to all admin paths except the login page (`/admin`).
 * Styled in high-contrast Material You dark mode with smooth animations and zero emojis.
 * Implements automated client-side navigation transitions, custom loading indicators, and multi-language support.
 */
export default function AdminLayout({ children }: LayoutProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { t, isRtl } = useLanguage();
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [prevPathname, setPrevPathname] = useState(pathname);
	const [isCustomerAppBlock, setIsCustomerAppBlock] = useState(false);

	// Multi-PWA scope sandboxing and manifest swap
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Check if PWA standalone mode
		const standaloneCheck =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as Navigator & { standalone?: boolean })
				.standalone === true;

		// Dynamic manifest swap to Admin configuration
		let link = document.querySelector(
			'link[rel="manifest"]',
		) as HTMLLinkElement;
		if (link) {
			link.href = "/admin-manifest.json";
		} else {
			link = document.createElement("link");
			link.rel = "manifest";
			link.href = "/admin-manifest.json";
			document.head.appendChild(link);
		}

		if (standaloneCheck) {
			const pwaType = sessionStorage.getItem("pwa_type");
			if (pwaType === "customer") {
				setTimeout(() => {
					setIsCustomerAppBlock(true);
				}, 0);
			} else {
				sessionStorage.setItem("pwa_type", "admin");
			}
		}
	}, []);

	// Synchronize loading state immediately in render when pathname changes (Official React Pattern)
	if (pathname !== prevPathname) {
		setPrevPathname(pathname);
		setIsLoading(false);
	}

	// Setup navigation progress listeners for clicks, history navigation, and programmatic changes
	useEffect(() => {
		const handleAnchorClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const anchor = target.closest("a");

			if (anchor) {
				const href = anchor.getAttribute("href");
				const targetAttr = anchor.getAttribute("target");

				// Intercept only internal relative routes starting with a single forward slash
				if (
					href &&
					href.startsWith("/") &&
					!href.startsWith("//") &&
					targetAttr !== "_blank" &&
					!event.metaKey &&
					!event.ctrlKey &&
					!event.shiftKey &&
					!event.altKey
				) {
					const currentPathname = window.location.pathname;
					const targetPath = href.split("?")[0].split("#")[0];

					// Prevent triggering loader if navigating to the current page
					if (currentPathname !== targetPath) {
						setIsLoading(true);
					}
				}
			}
		};

		// Back & Forward history navigation trigger
		const handlePopState = () => {
			setIsLoading(true);
		};

		// Programmatic route change navigation triggers (via CustomEvent)
		const handleNavigationStart = () => {
			setIsLoading(true);
		};

		document.addEventListener("click", handleAnchorClick, {
			capture: true,
		});
		window.addEventListener("popstate", handlePopState);
		window.addEventListener("navigation-start", handleNavigationStart);

		return () => {
			document.removeEventListener("click", handleAnchorClick, {
				capture: true,
			});
			window.removeEventListener("popstate", handlePopState);
			window.removeEventListener(
				"navigation-start",
				handleNavigationStart,
			);
		};
	}, [pathname]);

	if (isCustomerAppBlock) {
		return (
			<div
				className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#07080a] p-6 text-center select-none animate-fade-in"
				dir={isRtl ? "rtl" : "ltr"}
			>
				<div className="absolute w-72 h-72 rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />
				<div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-[#131522] p-8 space-y-6 shadow-2xl relative overflow-hidden">
					<div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-2xl">
						⚠️
					</div>
					<div className="space-y-2">
						<h2 className="text-lg font-black text-white">
							{t("common.unauthorizedTitle")}
						</h2>
						<p className="text-xs text-zinc-400 leading-relaxed">
							{t("common.unauthorizedDesc")}
						</p>
					</div>
					<button
						onClick={() => {
							window.location.href = "/order";
						}}
						className="w-full py-3 rounded-full bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors cursor-pointer active:scale-95"
					>
						{t("common.btnReturnOrder")}
					</button>
				</div>
			</div>
		);
	}

	// Exclude layout wrapper on the login page but mount the page transition loader
	if (
		pathname === ADMIN_ROUTES.login ||
		pathname === `${ADMIN_ROUTES.login}/`
	) {
		return (
			<>
				{children}
				{isLoading && <PageLoader />}
			</>
		);
	}

	// Dynamic navigation links utilizing individual imported React icon components and translation handles
	const navLinks = [
		{
			name: t("sidebar.dashboard"),
			path: ADMIN_ROUTES.dashboard,
			icon: <DashboardIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.reservations"),
			path: ADMIN_ROUTES.reservation,
			icon: <CalendarIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.orders"),
			path: ADMIN_ROUTES.order,
			icon: <OrderIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.itemGroups"),
			path: ADMIN_ROUTES.itemGroup,
			icon: <ItemGroupIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.items"),
			path: ADMIN_ROUTES.item,
			icon: <ItemIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.notifications"),
			path: ADMIN_ROUTES.notifications,
			icon: <BellIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.users"),
			path: ADMIN_ROUTES.user,
			icon: <UsersIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.settings"),
			path: ADMIN_ROUTES.settings,
			icon: <SettingsIcon size={20} className="shrink-0" />,
		},
		{
			name: t("sidebar.rooms"),
			path: ADMIN_ROUTES.room,
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

	const handleLogout = () => {
		// Dispatch transition start to guarantee the loader displays immediately during server payload fetches
		window.dispatchEvent(new CustomEvent("navigation-start"));
		router.push(ADMIN_ROUTES.login);
	};

	const sidebarContent = (
		<div className="flex flex-col h-full bg-[#0d0f17]/95 sm:bg-[#131522]/85 backdrop-blur-2xl text-zinc-200">
			{/* Brand Header */}
			<div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
				<div className="flex items-center gap-3">
					<div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-md">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3"
							/>
						</svg>
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-black text-white tracking-wide">
							{t("common.logoTitle")}
						</span>
						<span className="text-[10px] text-amber-400/80 font-bold tracking-widest uppercase">
							{t("common.logoSubtitle")}
						</span>
					</div>
				</div>
			</div>

			{/* Language Switcher Section (Desktop) */}
			<div className="px-6 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
				<span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
					Language / اللغة
				</span>
				<LanguageSwitcher />
			</div>

			{/* Navigation Links Area */}
			<nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
				{navLinks.map((link) => {
					const isActive = pathname === link.path;
					return (
						<Link
							key={link.path}
							href={link.path}
							onClick={() => setIsMobileOpen(false)}
							className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 relative group active:scale-[0.98] ${
								isActive
									? "bg-amber-500/10 text-amber-300 border-r-4 border-r-amber-500"
									: "text-zinc-400 hover:text-white hover:bg-white/5"
							}`}
						>
							{link.icon}
							<span>{link.name}</span>
						</Link>
					);
				})}
			</nav>

			{/* Footer Action (Logout) */}
			<div className="p-4 border-t border-white/10 shrink-0">
				<button
					onClick={handleLogout}
					className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-extrabold transition-all duration-200 active:scale-[0.98]"
				>
					<LogoutIcon size={16} className="shrink-0" />
					<span>{t("common.logout")}</span>
				</button>
			</div>
		</div>
	);

	return (
		<div
			className="h-screen max-h-screen overflow-hidden bg-[#07080a] text-zinc-100 font-sans flex flex-row"
			dir={isRtl ? "rtl" : "ltr"}
		>
			{/* Persistent Desktop Sidebar Drawer on the Side (w-64) */}
			<aside
				className={`hidden lg:block w-64 shrink-0 sticky top-0 h-screen z-30 ${isRtl ? "border-l border-white/10" : "border-r border-white/10"}`}
			>
				{sidebarContent}
			</aside>

			{/* Unified Top Header for Mobile & Desktop */}
			<div className="flex-1 flex flex-col h-full max-h-full overflow-hidden min-w-0">
				<header className="h-16 border-b border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
					<div className="flex items-center gap-3">
						{/* Hamburger toggle button - Mobile Only */}
						<button
							onClick={() => setIsMobileOpen(!isMobileOpen)}
							className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all duration-150 focus:outline-none cursor-pointer"
							aria-label="Toggle menu"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>

						{/* Brand Logo - Mobile Only */}
						<div className="lg:hidden flex items-center gap-2">
							<div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-base shadow-md">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2.5"
										d="M12 3v1m0 16v1m9-9h-1M4 12H3"
									/>
								</svg>
							</div>
							<span className="text-sm font-black text-white">
								{t("common.logoTitle")}
							</span>
						</div>

						{/* Desktop Admin Status - Desktop Only */}
						<div className="hidden lg:flex items-center gap-2.5">
							<span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
							<span className="text-xs font-black text-zinc-300 tracking-wider uppercase">
								{t("common.adminStatus")}
							</span>
						</div>
					</div>

					{/* Notification Center Integration on top right/left */}
					<div className="flex items-center gap-3.5">
						<NotificationCenter />
					</div>
				</header>

				{/* Mobile Drawer Slide-in Menu Backdrop */}
				{isMobileOpen && (
					<div
						className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
						onClick={() => setIsMobileOpen(false)}
					/>
				)}

				{/* Mobile Drawer Menu Content */}
				<aside
					className={`lg:hidden fixed top-0 bottom-0 z-50 transition-transform duration-300 transform h-screen shrink-0 w-64 border-white/10 ${
						isRtl ? "right-0 border-l" : "left-0 border-r"
					} ${
						isMobileOpen
							? "translate-x-0"
							: isRtl
								? "translate-x-full"
								: "-translate-x-full"
					}`}
				>
					{sidebarContent}
				</aside>

				{/* Main Content Pane */}
				<main className="flex-1 overflow-y-auto p-4 sm:p-8 min-w-0">
					{children}
				</main>
			</div>

			{/* Dynamic PWA Installation Promotion */}
			<PWAInstallBanner appType="admin" />

			{/* Full Screen Page Transition Overlay Loader */}
			{isLoading && <PageLoader />}
		</div>
	);
}
