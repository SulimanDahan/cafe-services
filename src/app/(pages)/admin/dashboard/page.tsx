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
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useUser } from "@/context/user_context";
import { DASHBOARD_API_ROUTE } from "@/config/api_routes";

interface DashboardStats {
 totalReservations: number;
 pendingReservations: number;
 acceptedReservations: number;
 totalRooms: number;
 totalItems: number;
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

 const loadDashboard = useCallback(async () => {
 setIsLoading(true);
 try {
 const res = await fetch(DASHBOARD_API_ROUTE);
 if (!res.ok) throw new Error("Failed to load dashboard");
 const json = await res.json();
 setData(json);
 } catch (err) {
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 }, []);

 useEffect(() => {
 (async () => await loadDashboard())();
 }, [loadDashboard]);

 const stats = data?.stats;

 return (
 <div className="space-y-8">
 {/* Welcome Hero Panel */}
 <div className="rounded-card border border-white/10 bg-linear-to-br from-primary/10 via-surface/30 to-transparent p-6 sm:p-8 shadow-xl">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <span className="px-4 py-2 rounded-full text-[10px] sm:text-xs font-black bg-primary/10 border border-primary/20 text-primary-hover uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
 {t("dashboard.title")}
 </span>
 <h1 className="text-3xl sm:text-4xl font-black mt-5 tracking-tight text-white flex flex-wrap gap-2 items-center">
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

 {/* Refresh Button */}
 <PrimaryButton
 onClick={loadDashboard}
 disabled={isLoading}
 size="md"
 className="group"
 >
 <RefreshIcon
 className={`w-4 h-4 transition- duration-500 group-hover:rotate-180 ${isLoading ? "animate-spin" : ""}`}
 />
 <span>
 {isLoading
 ? t("common.loading")
 : t("dashboard.refresh")}
 </span>
 </PrimaryButton>
 </div>
 </div>

 {/* Metric Cards — Live Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 <MetricCard
 title={t("dashboard.statTotalIncome")}
 value={
 isLoading
 ? "—"
 : `${(stats?.totalRevenue ?? 0).toLocaleString("en-US")} ${t(`common.${settings.currency_name}`)}`
 }
 highlight
 icon={<MoneyIcon className="w-6 h-6" />}
 />
 <MetricCard
 title={t("dashboard.statPendingReservations")}
 value={isLoading ? "—" : (stats?.pendingReservations ?? 0)}
 highlight={(stats?.pendingReservations ?? 0) > 0}
 icon={<ClockIcon className="w-6 h-6" />}
 />
 <MetricCard
 title={t("dashboard.statActiveReservations")}
 value={isLoading ? "—" : (stats?.acceptedReservations ?? 0)}
 icon={<CheckCircleIcon className="w-6 h-6" />}
 />
 <MetricCard
 title={t("dashboard.statTotalBookings")}
 value={isLoading ? "—" : (stats?.totalReservations ?? 0)}
 icon={<CalendarIcon className="w-6 h-6" />}
 />
 <MetricCard
 title={t("dashboard.statActiveRooms")}
 value={isLoading ? "—" : (stats?.totalRooms ?? 0)}
 icon={<BuildingIcon className="w-6 h-6" />}
 />
 <MetricCard
 title={t("dashboard.statMenuItems")}
 value={isLoading ? "—" : (stats?.totalItems ?? 0)}
 icon={<ItemIcon className="w-6 h-6" />}
 />
 <MetricCard
 title={t("dashboard.statOrderedUnits")}
 value={isLoading ? "—" : (stats?.totalOrderedUnits ?? 0)}
 icon={<OrderIcon className="w-6 h-6" />}
 />
 </div>
 </div>
 );
}
