"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";

interface NotificationLog {
	id: string;
	title_ar: string;
	title_en: string;
	message_ar: string;
	message_en: string;
	type: string; // success, warning, info, error
	created_at: string;
}

/**
 * Admin Notifications Control and History Logging Page.
 * Implements the Notification model. Displays triggered system-wide notifications,
 * and allows administrators to broadcast simulated notifications to users.
 */
export default function NotificationsAdmin() {
	const { t, isRtl } = useLanguage();

	// Pre-seeded database matching Notification model
	const [logs, setLogs] = useState<NotificationLog[]>([
		{
			id: "n1",
			title_ar: "تم تحضير الطلب!",
			title_en: "Order is Ready!",
			message_ar: "الطلب رقم #2405 تم تحضيره بنجاح وهو جاهز للاستلام الآن.",
			message_en: "Order #2405 has been successfully prepared and is ready for pickup.",
			type: "success",
			created_at: "12 مايو 2026 19:30",
		},
		{
			id: "n2",
			title_ar: "تنبيه: مخزون منخفض!",
			title_en: "Alert: Low Stock!",
			message_ar: "أوشكت حبوب الإسبريسو على النفاد. يرجى إعادة تعبئة المخزون قريباً.",
			message_en: "Espresso coffee beans are almost out of stock. Please replenish soon.",
			type: "warning",
			created_at: "12 مايو 2026 18:15",
		},
		{
			id: "n3",
			title_ar: "فشلت عملية الدفع!",
			title_en: "Transaction Failed!",
			message_ar: "تم رفض المعاملة رقم #A329 من قِبل معالج الدفع الإلكتروني.",
			message_en: "Transaction #A329 was declined by the online payment gateway.",
			type: "error",
			created_at: "11 مايو 2026 21:00",
		},
		{
			id: "n4",
			title_ar: "تحسين وصيانة النظام",
			title_en: "System Upkeep & Maintenance",
			message_ar: "من مقرر إجراء صيانة وقائية وتحسين لقاعدة البيانات الليلة الساعة 2:00 صباحاً.",
			message_en: "Scheduled database maintenance and optimizations tonight at 2:00 AM.",
			type: "info",
			created_at: "10 مايو 2026 10:00",
		},
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
	const [isOpen, setIsOpen] = useState(false);

	// Form triggers
	const [bTitle, setBTitle] = useState("");
	const [bMessage, setBMessage] = useState("");
	const [bType, setBType] = useState("info");

	// Filter notifications
	const filteredLogs = logs.filter((log) => {
		const targetTitle = isRtl ? log.title_ar : log.title_en;
		const targetMessage = isRtl ? log.message_ar : log.message_en;
		const matchesSearch =
			targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
			targetMessage.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = selectedTypeFilter === "all" || log.type === selectedTypeFilter;
		return matchesSearch && matchesType;
	});

	const handleOpenBroadcast = () => {
		setBTitle("");
		setBMessage("");
		setBType("info");
		setIsOpen(true);
	};

	const handleSendBroadcast = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!bTitle.trim() || !bMessage.trim()) return;

		// 1. Optimistic UI insertion inside state database matching Prisma
		const newLog: NotificationLog = {
			id: `n-${Date.now()}`,
			title_ar: bTitle,
			title_en: bTitle,
			message_ar: bMessage,
			message_en: bMessage,
			type: bType,
			created_at: new Date().toLocaleString(isRtl ? "ar-SA" : "en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		setLogs((prev) => [newLog, ...prev]);
		setIsOpen(false);

		// 2. Trigger real broadcast to active SSE listeners via helper api
		try {
			await fetch(
				`/api/notifications/create?title=${encodeURIComponent(bTitle)}&message=${encodeURIComponent(
					bMessage
				)}&type=${bType}`
			);
		} catch (err) {
			console.error("Failed to broadcast SSE notification:", err);
		}
	};

	const handleDeleteLog = (id: string) => {
		setLogs((prev) => prev.filter((log) => log.id !== id));
	};

	const handleClearAllLogs = () => {
		const warningMsg = t("notifications.confirmClearLogs");
		if (confirm(warningMsg)) {
			setLogs([]);
		}
	};

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<AdminHeader
				title={t("notifications.title")}
				subtitle={t("notifications.subtitle")}
			>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					{logs.length > 0 && (
						<button
							onClick={handleClearAllLogs}
							className="px-4 py-2.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all w-full sm:w-auto"
						>
							{t("notifications.btnClearLogs")}
						</button>
					)}
					<button
						onClick={handleOpenBroadcast}
						className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
						</svg>
						<span>{t("notifications.broadcastNotification")}</span>
					</button>
				</div>
			</AdminHeader>

			{/* Filters Panel (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:max-w-xl">
						{/* Search field */}
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={t("notifications.searchPlaceholder")}
						/>

						{/* Filter dropdown type */}
						<select
							value={selectedTypeFilter}
							onChange={(e) => setSelectedTypeFilter(e.target.value)}
							className="bg-[#07080a] border border-white/10 text-zinc-300 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 transition-all"
						>
							<option value="all">{t("notifications.filterAll")}</option>
							<option value="success">{t("notifications.filterSuccess")}</option>
							<option value="info">{t("notifications.filterInfo")}</option>
							<option value="warning">{t("notifications.filterWarning")}</option>
							<option value="error">{t("notifications.filterError")}</option>
						</select>
					</div>

					<span className="text-xs text-zinc-400 font-bold">
						{t("notifications.totalLogs")} {filteredLogs.length}
					</span>
				</div>

				{/* Table area with minimum width safety to prevent crowding (min-w-212.5) */}
				<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
					<table className="min-w-212.5 w-full border-collapse text-sm">
						<thead>
							<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
								<th className="pb-3 px-4 whitespace-nowrap">{t("notifications.columnTitle")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("notifications.columnMessage")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("notifications.columnType")}</th>
								<th className="pb-3 px-4 whitespace-nowrap">{t("notifications.columnCreated")}</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">{t("common.actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredLogs.length > 0 ? (
								filteredLogs.map((log) => (
									<tr key={log.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
										<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{isRtl ? log.title_ar : log.title_en}
										</td>
										<td className={`py-4 px-4 text-zinc-300 font-semibold text-xs whitespace-normal max-w-sm ${isRtl ? "text-right" : "text-left"}`}>
											{isRtl ? log.message_ar : log.message_en}
										</td>
										<td className="py-4 px-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
													log.type === "success" && "bg-green-500/10 text-green-400 border-green-500/20"
												} ${
													log.type === "warning" && "bg-amber-500/10 text-amber-300 border-amber-500/25"
												} ${
													log.type === "error" && "bg-red-500/10 text-red-400 border-red-500/20"
												} ${
													log.type === "info" && "bg-blue-500/10 text-blue-400 border-blue-500/20"
												}`}
											>
												{log.type === "success" && t("notifications.filterSuccess")}
												{log.type === "warning" && t("notifications.filterWarning")}
												{log.type === "error" && t("notifications.filterError")}
												{log.type === "info" && t("notifications.filterInfo")}
											</span>
										</td>
										<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{log.created_at}
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex items-center justify-center">
												<button
													onClick={() => handleDeleteLog(log.id)}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
													title={t("common.delete")}
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="py-10 text-center text-zinc-500 font-medium text-xs">
										{t("common.noData")}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal BROADCAST NEW SYSTEM-WIDE NOTIFICATION */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsOpen(false)}
							className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors`}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<h2 className="text-lg font-black text-white mb-4">{t("notifications.modalTitle")}</h2>

						<form onSubmit={handleSendBroadcast} className="space-y-4">
							{/* Broadcast Title */}
							<div className="space-y-1.5">
								<label htmlFor="bTitleIn" className="text-xs font-bold text-zinc-400 block">
									{t("notifications.formTitle")}
								</label>
								<input
									id="bTitleIn"
									type="text"
									value={bTitle}
									onChange={(e) => setBTitle(e.target.value)}
									placeholder={t("notifications.formTitlePlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
									required
								/>
							</div>

							{/* Broadcast Message */}
							<div className="space-y-1.5">
								<label htmlFor="bMessageIn" className="text-xs font-bold text-zinc-400 block">
									{t("notifications.formMessage")}
								</label>
								<textarea
									id="bMessageIn"
									value={bMessage}
									onChange={(e) => setBMessage(e.target.value)}
									placeholder={t("notifications.formMessagePlaceholder")}
									className="w-full h-24 bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all resize-none block"
									required
								/>
							</div>

							{/* Broadcast Category (success, info, warning, error) */}
							<div className="space-y-1.5">
								<label htmlFor="bTypeIn" className="text-xs font-bold text-zinc-400 block">
									{t("notifications.formTypeLabel")}
								</label>
								<select
									id="bTypeIn"
									value={bType}
									onChange={(e) => setBType(e.target.value)}
									className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								>
									<option value="success">{t("notifications.optionSuccess")}</option>
									<option value="info">{t("notifications.optionInfo")}</option>
									<option value="warning">{t("notifications.optionWarning")}</option>
									<option value="error">{t("notifications.optionError")}</option>
								</select>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
								>
									{t("common.cancel")}
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all"
								>
									{t("notifications.btnBroadcastNow")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
