"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { useLanguage } from "@/config/i18n";
import { LogoutIcon, LogoIcon, MenuIcon } from "@/components/icons";
import NotificationCenter from "@/components/notification_center";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { MAIN_ADMIN_ROUTE } from "@/config/page_routes";
import { AdminDrawerLinks } from "@/components/partials/admin_drawer_links";
import { LOGOUT_API_ROUTE, ME_API_ROUTE } from "@/config/api_routes";
import PageLoader from "@/components/partials/PageLoader";
import { RoomProvider } from "@/context/room_context";
import { OrderProvider } from "@/context/order_context";
import { ItemProvider } from "@/context/item_context";
import { ItemGroupProvider } from "@/context/item_group_context";
import { ReservationProvider } from "@/context/reservation_context";
import { UserProvider } from "@/context/user_context";

interface LayoutProps {
    children: ReactNode;
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
    const [username, setUsername] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(ME_API_ROUTE);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data?.user?.username) {
                        setUsername(json.data.user.username);
                        setIsAdmin(json.data.user.is_admin ?? false);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        // Don't fetch on the login page itself
        if (
            pathname !== MAIN_ADMIN_ROUTE &&
            pathname !== `${MAIN_ADMIN_ROUTE}/`
        ) {
            fetchUser();
        }
    }, [pathname]);

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

    // Effect hook to ensure loading state is cleared when component mounts/pathname changes
    useEffect(() => {
        (() => setIsLoading(false))();
    }, [pathname]);

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
                className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background p-6 text-center select-none animate-fade-in"
                dir={isRtl ? "rtl" : "ltr"}
            >
                <div className="absolute w-72 h-72 rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />
                <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-surface p-8 space-y-6 shadow-2xl relative overflow-hidden">
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
                        className="w-full py-3 rounded-full bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors cursor-pointer"
                    >
                        {t("common.btnReturnOrder")}
                    </button>
                </div>
            </div>
        );
    }

    // Exclude layout wrapper on the login page but mount the page transition loader
    if (pathname === MAIN_ADMIN_ROUTE || pathname === `${MAIN_ADMIN_ROUTE}/`) {
        return (
            <>
                {children}
                {isLoading && <PageLoader />}
            </>
        );
    }

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // The HttpOnly session cookie is sent automatically by the browser.
            // The server reads and deletes it — no client-side cookie access needed.
            await fetch(LOGOUT_API_ROUTE, { method: "POST" });
        } catch (err) {
            console.error("Logout request failed:", err);
            setIsLoading(false);
        } finally {
            // Always redirect to login — proxy will block re-entry without a valid session
            router.push(MAIN_ADMIN_ROUTE);
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0d0f17]/95 sm:bg-surface/85 backdrop-blur-2xl text-zinc-200">
            {/* Brand Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-11 h-11 shrink-0 drop-shadow-lg text-primary" />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white tracking-wide">
                            {t("common.logoTitle")}
                        </span>
                        <span className="text-[10px] text-primary-hover/80 font-bold tracking-widest uppercase">
                            {t("common.logoSubtitle")}
                        </span>
                    </div>
                </div>
            </div>

            <AdminDrawerLinks
                t={t}
                pathname={pathname}
                setIsMobileOpen={setIsMobileOpen}
                isAdmin={isAdmin}
            />

            {/* Footer Action (Logout) */}
            <div className="p-4 border-t border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-extrabold transition-all duration-200 "
                >
                    <LogoutIcon size={16} className="shrink-0" />
                    <span>{t("common.logout")}</span>
                </button>
            </div>
        </div>
    );

    return (
        <UserProvider>
            <RoomProvider>
                <OrderProvider>
                    <ItemGroupProvider>
                        <ItemProvider>
                            <ReservationProvider>
                                <div
                                    className="h-dvh overflow-hidden bg-background text-zinc-100 font-sans flex flex-row"
                                    dir={isRtl ? "rtl" : "ltr"}
                                >
                                    {/* Persistent Desktop Sidebar Drawer on the Side (w-64) */}
                                    <aside
                                        className={`hidden lg:block w-64 shrink-0 sticky top-0 h-dvh z-30 ${isRtl ? "border-l border-white/10" : "border-r border-white/10"}`}
                                    >
                                        {sidebarContent}
                                    </aside>

                                    {/* Unified Top Header for Mobile & Desktop */}
                                    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden min-w-0">
                                        <header className="h-16 border-b border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
                                            <div className="flex items-center gap-3">
                                                {/* Hamburger toggle button - Mobile Only */}
                                                <button
                                                    onClick={() =>
                                                        setIsMobileOpen(
                                                            !isMobileOpen,
                                                        )
                                                    }
                                                    className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-150 focus:outline-none cursor-pointer"
                                                    aria-label="Toggle menu"
                                                >
                                                    <MenuIcon className="w-5 h-5" />
                                                </button>

                                                {/* Brand Logo - Mobile Only */}
                                                <div className="lg:hidden flex items-center gap-2">
                                                    <LogoIcon className="w-10 h-10 shrink-0 drop-shadow-md text-primary" />
                                                    <span className="text-sm font-black text-white">
                                                        {t("common.logoTitle")}
                                                    </span>
                                                </div>

                                                {/* Desktop Admin Status - Desktop Only */}
                                                <div className="hidden lg:flex items-center gap-2.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-xs font-black text-zinc-300 tracking-wider uppercase">
                                                        {username ||
                                                            t(
                                                                "common.adminStatus",
                                                            )}
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
                                                onClick={() =>
                                                    setIsMobileOpen(false)
                                                }
                                            />
                                        )}

                                        {/* Mobile Drawer Menu Content */}
                                        <aside
                                            className={`lg:hidden fixed top-0 bottom-0 z-50 transition-transform duration-300 h-dvh shrink-0 w-64 border-white/10 ${
                                                isRtl
                                                    ? "right-0 border-l"
                                                    : "left-0 border-r"
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
                            </ReservationProvider>
                        </ItemProvider>
                    </ItemGroupProvider>
                </OrderProvider>
            </RoomProvider>
        </UserProvider>
    );
}
