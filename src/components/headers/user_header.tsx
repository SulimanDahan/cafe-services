"use client";
import { useLanguage } from "@/config/i18n";
// import { MAIN_PAGE_ROUTE, ORDER_PAGE_ROUTE } from "@/config/page_routes";
// import LinkButton from "../button/link_button";

import { LogoIcon } from "@/components/icons";

/** High-Contrast Glassmorphic AppBar */
const UserHeader = () => {
    const { t } = useLanguage();

    return (
        <header className="relative mt-4 z-40 max-w-7xl w-[calc(100%-2rem)] px-4 md:px-6 lg:px-8 mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
            <div className="px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <LogoIcon className="w-12 h-12 shrink-0 drop-shadow-lg text-primary" />
                    <span className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white whitespace-nowrap hidden sm:inline">
                        {t("home.title")}
                    </span>

                    {/* Customer Navbar menu links */}
                    {/* <nav className="flex items-center gap-1 sm:gap-2">
                        <LinkButton
                            route={MAIN_PAGE_ROUTE}
                            text={t("home.navHome")}
                        />
                        <LinkButton
                            route={ORDER_PAGE_ROUTE}
                            text={t("home.navOrder")}
                        />
                    </nav> */}
                </div>
            </div>
        </header>
    );
};

export default UserHeader;
