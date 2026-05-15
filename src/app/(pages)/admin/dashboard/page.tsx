"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import MetricCard from "@/components/MetricCard";
import { useLanguage } from "@/config/i18n";

interface Reservation {
	id: string;
	number: number;
	clientName: string;
	phone: string;
	roomName: string;
	dateTime: string;
	accepted: boolean;
	itemsCount: number;
	totalPrice: number;
}

/**
 * Premium Admin Dashboard Component.
 * Fully styled according to high-contrast Material You Dark Spec (GEMINI.md).
 * Uses pure SVG icons, contains absolutely NO emojis, and supports bilingual translations.
 */
export default function AdminDashboard() {
	const { t, isRtl } = useLanguage();

	// Pre-populated realistic cafe mock data (NO emojis)
	const [reservations, setReservations] = useState<Reservation[]>([
		{
			id: "res-1",
			number: 1024,
			clientName: "أحمد بن عبد الله",
			phone: "0501234567",
			roomName: "القاعة الرئيسية - طاولة 5",
			dateTime: "12 مايو 2026 - 08:30 م",
			accepted: true,
			itemsCount: 3,
			totalPrice: 85500,
		},
		{
			id: "res-2",
			number: 1025,
			clientName: "سليمان الدهان",
			phone: "0559876543",
			roomName: "قاعة VIP المغلقة",
			dateTime: "12 مايو 2026 - 09:15 م",
			accepted: false,
			itemsCount: 5,
			totalPrice: 180000,
		},
		{
			id: "res-3",
			number: 1026,
			clientName: "سارة عبد الرحمن",
			phone: "0543332211",
			roomName: "الشرفة الخارجية - طاولة 12",
			dateTime: "13 مايو 2026 - 06:00 م",
			accepted: false,
			itemsCount: 2,
			totalPrice: 42000,
		},
		{
			id: "res-4",
			number: 1027,
			clientName: "فيصل الحربي",
			phone: "0561112223",
			roomName: "القاعة الرئيسية - طاولة 2",
			dateTime: "13 مايو 2026 - 07:45 م",
			accepted: true,
			itemsCount: 4,
			totalPrice: 110000,
		},
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed">("all");
	const [isAdding, setIsAdding] = useState(false);
	
	// Form state for adding simulated reservation
	const [newClientName, setNewClientName] = useState("");
	const [newPhone, setNewPhone] = useState("");
	const [newRoom, setNewRoom] = useState("القاعة الرئيسية - طاولة 1");
	const [newPrice, setNewPrice] = useState("");

	// Actions
	const handleAccept = (id: string) => {
		setReservations(prev =>
			prev.map(res => (res.id === id ? { ...res, accepted: true } : res))
		);
	};

	const handleDelete = (id: string) => {
		setReservations(prev => prev.filter(res => res.id !== id));
	};

	const handleAddReservation = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newClientName || !newPhone) return;

		const newRes: Reservation = {
			id: `res-${Date.now()}`,
			number: reservations.length > 0 ? Math.max(...reservations.map(r => r.number)) + 1 : 1001,
			clientName: newClientName,
			phone: newPhone,
			roomName: newRoom,
			dateTime: t("dashboard.nowSimulated"),
			accepted: false,
			itemsCount: 1,
			totalPrice: parseFloat(newPrice) || 30000,
		};

		setReservations([newRes, ...reservations]);
		setNewClientName("");
		setNewPhone("");
		setNewPrice("");
		setIsAdding(false);
	};

	// Computations for premium metric cards
	const totalRevenue = reservations
		.filter(r => r.accepted)
		.reduce((sum, r) => sum + r.totalPrice, 0);

	const pendingCount = reservations.filter(r => !r.accepted).length;
	const confirmedCount = reservations.filter(r => r.accepted).length;

	// Filter & Search
	const filteredReservations = reservations.filter(res => {
		const matchesSearch =
			res.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
			res.phone.includes(searchQuery);

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

					{/* Action to toggle simulate reservation dialog */}
					<button
						onClick={() => setIsAdding(!isAdding)}
						className="px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
					>
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
								d="M12 4v16m8-8H4"
							/>
						</svg>
						<span>{t("reservations.addReservation")}</span>
					</button>
				</div>
			</div>

			{/* Collapsible New Reservation Simulation Form */}
			{isAdding && (
				<div className="rounded-[28px] border border-amber-500/30 bg-[#131522]/90 backdrop-blur-xl p-6 shadow-xl animate-fadeIn">
					<h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
						<span className="w-1.5 h-6 bg-amber-500 rounded-full" />
						{t("dashboard.testNotification")}
					</h3>
					<form onSubmit={handleAddReservation} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
						<div className="space-y-1.5">
							<label className="text-[10px] font-bold text-zinc-400 mr-1">{t("dashboard.columnClient")}</label>
							<input
								type="text"
								required
								value={newClientName}
								onChange={e => setNewClientName(e.target.value)}
								placeholder={t("dashboard.clientNamePlaceholder")}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[10px] font-bold text-zinc-400 mr-1">{t("dashboard.columnPhone")}</label>
							<input
								type="text"
								required
								value={newPhone}
								onChange={e => setNewPhone(e.target.value)}
								placeholder="05xxxxxxxx"
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[10px] font-bold text-zinc-400 mr-1">{t("dashboard.columnRoom")}</label>
							<select
								value={newRoom}
								onChange={e => setNewRoom(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
							>
								<option value="القاعة الرئيسية - طاولة 1">{t("dashboard.roomMain1")}</option>
								<option value="القاعة الرئيسية - طاولة 5">{t("dashboard.roomMain5")}</option>
								<option value="قاعة VIP المغلقة">{t("dashboard.roomVip")}</option>
								<option value="الشرفة الخارجية - طاولة 12">{t("dashboard.roomTerrace")}</option>
							</select>
						</div>

						<div className="space-y-1.5">
							<label className="text-[10px] font-bold text-zinc-400 mr-1">{t("dashboard.columnPrice")} ({t("common.currencySymbol")})</label>
							<div className="flex gap-2">
								<input
									type="number"
									value={newPrice}
									onChange={e => setNewPrice(e.target.value)}
									placeholder="30000"
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
								/>
								<button
									type="submit"
									className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#07080a] font-bold rounded-xl text-xs shrink-0 transition-all duration-200"
								>
									{t("common.save")}
								</button>
							</div>
						</div>
					</form>
				</div>
			)}

			{/* 4 Premium High-Contrast Metrics Cards (Material 3 Spec) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<MetricCard
					title={t("dashboard.statTotalBookings")}
					value={reservations.length}
					icon={
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					}
				/>
				<MetricCard
					title={t("dashboard.statPendingReservations")}
					value={pendingCount}
					highlight={pendingCount > 0}
					icon={
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					}
				/>
				<MetricCard
					title={t("dashboard.statActiveReservations")}
					value={confirmedCount}
					icon={
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					}
				/>
				<MetricCard
					title={t("dashboard.statTotalIncome")}
					value={`${totalRevenue.toLocaleString("en-US")} ${t("common.currencySymbol")}`}
					highlight
					icon={
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					}
				/>
			</div>

			{/* Main Tables Container with Filters & Search */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md">
				{/* Header actions of the list */}
				<div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
					{/* Tabs selection (No emojis) */}
					<div className="flex gap-2 bg-[#07080a] p-1 rounded-full border border-white/10 self-start">
						<button
							onClick={() => setActiveTab("all")}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeTab === "all" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
						>
							{t("reservations.filterAll")}
						</button>
						<button
							onClick={() => setActiveTab("pending")}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeTab === "pending" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
						>
							{t("reservations.filterPending")} ({pendingCount})
						</button>
						<button
							onClick={() => setActiveTab("confirmed")}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeTab === "confirmed" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
						>
							{t("reservations.filterAccepted")} ({confirmedCount})
						</button>
					</div>

					{/* Search Input */}
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={t("dashboard.searchPlaceholder")}
						className="max-w-sm w-full"
					/>
				</div>

				{/* Responsive Layout Table */}
				<div className="overflow-x-auto overflow-y-auto max-h-75 lg:max-h-[calc(100vh-320px)]">
					<table className="min-w-212.5 w-full border-collapse text-sm">
						<thead>
							<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnNumber")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnClient")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnRoom")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnDateTime")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("dashboard.columnPrice")}</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">{t("dashboard.columnStatus")}</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">{t("common.actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredReservations.length > 0 ? (
								filteredReservations.map(res => (
									<tr
										key={res.id}
										className="group hover:bg-[#1a1c2c]/40 transition-all duration-200"
									>
										<td className={`py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											#{res.number}
										</td>
										<td className={`py-4 px-4 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											<div className="flex flex-col">
												<span className="font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
													{res.clientName}
												</span>
												<span className="text-[10px] text-zinc-500 font-bold mt-0.5">
													{res.phone}
												</span>
											</div>
										</td>
										<td className={`py-4 px-4 font-semibold text-zinc-300 text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.roomName}
										</td>
										<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.dateTime}
										</td>
										<td className={`py-4 px-4 font-black text-amber-400 text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.totalPrice.toLocaleString("en-US")} {t("common.currencySymbol")}
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
													res.accepted
														? "bg-green-500/10 text-green-400 border-green-500/20"
														: "bg-amber-500/10 text-amber-300 border-amber-500/25"
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${
														res.accepted
															? "bg-green-400"
															: "bg-amber-400 animate-pulse"
													}`}
												/>
												{res.accepted ? t("reservations.statusAccepted") : t("reservations.statusPending")}
											</span>
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex justify-center items-center gap-2">
												{!res.accepted && (
													<button
														onClick={() => handleAccept(res.id)}
														className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200"
														title={t("dashboard.actionAccept")}
													>
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
																d="M5 13l4 4L19 7"
															/>
														</svg>
													</button>
												)}
												<button
													onClick={() => handleDelete(res.id)}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
													title={t("common.delete")}
												>
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
															strokeWidth="2"
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="py-12 text-center text-zinc-500 font-medium text-xs"
									>
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
