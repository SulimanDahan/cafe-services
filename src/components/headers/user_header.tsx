"use client";
import { useLanguage } from "@/config/i18n";
import { MAIN_PAGE_ROUTE, ORDER_PAGE_ROUTE } from "@/config/page_routes";
import LinkButton from "../button/link_button";

/** High-Contrast Glassmorphic AppBar */
const UserHeader = () => {
    const { t } = useLanguage();

    return (
        <header className="sticky top-4 z-40  max-w-7xl w-[calc(100%-2rem)] px-4 md:px-6 lg:px-8  mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
            <div className="px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <div className="h-9.5 w-9.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-lg">
                        <svg
                            className="w-5.5 h-5.5"
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
                    <span className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white whitespace-nowrap hidden sm:inline">
                        {t("home.title")}
                    </span>

                    {/* Customer Navbar menu links */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <LinkButton
                            route={MAIN_PAGE_ROUTE}
                            text={t("home.navHome")}
                        />
                        {/* href={MAIN_PAGE_ROUTE}
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
                        >
                            {t("home.navHome")}
                        </Link> */}
                        {/* <Link
                            href={ORDER_PAGE_ROUTE}
                            className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-md active:scale-95"
                        >
                            {t("home.navOrder")}
                        </Link> */}
                        <LinkButton
                            route={ORDER_PAGE_ROUTE}
                            text={t("home.navOrder")}
                        />
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default UserHeader;
