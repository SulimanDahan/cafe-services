"use client";

import { useState, useEffect, useCallback } from "react";
import { PrimaryButton } from "@/components/button/primary_button";
import MetricCard from "@/components/metric_card";
import {
    RefreshIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    MoneyIcon,
    BuildingIcon,
    ItemIcon,
    OrderIcon,
    UsersIcon,
    MegaphoneIcon,
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useUser } from "@/context/user_context";
import { DASHBOARD_API_ROUTE } from "@/config/api_routes";

interface DashboardStats {
    totalReservations: number;
    pendingReservations: number;
    acceptedReservations: number;
    completedReservations: number;
    activeRooms: number;
    totalRooms: number;
    inactiveRooms: number;
    activeItems: number;
    totalItems: number;
    inactiveItems: number;
    totalNews: number;
    activeNews: number;
    inactiveNews: number;
    totalUsers: number;
    adminUsers: number;
    staffUsers: number;
    totalRevenue: number;
    totalOrderedUnits: number;
}

interface DashboardData {
    stats: DashboardStats;
}

/**
 * Admin Dashboard — Live data from DB.
 * Stats fetched from /api/dashboard.
 */
export default function AdminDashboard() {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const { user } = useUser();

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [range, setRange] = useState<"today" | "week" | "month" | "all">(
        "today",
    );

    const loadDashboard = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${DASHBOARD_API_ROUTE}?range=${range}`);
            if (!res.ok) throw new Error("Failed to load dashboard");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [range]);

    useEffect(() => {
        (async () => await loadDashboard())();
    }, [loadDashboard]);

    const stats = data?.stats;

    return (
        <div className="space-y-8">
            {/* Welcome Hero Panel */}
            <div className="rounded-card border border-white/10 bg-linear-to-br from-primary/10 via-surface/30 to-transparent p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                    <div>
                        <span className="px-4 py-2 rounded-full text-[10px] sm:text-xs font-black bg-primary/10 border border-primary/20 text-primary-hover uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            {t("dashboard.title")}
                        </span>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-5 tracking-tight text-white flex flex-wrap gap-2 items-center">
                            {t("dashboard.welcomeTitle")}
                            {user?.username && (
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary-hover to-amber-200">
                                    {user.username}
                                </span>
                            )}
                        </h1>
                        <p className="text-zinc-400 text-sm sm:text-base mt-2 font-medium max-w-lg leading-relaxed">
                            {t("dashboard.subtitle")}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto self-stretch xl:self-auto shrink-0 mt-2 xl:mt-0">
                        {/* Range Selector */}
                        <div className="flex items-center gap-0.5 p-1 bg-[#0d0f17]/60 border border-white/10 rounded-full justify-between sm:justify-start">
                            {(["today", "week", "month", "all"] as const).map(
                                (r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${range === r
                                            ? "bg-primary text-background shadow-md"
                                            : "text-zinc-400 hover:text-white cursor-pointer"
                                            }`}
                                    >
                                        {t(
                                            `dashboard.range${r.charAt(0).toUpperCase() + r.slice(1)}`,
                                        )}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Refresh Button */}
                        <PrimaryButton
                            onClick={loadDashboard}
                            disabled={isLoading}
                            size="md"
                            className="group justify-center"
                        >
                            <RefreshIcon
                                className={`w-4 h-4 transition-duration-500 group-hover:rotate-180 ${isLoading ? "animate-spin" : ""}`}
                            />
                            <span>
                                {isLoading
                                    ? t("common.loading")
                                    : t("dashboard.refresh")}
                            </span>
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            {/* Reservations & Revenue */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white px-2 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    {t("dashboard.statTotalBookings")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <MetricCard
                        title={t(
                            `dashboard.statTotalIncome${range.charAt(0).toUpperCase() + range.slice(1)}`,
                        )}
                        value={
                            isLoading
                                ? "—"
                                : `${(stats?.totalRevenue ?? 0).toLocaleString("en-US")} ${t(`common.${settings.currency_name}`)}`
                        }
                        highlight
                        icon={<MoneyIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                        title={t("dashboard.statOrderedUnits")}
                        value={
                            isLoading ? "—" : (stats?.totalOrderedUnits ?? 0)
                        }
                        icon={<OrderIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                        title={t("dashboard.statTotalBookings")}
                        value={
                            isLoading ? "—" : (stats?.totalReservations ?? 0)
                        }
                        icon={<CalendarIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                        title={t("dashboard.statPendingReservations")}
                        value={
                            isLoading ? "—" : (stats?.pendingReservations ?? 0)
                        }
                        highlight={(stats?.pendingReservations ?? 0) > 0}
                        icon={<ClockIcon className="w-6 h-6" />}
                    />
                    <MetricCard
                        title={t(
                            `dashboard.statActiveReservations${range.charAt(0).toUpperCase() + range.slice(1)}`,
                        )}
                        value={
                            isLoading ? "—" : (stats?.acceptedReservations ?? 0)
                        }
                        icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />}
                    />
                    <MetricCard
                        title={t(
                            `dashboard.statCompletedReservations${range.charAt(0).toUpperCase() + range.slice(1)}`,
                        )}
                        value={
                            isLoading ? "—" : (stats?.completedReservations ?? 0)
                        }
                        icon={<CheckCircleIcon className="w-6 h-6 text-primary" />}
                    />
                </div>
            </div>

            {/* Resources (Rooms, Items, News, Users) */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6">
                    <ResourceCard
                        title={t("dashboard.statTotalRooms")}
                        icon={<BuildingIcon className="w-5 h-5" />}
                        colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        total={isLoading ? "—" : (stats?.totalRooms ?? 0)}
                        activeLabel={t("dashboard.statActiveRooms")}
                        activeCount={isLoading ? "—" : (stats?.activeRooms ?? 0)}
                        inactiveLabel={t("dashboard.statInactiveRooms")}
                        inactiveCount={isLoading ? "—" : (stats?.inactiveRooms ?? 0)}
                    // isLoading={isLoading}
                    />
                    <ResourceCard
                        title={t("dashboard.statTotalItems")}
                        icon={<ItemIcon className="w-5 h-5" />}
                        colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        total={isLoading ? "—" : (stats?.totalItems ?? 0)}
                        activeLabel={t("dashboard.statActiveItems")}
                        activeCount={isLoading ? "—" : (stats?.activeItems ?? 0)}
                        inactiveLabel={t("dashboard.statInactiveItems")}
                        inactiveCount={isLoading ? "—" : (stats?.inactiveItems ?? 0)}
                    // isLoading={isLoading}
                    />
                    <ResourceCard
                        title={t("dashboard.statTotalNews")}
                        icon={<MegaphoneIcon className="w-5 h-5" />}
                        colorClass="bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        total={isLoading ? "—" : (stats?.totalNews ?? 0)}
                        activeLabel={t("dashboard.statActiveNews")}
                        activeCount={isLoading ? "—" : (stats?.activeNews ?? 0)}
                        inactiveLabel={t("dashboard.statInactiveNews")}
                        inactiveCount={isLoading ? "—" : (stats?.inactiveNews ?? 0)}
                    // isLoading={isLoading}
                    />
                    <ResourceCard
                        title={t("dashboard.statTotalUsers")}
                        icon={<UsersIcon className="w-5 h-5" />}
                        colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        total={isLoading ? "—" : (stats?.totalUsers ?? 0)}
                        activeLabel={t("dashboard.statAdminUsers")}
                        activeCount={isLoading ? "—" : (stats?.adminUsers ?? 0)}
                        inactiveLabel={t("dashboard.statStaffUsers")}
                        inactiveCount={isLoading ? "—" : (stats?.staffUsers ?? 0)}
                    // isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * A specialized card component for displaying grouped entity statistics (Total, Active, Inactive).
 */
function ResourceCard({
    title,
    icon,
    colorClass,
    total,
    activeLabel,
    activeCount,
    inactiveLabel,
    inactiveCount,
}: {
    title: string;
    icon: React.ReactNode;
    colorClass: string;
    total: number | string;
    activeLabel: string;
    activeCount: number | string;
    inactiveLabel: string;
    inactiveCount: number | string;
}) {
    return (
        <div className="rounded-card border border-white/10 bg-surface p-5 sm:p-6 flex flex-col gap-5 shadow-md hover:border-white/20 transition-all group relative overflow-hidden h-full">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-current" />

            <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}
                    >
                        {icon}
                    </div>
                    <span className="font-bold text-white text-sm sm:text-base leading-tight">
                        {title}
                    </span>
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white">
                    {total}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-[#07080a] rounded-xl p-3 flex flex-col gap-1 border border-white/5">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {activeLabel}
                    </span>
                    <span className="text-green-400 font-bold text-base sm:text-lg">
                        {activeCount}
                    </span>
                </div>
                <div className="bg-[#07080a] rounded-xl p-3 flex flex-col gap-1 border border-white/5">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {inactiveLabel}
                    </span>
                    <span className="text-red-400 font-bold text-base sm:text-lg">
                        {inactiveCount}
                    </span>
                </div>
            </div>
        </div>
    );
}
