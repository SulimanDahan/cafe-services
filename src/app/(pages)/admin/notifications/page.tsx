"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { MegaphoneIcon, TrashIcon } from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { NOTIFICATION_API_ROUTE, NOTIFICATION_CREATE_API_ROUTE, NOTIFICATION_STREAM_API_ROUTE } from "@/config/api_routes";
import Table, { TableColumn } from "@/components/table";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";

interface NotificationLog {
	id: string;
	title: string;
	message: string;
	created_at: string;
}

/**
 * Admin Notifications Control and History Logging Page.
 * Implements the Notification model. Displays triggered system-wide notifications,
 * and allows administrators to broadcast simulated notifications to users.
 */
export default function NotificationsAdmin() {
	const { t, isRtl } = useLanguage();
	const { settings } = useSettings();

	const columns: TableColumn[] = [
		{ key: "title", label: t("notifications.columnTitle") },
		{ key: "message", label: t("notifications.columnMessage") },
		{ key: "type", label: t("notifications.columnType") },
		{ key: "created", label: t("notifications.columnCreated") },
		{ key: "actions", label: t("common.actions"), align: "center" },
	];

	const [logs, setLogs] = useState<NotificationLog[]>([]);
	const [isLogsLoading, setIsLogsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const perPage = settings.per_page || 10;

	const fetchLogs = async (page: number, search: string) => {
		setIsLogsLoading(true);
		try {
			const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
			if (search) params.set("search", search);
			const res = await fetch(`${NOTIFICATION_API_ROUTE}?${params.toString()}`);
			if (res.ok) {
				const data = await res.json();
				setLogs(data.data || []);
				setTotal(data.total || 0);
				setTotalPages(data.totalPages || 0);
			}
		} catch (err) {
			console.error("Failed to fetch notifications:", err);
		} finally {
			setIsLogsLoading(false);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchLogs(currentPage, searchQuery);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, perPage]);

	useEffect(() => {
		// Listen for real-time updates via SSE — refresh first page on new notification
		const eventSource = new EventSource(NOTIFICATION_STREAM_API_ROUTE);
		eventSource.addEventListener("notification-created", () => {
			setCurrentPage(1);
			fetchLogs(1, searchQuery);
		});
		return () => { eventSource.close(); };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
	const [isOpen, setIsOpen] = useState(false);

	// Form triggers
	const [bTitle, setBTitle] = useState("");
	const [bMessage, setBMessage] = useState("");
	const [bType, setBType] = useState("info");


	const handleOpenBroadcast = () => {
		setBTitle("");
		setBMessage("");
		setBType("info");
		setIsOpen(true);
	};

	const handleSendBroadcast = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!bTitle.trim() || !bMessage.trim()) return;

		// 1. Trigger real broadcast to active SSE listeners via helper api
		try {
			await fetch(
				NOTIFICATION_CREATE_API_ROUTE, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: bTitle, message: bMessage })
			}
			);
			setIsOpen(false);
		} catch (err) {
			console.error("Failed to broadcast SSE notification:", err);
		}


	};

	const handleDeleteLog = async (id: string) => {
		try {
			await fetch(`${NOTIFICATION_API_ROUTE}/${id}`, { method: "DELETE" });
			fetchLogs(currentPage, searchQuery);
		} catch (err) {
			console.error("Failed to delete notification:", err);
		}
	};

	const handleClearAllLogs = async () => {
		const warningMsg = t("notifications.confirmClearLogs");
		if (confirm(warningMsg)) {
			try {
				await fetch(NOTIFICATION_API_ROUTE, { method: "DELETE" });
				setLogs([]);
				setTotal(0);
				setTotalPages(0);
				setCurrentPage(1);
			} catch (err) {
				console.error("Failed to clear notifications:", err);
			}
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
					<PrimaryButton
						onClick={handleOpenBroadcast}
						size="md"
						className="shrink-0"
					>
						<MegaphoneIcon className="w-4 h-4" />
						<span>{t("notifications.broadcastNotification")}</span>
					</PrimaryButton>
				</div>
			</AdminHeader>

			{/* Filters Panel (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">

					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:max-w-xl">
						<SearchInput
							value={searchQuery}
							onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
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
						{t("notifications.totalLogs")} {total}
					</span>
				</div>

				<Table
					columns={columns}
					isLoading={isLogsLoading}
					dataLength={total}
				>
					{logs.map((log) => (
						<tr key={log.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
							<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
								{log.title}
							</td>
							<td className={`py-4 px-4 text-zinc-300 font-semibold text-xs whitespace-normal max-w-sm ${isRtl ? "text-right" : "text-left"}`}>
								{log.message}
							</td>
							<td className="py-4 px-4 whitespace-nowrap">
								<Badge variant="info">
									{t("notifications.filterInfo")}
								</Badge>
							</td>
							<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
								{new Date(log.created_at).toLocaleString(isRtl ? "ar-SA" : "en-US", {
									day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
								})}
							</td>
							<td className="py-4 px-4 text-center whitespace-nowrap">
								<div className="flex items-center justify-center">
									<button
										onClick={() => handleDeleteLog(log.id)}
										className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
										title={t("common.delete")}
									>
										<TrashIcon className="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</Table>
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={total}
					itemsPerPage={perPage}
					onPageChange={setCurrentPage}
				/>
			</div>

			<AdminModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title={t("notifications.modalTitle")}
			>
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
						<PrimaryButton
							type="button"
							onClick={() => setIsOpen(false)}
							variant="secondary"
							size="md"
						>
							{t("common.cancel")}
						</PrimaryButton>
						<PrimaryButton
							type="submit"
							size="md"
						>
							{t("notifications.btnBroadcastNow")}
						</PrimaryButton>
					</div>
				</form>
			</AdminModal>
		</div>
	);
}
