"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/config/i18n";
import { Badge } from "@/components/badge";
import { Banner } from "@/components/banner";
import { Card } from "@/components/card";
import { BookingModal } from "@/components/partials/modals/reservation_modal";
import { ROOM_API_ROUTE } from "@/config/api_routes";
import { Toast, ToastType } from "@/components/toast";
import { PrimaryButton } from "@/components/button/primary_button";
import { CupIcon } from "@/components/icons/cup_icon";
import { SunIcon } from "@/components/icons/sun_icon";
import { CheckIcon } from "@/components/icons/check_icon";
import { UserIcon } from "@/components/icons/user_icon";
import InfoIcon from "@/components/icons/info_icon";
import { CalendarIcon } from "@/components/icons";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export default function Home() {
    const { t } = useLanguage();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
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
                const res = await fetch(`${ROOM_API_ROUTE}?fetch_all=true`);
                if (res.ok) {
                    const resData = await res.json();
                    const roomsList = Array.isArray(resData)
                        ? resData
                        : resData.success && Array.isArray(resData.data)
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

    // دالة مساعدة لإظهار التنبيه
    const showNotice = (message: string, type: ToastType = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
    };

    const services = [
        {
            id: "s1",
            name: t("home.service1Name"),
            desc: t("home.service1Desc"),
            price: t("home.service1Price"),
            status: t("home.statusActive"),
            rating: "4.9",
            icon: <CupIcon className="w-6 h-6 text-primary-hover" />,
        },
        {
            id: "s2",
            name: t("home.service2Name"),
            desc: t("home.service2Desc"),
            price: t("home.service2Price"),
            status: t("home.statusActive"),
            rating: "5.0",
            icon: <SunIcon className="w-6 h-6 text-primary-hover" />,
        },
        {
            id: "s3",
            name: t("home.service3Name"),
            desc: t("home.service3Desc"),
            price: t("home.service3Price"),
            status: t("home.statusActive"),
            rating: "4.8",
            icon: <UserIcon className="w-6 h-6 text-primary-hover" />,
        },
        {
            id: "s4",
            name: t("home.service4Name"),
            desc: t("home.service4Desc"),
            price: t("home.service4Price"),
            status: t("home.statusScheduled"),
            rating: "5.0",
            icon: <CheckIcon className="w-6 h-6 text-primary-hover" />,
        },
    ];

    return (
        <>
            <PWAInstallBanner appType="customer" />
            <main className="flex-1 max-w-7xl w-[calc(100%-2rem)] mx-auto md:px-4 lg:px-6 py-10 flex flex-col gap-10">
                {/* Hero Panel */}
                <div className="relative rounded-card overflow-hidden border border-white/10 bg-surface/40 p-6 sm:p-10 md:p-14 shadow-2xl">
                    <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-7 space-y-6">
                            <Badge pulse>{t("home.heroBadge")}</Badge>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white drop-shadow-lg">
                                {t("home.heroTitle")}
                            </h1>
                            <p className="text-zinc-300 text-sm sm:text-base md:text-lg font-medium">
                                {t("home.heroDesc")}
                            </p>

                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <PrimaryButton
                                    onClick={() => setIsBookModalOpen(true)}
                                >
                                    <CalendarIcon />
                                    {t("home.btnBookRoom")}
                                </PrimaryButton>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="zinc">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {t("home.tagDocker")}
                                    </Badge>
                                    <Badge variant="zinc">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {t("home.tagSse")}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Visual Dashboard */}
                        <div className="lg:col-span-5 w-full">
                            <div className="rounded-3xl border border-white/15 bg-[#0d0f17]/90 backdrop-blur-xl p-6 shadow-2xl relative">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase">
                                        {t("home.liveChannelsTitle")}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <span className="text-xs font-bold text-white">
                                            {t("home.simOrderTitle")}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 font-bold">
                                            {t("home.simOrderTime")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <Banner
                    title={t("home.guideTitle")}
                    desc={t("home.guideDesc")}
                    icon={<InfoIcon />}
                />

                {/* Services Grid */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                            {t("home.sectionTitle")}
                        </h2>
                        <span className="text-[11px] text-zinc-500 font-bold uppercase">
                            {t("home.cateringSubtitle")}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <Card
                                key={service.id}
                                id={service.id}
                                name={service.name}
                                desc={service.desc}
                                price={service.price}
                                status={service.status}
                                rating={service.rating}
                                isActive={hoveredCard === service.id}
                                onHover={setHoveredCard}
                                activeText={t("home.statusActive")}
                                iconSvg={service.icon}
                            />
                        ))}
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
