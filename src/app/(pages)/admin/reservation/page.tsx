"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations/reservation";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useReservation } from "@/context/reservation_context";
import { useRoom } from "@/context/room_context";
import { PlusIcon, CheckIcon, TrashIcon } from "@/components/icons";
import ReservationModel from "@/models/data_models/reservation_model";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";

/**
 * Admin Reservations Control Panel.
 * Connected to DB via ReservationContext and RoomContext.
 */
export default function ReservationsAdmin() {
	const { t, isRtl } = useLanguage();
	const { settings } = useSettings();
	const {
		reservations,
		total,
		totalPages,
		isReservationsLoading,
		fetchAllReservations,
		addReservation,
		acceptReservation,
		deleteReservation,
	} = useReservation();
	const { rooms, fetchAllRooms } = useRoom();

	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [showPast, setShowPast] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	// Form Modal Toggles
	const [isResOpen, setIsResOpen] = useState(false);

	// React Hook Form values interface
	interface ReservationFormValues {
		client_name: string;
		phone: string;
		room_id: string;
		date_time: string;
	}

	// React Hook Form
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ReservationFormValues>({
		resolver: zodResolver(reservationSchema) as unknown as Resolver<ReservationFormValues>,
		defaultValues: {
			client_name: "",
			phone: "",
			room_id: "",
			date_time: "",
		},
	});

	const perPage = settings.per_page || 10;

	// Server-fetch reservations when page, search, tab or showPast changes
	useEffect(() => {
		const params: Record<string, string> = {
			page: String(currentPage),
			per_page: String(perPage),
			all: String(showPast),
		};
		if (searchQuery) params.search = searchQuery;
		if (activeTab !== "all") params.status = activeTab;
		fetchAllReservations(params);
	}, [currentPage, searchQuery, activeTab, showPast, perPage, fetchAllReservations]);

	// Fetch rooms once for dropdown (not paginated)
	useEffect(() => {
		fetchAllRooms({ fetch_all: "true" });
	}, [fetchAllRooms]);

	const handleOpenAddForm = () => {
		reset({
			client_name: "",
			phone: "",
			room_id: rooms.find((r) => !r.is_disable)?.id ?? "",
			date_time: "",
		});
		setIsResOpen(true);
	};

	const handleAddReservation = async (data: ReservationFormValues) => {
		const success = await addReservation({
			client_name: data.client_name,
			phone: data.phone,
			room_id: data.room_id,
			date_time: new Date(data.date_time),
			accepted: false,
			completed: false,
		});

		if (success) {
			setIsResOpen(false);
		} else {
			alert(t("common.errorOccurred"));
		}
	};

	const handleAccept = async (id: string) => {
		await acceptReservation(id);
	};

	const handleDelete = async (id: string) => {
		if (confirm(t("common.confirmDelete"))) {
			await deleteReservation(id);
		}
	};

	const formatDate = (date: Date | string) => {
		const d = new Date(date);
		return d.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
			day: "numeric", month: "long", year: "numeric",
			hour: "2-digit", minute: "2-digit",
		});
	};

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<AdminHeader title={t("reservations.title")} subtitle={t("reservations.subtitle")}>
				<PrimaryButton
					onClick={handleOpenAddForm}
					size="md"
				>
					<PlusIcon className="w-4 h-4" />
					<span>{t("reservations.addReservation")}</span>
				</PrimaryButton>
			</AdminHeader>

			{/* Filters Panel */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				{/* Status Sub-Tabs and search bar */}
				<div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
					{/* Subtabs */}
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "all" ? "bg-white/10 text-white border border-white/20 font-extrabold" : "text-zinc-400 hover:text-zinc-200"
								}`}
						>
							{t("reservations.filterAll")} ({total})
						</button>
						<button
							onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "pending" ? "bg-amber-500/10 text-amber-300 border border-amber-500/25 font-extrabold" : "text-zinc-400 hover:text-zinc-200"
								}`}
						>
							{t("reservations.filterPending")}
						</button>
						<button
							onClick={() => { setActiveTab("confirmed"); setCurrentPage(1); }}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "confirmed" ? "bg-green-500/10 text-green-400 border border-green-500/25 font-extrabold" : "text-zinc-400 hover:text-zinc-200"
								}`}
						>
							{t("reservations.filterAccepted")}
						</button>
					</div>

					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
						<label className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-white/5 bg-[#0d0f17]/50 hover:bg-[#0d0f17]/80 cursor-pointer transition-all duration-200 select-none text-zinc-300">
							<input
								type="checkbox"
								checked={showPast}
								onChange={(e) => setShowPast(e.target.checked)}
								className="w-4 h-4 rounded border-white/10 bg-[#07080a] text-amber-500 focus:ring-0 focus:ring-offset-0 accent-amber-500 cursor-pointer"
							/>
							<span className="text-xs font-extrabold whitespace-nowrap">
								{t("reservations.showPast")}
							</span>
						</label>
						<SearchInput value={searchQuery} onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }} placeholder={t("reservations.searchRes")} />
					</div>
				</div>

				{/* Reservations Table */}
				<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
					<table className="min-w-212.5 w-full border-collapse text-sm">
						<thead>
							<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
								<th className="pb-3 px-4">{t("reservations.columnId")}</th>
								<th className="pb-3 px-4">{t("reservations.columnClient")}</th>
								<th className="pb-3 px-4">{t("reservations.columnPhone")}</th>
								<th className="pb-3 px-4">{t("reservations.columnDateTime")}</th>
								<th className="pb-3 px-4">{t("reservations.columnRoom")}</th>
								<th className="pb-3 px-4 text-center">{t("reservations.columnStatus")}</th>
								<th className="pb-3 px-4 text-center">{t("common.actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{isReservationsLoading ? (
								<tr>
									<td colSpan={7} className="py-10 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
											<span className="text-xs text-zinc-500 font-bold">{t("common.loading")}</span>
										</div>
									</td>
								</tr>
							) : reservations.length > 0 ? (
								reservations.map((res: ReservationModel) => (
									<tr key={res.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
										<td className={`py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											R-{res.number}
										</td>
										<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.client_name}
										</td>
										<td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.phone}
										</td>
										<td className={`py-4 px-4 text-zinc-400 text-xs font-semibold whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{formatDate(res.date_time)}
										</td>
										<td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{res.room?.name ?? t("common.unknown")}
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<Badge
												variant={res.accepted ? "success" : "amber"}
												pulse={!res.accepted}
											>
												{res.accepted ? t("reservations.statusAccepted") : t("reservations.statusPending")}
											</Badge>
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex items-center justify-center gap-2">
												{!res.accepted && (
													<button
														onClick={() => handleAccept(res.id)}
														className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200"
														title={t("reservations.btnConfirmRes")}
													>
														<CheckIcon className="w-4 h-4" />
													</button>
												)}
												<button
													onClick={() => handleDelete(res.id)}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
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
									<td colSpan={7} className="py-10 text-center text-zinc-500 font-medium text-xs">
										{t("common.noData")}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={total}
					itemsPerPage={perPage}
					onPageChange={setCurrentPage}
				/>
			</div>

			<AdminModal
				isOpen={isResOpen}
				onClose={() => setIsResOpen(false)}
				title={t("reservations.modalAddTitle")}
			>
				<form onSubmit={handleSubmit(handleAddReservation)} className="space-y-4">
					{/* Client Name */}
					<div className="space-y-1.5">
						<label htmlFor="resClient" className="text-xs font-bold text-zinc-400 block">{t("reservations.formClientName")}</label>
						<input
							id="resClient"
							type="text"
							{...register("client_name")}
							placeholder={t("reservations.formClientPlaceholder")}
							className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
							autoFocus
						/>
						{errors.client_name?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.client_name.message)}</p>
						)}
					</div>

					{/* Client Phone */}
					<div className="space-y-1.5">
						<label htmlFor="resPhone" className="text-xs font-bold text-zinc-400 block">{t("reservations.formPhone")}</label>
						<input
							id="resPhone"
							type="tel"
							{...register("phone")}
							placeholder="05xxxxxxxx"
							className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
						/>
						{errors.phone?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.phone.message)}</p>
						)}
					</div>

					{/* Date and Time */}
					<div className="space-y-1.5">
						<label htmlFor="resDate" className="text-xs font-bold text-zinc-400 block">{t("reservations.formDateTime")}</label>
						<input
							id="resDate"
							type="datetime-local"
							{...register("date_time")}
							className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
						/>
						{errors.date_time?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.date_time.message)}</p>
						)}
					</div>

					{/* Room / Table selector */}
					<div className="space-y-1.5">
						<label htmlFor="resRoom" className="text-xs font-bold text-zinc-400 block">{t("reservations.formAssignedRoom")}</label>
						<select
							id="resRoom"
							{...register("room_id")}
							className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
						>
							{rooms.filter((r) => !r.is_disable).map((r) => (
								<option key={r.id} value={r.id}>{r.name}</option>
							))}
						</select>
						{errors.room_id?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.room_id.message)}</p>
						)}
					</div>

					<div className="pt-2 flex justify-end gap-2">
						<PrimaryButton
							type="button"
							onClick={() => setIsResOpen(false)}
							variant="secondary"
							size="md"
						>
							{t("common.cancel")}
						</PrimaryButton>
						<PrimaryButton
							type="submit"
							size="md"
						>
							{t("common.save")}
						</PrimaryButton>
					</div>
				</form>
			</AdminModal>
		</div>
	);
}
