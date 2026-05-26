"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/config/i18n";
import { Badge } from "@/components/badge";
import { BookingModal } from "@/components/partials/modals/reservation_modal";
import { ROOMS_USER_API_ROUTE } from "@/config/api_routes";
import { Toast, ToastType } from "@/components/toast";
import {
    CalendarIcon,
    TvIcon,
    WifiIcon,
    HookahIcon,
    ArrowIcon,
} from "@/components/icons";
import { CupIcon } from "@/components/icons/cup_icon";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export default function Home() {
    const { t } = useLanguage();
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);

    interface Room {
        id: string;
        name: string;
        is_disable: boolean;
        qr_code?: string;
    }

    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(
                    `${ROOMS_USER_API_ROUTE}?t=${Date.now()}`,
                    {
                        cache: "no-store",
                    },
                );
                if (res.ok) {
                    const resData = await res.json();
                    const roomsList = Array.isArray(resData)
                        ? resData
                        : resData && Array.isArray(resData.data)
                          ? resData.data
                          : [];
                    setRooms(roomsList.filter((r: Room) => !r.is_disable));
                }
            } catch (err) {
                console.error("Failed to fetch rooms", err);
            }
        };

        fetchRooms();
    }, []);

    // حالة الـ Toast
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success" as ToastType,
    });

    const showNotice = (message: string, type: ToastType = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
    };

    return (
        <>
            <PWAInstallBanner appType="customer" />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-16 flex flex-col gap-16 overflow-x-hidden">
                {/* Modern Hero Header */}
                <div className="relative animate-fade-in-up">
                    <div className="absolute top-0 right-0 w-75 h-75 md:w-150 md:h-150 bg-primary/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4" />

                    <div className="max-w-4xl">
                        <Badge className="mb-6 md:mb-8 text-primary-light border-primary/30 bg-primary/10 backdrop-blur-md px-4 py-2 text-sm">
                            {t("home.heroBadge")}
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.3] mb-6 md:mb-8 tracking-tight">
                            {t("home.heroTitle")}
                        </h1>
                        <p className="text-lg md:text-2xl text-zinc-400 leading-relaxed max-w-2xl font-medium">
                            {t("home.heroDesc")}
                        </p>
                    </div>
                </div>

                {/* Modern Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-auto lg:auto-rows-[240px]">
                    {/* Feature 1 - Reservation (Bento Hero) */}
                    <div
                        className="group relative flex flex-col justify-between p-8 md:p-10 rounded-4xl bg-linear-to-br from-surface-container to-[#0f111a] border border-white/5 hover:border-primary/40 transition-all duration-500 overflow-hidden cursor-pointer shadow-2xl hover:shadow-primary/20 md:col-span-2 lg:row-span-2 animate-fade-in-up [animation-delay:100ms] min-h-75"
                        onClick={() => setIsBookModalOpen(true)}
                    >
                        {/* Glowing Background Orb */}
                        <div className="absolute -bottom-32 -right-32 w-125 h-125 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700 ease-out group-hover:scale-110 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start w-full">
                                <div className="p-6 bg-primary/10 text-primary rounded-[28px] backdrop-blur-xl border border-primary/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-xl">
                                    <CalendarIcon className="w-10 h-10 md:w-12 md:h-12" />
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-full group-hover:bg-primary group-hover:text-black transition-all duration-500 backdrop-blur-sm shadow-lg group-hover:scale-105">
                                    <span className="text-sm md:text-base font-bold tracking-wide">
                                        {t("home.btnBookNow")}
                                    </span>
                                    <ArrowIcon className="w-5 h-5 -rotate-45 group-hover:rotate-45 group-hover:-translate-x-1 transition-all duration-500" />
                                </div>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                                    {t("home.feature1Title")}
                                </h3>
                                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-md font-medium">
                                    {t("home.feature1Desc")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 - Matches */}
                    <div className="group relative flex flex-col justify-between p-6 md:p-8 rounded-4xl bg-surface-container border border-white/5 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-emerald-500/20 md:col-span-1 lg:row-span-1 animate-fade-in-up [animation-delay:200ms] min-h-55">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                <TvIcon className="w-7 h-7" />
                            </div>
                        </div>
                        <div className="relative z-10 mt-6">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                {t("home.feature2Title")}
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                                {t("home.feature2Desc")}
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 - Cafe */}
                    <div className="group relative flex flex-col justify-between p-6 md:p-8 rounded-4xl bg-surface-container border border-white/5 hover:border-amber-500/40 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-amber-500/20 md:col-span-1 lg:row-span-1 animate-fade-in-up [animation-delay:300ms] min-h-55">
                        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                                <CupIcon className="w-7 h-7" />
                            </div>
                        </div>
                        <div className="relative z-10 mt-6">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                {t("home.feature3Title")}
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                                {t("home.feature3Desc")}
                            </p>
                        </div>
                    </div>

                    {/* Feature 4 - Internet */}
                    <div className="group relative flex flex-col justify-between p-6 md:p-8 rounded-4xl bg-surface-container border border-white/5 hover:border-blue-500/40 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-blue-500/20 md:col-span-1 lg:row-span-1 animate-fade-in-up [animation-delay:400ms] min-h-55">
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <WifiIcon className="w-7 h-7" />
                            </div>
                        </div>
                        <div className="relative z-10 mt-6">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                {t("home.feature4Title")}
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                                {t("home.feature4Desc")}
                            </p>
                        </div>
                    </div>

                    {/* Feature 5 - Hookah */}
                    <div className="group relative flex flex-col justify-between p-6 md:p-8 rounded-4xl bg-surface-container border border-white/5 hover:border-purple-500/40 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-purple-500/20 md:col-span-1 lg:col-span-2 lg:row-span-1 animate-fade-in-up [animation-delay:500ms] min-h-55">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/15 transition-all duration-700 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 h-full w-full">
                            <div className="flex flex-col justify-end h-full">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                                    {t("home.feature5Title")}
                                </h3>
                                <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
                                    {t("home.feature5Desc")}
                                </p>
                            </div>
                            <div className="p-5 bg-purple-500/10 text-purple-400 rounded-3xl shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border border-purple-500/20 self-start md:self-auto">
                                <HookahIcon className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
            />

            <BookingModal
                isOpen={isBookModalOpen}
                onClose={() => setIsBookModalOpen(false)}
                rooms={rooms}
                onSuccess={() => {
                    showNotice(t("home.bookingSuccess"));
                }}
            />
        </>
    );
}
