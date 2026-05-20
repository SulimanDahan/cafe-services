"use client";

import { useState, useEffect, useCallback } from "react";
import SearchInput from "@/components/SearchInput";
import MetricCard from "@/components/MetricCard";
import { RefreshIcon, CalendarIcon, ClockIcon, CheckCircleIcon, MoneyIcon, BuildingIcon, ItemIcon, OrderIcon, CheckIcon, TrashIcon } from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { DASHBOARD_API_ROUTE } from "@/config/api_routes";
import { useReservation } from "@/context/reservation_context";
import ReservationModel from "@/models/data_models/reservation_model";

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
	recentReservations: ReservationModel[];
}

/**
 * Admin Dashboard — Live data from DB.
 * Stats fetched from /api/dashboard. Accept/delete actions via ReservationContext.
 */
export default function AdminDashboard() {
	const { t, isRtl } = useLanguage();
	const { settings } = useSettings();
	const { acceptReservation, deleteReservation } = useReservation();

	const [data, setData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed">("all");

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
		const fetchInitialData = async () => {
			await loadDashboard();
		};
		fetchInitialData();
	}, [loadDashboard]);

	// Accept reservation then refresh dashboard
	const handleAccept = async (id: string) => {
		await acceptReservation(id);
		await loadDashboard();
	};

	// Delete reservation then refresh dashboard
	const handleDelete = async (id: string) => {
		if (!confirm(t("common.confirmDelete"))) return;
		await deleteReservation(id);
		await loadDashboard();
	};

	const formatDate = (date: Date | string) => {
		const d = new Date(date);
		return d.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
			day: "numeric", month: "long", year: "numeric",
			hour: "2-digit", minute: "2-digit",
		});
	};

	const stats = data?.stats;
	const reservations = data?.recentReservations ?? [];

	const filteredReservations = reservations.filter((res) => {
		const matchesSearch =
			res.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			res.phone.includes(searchQuery) ||
			(res.room?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			String(res.number).includes(searchQuery);

		if (activeTab === "pending") return matchesSearch && !res.accepted;
		if (activeTab === "confirmed") return matchesSearch && res.accepted;
		return matchesSearch;
	});

	return (
		<div className="space-y-6">
			{/* Welcome Hero Panel */}
			<div className="rounded-[28px] border border-white/10 bg-linear-to-br from-amber-500/10 via-[#131522]/30 to-transparent p-6 sm:p-8 shadow-xl">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
							{t("dashboard.title")}
						</span>
						<h1 className="text-2xl sm:text-3xl font-black mt-4 tracking-tight text-white">
							{t("dashboard.welcomeTitle")}
						</h1>
						<p className="text-zinc-400 text-xs sm:text-sm mt-1 font-medium">
							{t("dashboard.subtitle")}
						</p>
					</div>

					{/* Refresh Button */}
					<button
						onClick={loadDashboard}
						disabled={isLoading}
						className="px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#07080a] font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 cursor-pointer"
					>
						<RefreshIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span>{isLoading ? t("common.loading") : t("dashboard.refresh")}</span>
					</button>
				</div>
			</div>

			{/* 4 Metric Cards — Live Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<MetricCard
					title={t("dashboard.statTotalBookings")}
					value={isLoading ? "—" : stats?.totalReservations ?? 0}
					icon={
						<CalendarIcon className="w-6 h-6" />
					}
				/>
				<MetricCard
					title={t("dashboard.statPendingReservations")}
					value={isLoading ? "—" : stats?.pendingReservations ?? 0}
					highlight={(stats?.pendingReservations ?? 0) > 0}
					icon={
						<ClockIcon className="w-6 h-6" />
					}
				/>
				<MetricCard
					title={t("dashboard.statActiveReservations")}
					value={isLoading ? "—" : stats?.acceptedReservations ?? 0}
					icon={
						<CheckCircleIcon className="w-6 h-6" />
					}
				/>
				<MetricCard
					title={t("dashboard.statTotalIncome")}
					value={isLoading ? "—" : `${(stats?.totalRevenue ?? 0).toLocaleString("en-US")} ${t(`common.${settings.currency_name}`)}`}
					highlight
					icon={
						<MoneyIcon className="w-6 h-6" />
					}
				/>
			</div>

			{/* Secondary Stats Row */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-5 flex items-center gap-4 shadow-md hover:border-amber-500/20 transition-colors">
					<div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
						<BuildingIcon className="w-5 h-5" />
					</div>
					<div>
						<p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">{t("dashboard.statActiveRooms")}</p>
						<p className="text-2xl font-black text-white">{isLoading ? "—" : stats?.totalRooms ?? 0}</p>
					</div>
				</div>

				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-5 flex items-center gap-4 shadow-md hover:border-amber-500/20 transition-colors">
					<div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
						<ItemIcon className="w-5 h-5" />
					</div>
					<div>
						<p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">{t("dashboard.statMenuItems")}</p>
						<p className="text-2xl font-black text-white">{isLoading ? "—" : stats?.totalItems ?? 0}</p>
					</div>
				</div>

				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-5 flex items-center gap-4 shadow-md hover:border-amber-500/20 transition-colors">
					<div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
						<OrderIcon className="w-5 h-5" />
					</div>
					<div>
						<p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">{t("dashboard.statOrderedUnits")}</p>
						<p className="text-2xl font-black text-white">{isLoading ? "—" : stats?.totalOrderedUnits ?? 0}</p>
					</div>
				</div>
			</div>

			{/* Recent Reservations Table */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md">
				{/* Header + filters */}
				<div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
					{/* Tabs */}
					<div className="flex gap-2 bg-[#07080a] p-1 rounded-full border border-white/10 self-start">
						<button
							onClick={() => setActiveTab("all")}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === "all" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
						>
							{t("reservations.filterAll")}
						</button>
						<button
							onClick={() => setActiveTab("pending")}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === "pending" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
						>
							{t("reservations.filterPending")} ({stats?.pendingReservations ?? 0})
						</button>
						<button
							onClick={() => setActiveTab("confirmed")}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === "confirmed" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
						>
							{t("reservations.filterAccepted")} ({stats?.acceptedReservations ?? 0})
						</button>
					</div>

					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={t("dashboard.searchPlaceholder")}
						className="max-w-sm w-full"
					/>
				</div>

				{/* Table */}
				<div className="overflow-x-auto overflow-y-auto max-h-75 lg:max-h-[calc(100vh-420px)]">
					<table className="min-w-212.5 w-full border-collapse text-sm">
						<thead>
							<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnNumber")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnClient")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnRoom")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnDateTime")}</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">{t("dashboard.columnStatus")}</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">{t("common.actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{isLoading ? (
								<tr>
									<td colSpan={6} className="py-12 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
											<span className="text-xs text-zinc-500 font-bold">{t("common.loading")}</span>
										</div>
									</td>
								</tr>
							) : filteredReservations.length > 0 ? (
								filteredReservations.map((res) => (
									<tr
										key={res.id}
										className="group hover:bg-[#1a1c2c]/40 transition-all duration-200"
									>
										<td className={`py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											R-{res.number}
										</td>
										<td className={`py-4 px-4 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											<div className="flex flex-col">
												<span className="font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
													{res.client_name}
												</span>
												<span className="text-[10px] text-zinc-500 font-bold mt-0.5">
													{res.phone}
												</span>
											</div>
										</td>
										<td className={`py-4 px-4 font-semibold text-zinc-300 text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.room?.name ?? t("common.unknown")}
										</td>
										<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{formatDate(res.date_time)}
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${res.accepted
													? "bg-green-500/10 text-green-400 border-green-500/20"
													: "bg-amber-500/10 text-amber-300 border-amber-500/25"
												}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${res.accepted ? "bg-green-400" : "bg-amber-400 animate-pulse"}`} />
												{res.accepted ? t("reservations.statusAccepted") : t("reservations.statusPending")}
											</span>
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex justify-center items-center gap-2">
												{!res.accepted && (
													<button
														onClick={() => handleAccept(res.id)}
														className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200 cursor-pointer"
														title={t("dashboard.actionAccept")}
													>
														<CheckIcon className="w-4 h-4" />
													</button>
												)}
												<button
													onClick={() => handleDelete(res.id)}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
													title={t("common.delete")}
												>
													<TrashIcon className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={6} className="py-12 text-center text-zinc-500 font-medium text-xs">
										{t("common.noData")}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
