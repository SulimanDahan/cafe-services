"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";

interface Reservation {
	id: string;
	number: string;
	client_name: string;
	phone: string;
	datetime: string;
	room_id: string; // foreign relation
	room_name: string;
	accepted: boolean;
}

interface Room {
	id: string;
	name: string;
	is_disable: boolean;
	qr_code?: string;
}

const DEFAULT_RESERVATIONS: Reservation[] = [
	{
		id: "res1",
		number: "R-9043",
		client_name: "سليمان دهان",
		phone: "0554321098",
		datetime: "12 مايو 2026 21:00",
		room_id: "rm1",
		room_name: "طاولة VIP 1 (المنطقة الزجاجية)",
		accepted: true,
	},
	{
		id: "res2",
		number: "R-5412",
		client_name: "أحمد العتيبي",
		phone: "0561234567",
		datetime: "13 مايو 2026 19:30",
		room_id: "rm2",
		room_name: "طاولة عائلية 4 (الدور الثاني)",
		accepted: false,
	},
	{
		id: "res3",
		number: "R-3329",
		client_name: "سارة الأحمد",
		phone: "0549876543",
		datetime: "14 مايو 2026 18:00",
		room_id: "rm3",
		room_name: "طاولة ثنائية 2 (شرفة المقهى)",
		accepted: true,
	},
	{
		id: "res4",
		number: "R-1120",
		client_name: "خالد الحربي",
		phone: "0501122334",
		datetime: "15 مايو 2026 20:30",
		room_id: "rm1",
		room_name: "طاولة VIP 1 (المنطقة الزجاجية)",
		accepted: false,
	},
];

const DEFAULT_ROOMS: Room[] = [
	{ id: "rm1", name: "طاولة VIP 1 (المنطقة الزجاجية)", is_disable: false, qr_code: "vip1" },
	{ id: "rm2", name: "طاولة عائلية 4 (الدور الثاني)", is_disable: false, qr_code: "table4" },
	{ id: "rm3", name: "طاولة ثنائية 2 (شرفة المقهى)", is_disable: false, qr_code: "table2" },
	{ id: "rm4", name: "طاولة بار 5 (ركن الباريستا)", is_disable: false, qr_code: "bar5" },
	{ id: "rm5", name: "قاعة الاجتماعات الفاخرة", is_disable: true, qr_code: "meeting5" },
];

/**
 * Admin Reservations and Dining Rooms Control Panel.
 * Implements the Reservation and Room models.
 * Features tabs to toggle sections, accept/reject bookings, configure tables, and query.
 */
export default function ReservationsAdmin() {
	const { t, isRtl } = useLanguage();

	// Pre-seeded reservations database matching schema
	const [reservations, setReservations] = useState<Reservation[]>(() => {
		if (typeof window === "undefined") return DEFAULT_RESERVATIONS;
		const storedRes = localStorage.getItem("cafe_reservations");
		if (storedRes) {
			try {
				return JSON.parse(storedRes);
			} catch {
				return DEFAULT_RESERVATIONS;
			}
		} else {
			localStorage.setItem("cafe_reservations", JSON.stringify(DEFAULT_RESERVATIONS));
			return DEFAULT_RESERVATIONS;
		}
	});

	// Pre-seeded dining tables and rooms database
	const [rooms, setRooms] = useState<Room[]>(() => {
		if (typeof window === "undefined") return DEFAULT_ROOMS;
		const storedRooms = localStorage.getItem("cafe_rooms");
		if (storedRooms) {
			try {
				return JSON.parse(storedRooms);
			} catch {
				return DEFAULT_ROOMS;
			}
		} else {
			localStorage.setItem("cafe_rooms", JSON.stringify(DEFAULT_ROOMS));
			return DEFAULT_ROOMS;
		}
	});

	// Sync local storage on updates from other tabs/modals
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Set up event listeners for updates from other pages
		const syncOnUpdate = () => {
			const res = localStorage.getItem("cafe_reservations");
			if (res) {
				try {
					setReservations(JSON.parse(res));
				} catch {}
			}
			const rms = localStorage.getItem("cafe_rooms");
			if (rms) {
				try {
					setRooms(JSON.parse(rms));
				} catch {}
			}
		};

		window.addEventListener("rooms-updated", syncOnUpdate);
		window.addEventListener("reservations-updated", syncOnUpdate);
		return () => {
			window.removeEventListener("rooms-updated", syncOnUpdate);
			window.removeEventListener("reservations-updated", syncOnUpdate);
		};
	}, []);

	const [activeSection, setActiveSection] = useState<"reservations" | "rooms">("reservations");
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all"); // all, pending, confirmed

	// Form Modals Toggles
	const [isResOpen, setIsResOpen] = useState(false);
	const [isRoomOpen, setIsRoomOpen] = useState(false);

	// New Reservation Form Input States
	const [resClientName, setResClientName] = useState("");
	const [resPhone, setResPhone] = useState("");
	const [resDateTime, setResDateTime] = useState("");
	const [resRoomId, setResRoomId] = useState("");

	// New Room Form Input State
	const [roomName, setRoomName] = useState("");

	const handleAddReservation = (e: React.FormEvent) => {
		e.preventDefault();
		if (!resClientName.trim() || !resPhone.trim() || !resDateTime || !resRoomId) return;

		const selectedRoom = rooms.find((r) => r.id === resRoomId);
		if (!selectedRoom) return;

		const newRes: Reservation = {
			id: `res-${Date.now()}`,
			number: `R-${Math.floor(1000 + Math.random() * 9000)}`,
			client_name: resClientName,
			phone: resPhone,
			datetime: new Date(resDateTime).toLocaleString(isRtl ? "ar-SA" : "en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
			room_id: resRoomId,
			room_name: selectedRoom.name,
			accepted: false, // Starts as pending confirmation
		};

		const updated = [newRes, ...reservations];
		setReservations(updated);
		localStorage.setItem("cafe_reservations", JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent("reservations-updated"));
		setIsResOpen(false);
	};

	const handleAcceptReservation = (id: string) => {
		const updated = reservations.map((res) => (res.id === id ? { ...res, accepted: true } : res));
		setReservations(updated);
		localStorage.setItem("cafe_reservations", JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent("reservations-updated"));
	};

	const handleDeleteReservation = (id: string) => {
		const updated = reservations.filter((res) => res.id !== id);
		setReservations(updated);
		localStorage.setItem("cafe_reservations", JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent("reservations-updated"));
	};

	const handleAddRoom = (e: React.FormEvent) => {
		e.preventDefault();
		if (!roomName.trim()) return;

		const newRoom: Room = {
			id: `rm-${Date.now()}`,
			name: roomName,
			is_disable: false,
			qr_code: `room-${Math.floor(100 + Math.random() * 900)}`,
		};

		const updated = [...rooms, newRoom];
		setRooms(updated);
		localStorage.setItem("cafe_rooms", JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent("rooms-updated"));
		setRoomName("");
		setIsRoomOpen(false);
	};

	const handleToggleDisableRoom = (id: string) => {
		const updated = rooms.map((r) => (r.id === id ? { ...r, is_disable: !r.is_disable } : r));
		setRooms(updated);
		localStorage.setItem("cafe_rooms", JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent("rooms-updated"));
	};

	const handleDeleteRoom = (id: string) => {
		const updated = rooms.filter((r) => r.id !== id);
		setRooms(updated);
		localStorage.setItem("cafe_rooms", JSON.stringify(updated));
		window.dispatchEvent(new CustomEvent("rooms-updated"));
	};

	// Filters based on search query and status tabs
	const filteredReservations = reservations.filter((res) => {
		const matchesSearch =
			res.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			res.phone.includes(searchQuery) ||
			res.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			res.number.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesTab =
			activeTab === "all" ||
			(activeTab === "pending" && !res.accepted) ||
			(activeTab === "confirmed" && res.accepted);

		return matchesSearch && matchesTab;
	});

	const filteredRooms = rooms.filter((r) =>
		r.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<AdminHeader
				title={t("reservations.title")}
				subtitle={t("reservations.subtitle")}
			>
				{activeSection === "reservations" ? (
					<button
						onClick={() => {
							setResClientName("");
							setResPhone("");
							setResDateTime("");
							setResRoomId(rooms[0]?.id || "");
							setIsResOpen(true);
						}}
						className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 w-full sm:w-auto"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
						</svg>
						<span>{t("reservations.addReservation")}</span>
					</button>
				) : (
					<button
						onClick={() => setIsRoomOpen(true)}
						className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 w-full sm:w-auto"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
						</svg>
						<span>{t("reservations.btnNewRoom")}</span>
					</button>
				)}
			</AdminHeader>

			{/* Custom Segmented Tabs (Reservations vs Rooms) */}
			<div className="flex bg-[#131522] border border-white/10 rounded-full p-1 max-w-sm w-full">
				<button
					onClick={() => {
						setActiveSection("reservations");
						setSearchQuery("");
					}}
					className={`flex-1 py-2 text-center text-xs font-black rounded-full transition-all duration-200 ${
						activeSection === "reservations"
							? "bg-amber-500 text-black shadow-md font-extrabold"
							: "text-zinc-400 hover:text-white"
					}`}
				>
					{t("reservations.tabActiveReservations")}
				</button>
				<button
					onClick={() => {
						setActiveSection("rooms");
						setSearchQuery("");
					}}
					className={`flex-1 py-2 text-center text-xs font-black rounded-full transition-all duration-200 ${
						activeSection === "rooms"
							? "bg-amber-500 text-black shadow-md font-extrabold"
							: "text-zinc-400 hover:text-white"
					}`}
				>
					{t("reservations.tabTablesRooms")}
				</button>
			</div>

			{/* Section: RESERVATIONS */}
			{activeSection === "reservations" && (
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
					
					{/* Status Sub-Tabs and search bar */}
					<div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
						{/* Subtabs */}
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setActiveTab("all")}
								className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
									activeTab === "all"
										? "bg-white/10 text-white border border-white/20 font-extrabold"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								{t("reservations.filterAll")} ({reservations.length})
							</button>
							<button
								onClick={() => setActiveTab("pending")}
								className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
									activeTab === "pending"
										? "bg-amber-500/10 text-amber-300 border border-amber-500/25 font-extrabold"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								{t("reservations.filterPending")} ({reservations.filter((r) => !r.accepted).length})
							</button>
							<button
								onClick={() => setActiveTab("confirmed")}
								className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
									activeTab === "confirmed"
										? "bg-green-500/10 text-green-400 border-green-500/25 font-extrabold"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								{t("reservations.filterAccepted")} ({reservations.filter((r) => r.accepted).length})
							</button>
						</div>

						{/* Search query input */}
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={t("reservations.searchRes")}
						/>
					</div>

					{/* Reservations Table (min-w-212.5 width safety) */}
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
								{filteredReservations.length > 0 ? (
									filteredReservations.map((res) => (
										<tr key={res.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
											<td className={`py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{res.number}
											</td>
											<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{res.client_name}
											</td>
											<td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{res.phone}
											</td>
											<td className={`py-4 px-4 text-zinc-400 text-xs font-semibold whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{res.datetime}
											</td>
											<td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{res.room_name}
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
													res.accepted
														? "bg-green-500/10 text-green-400 border-green-500/20"
														: "bg-amber-500/10 text-amber-300 border-amber-500/25"
												}`}>
													<span className={`w-1.5 h-1.5 rounded-full ${res.accepted ? "bg-green-400" : "bg-amber-400 animate-pulse"}`} />
													{res.accepted ? t("reservations.statusAccepted") : t("reservations.statusPending")}
												</span>
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<div className="flex items-center justify-center gap-2">
													{!res.accepted && (
														<button
															onClick={() => handleAcceptReservation(res.id)}
															className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200"
															title={t("reservations.btnConfirmRes")}
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
															</svg>
														</button>
													)}

													<button
														onClick={() => handleDeleteReservation(res.id)}
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
										<td colSpan={7} className="py-10 text-center text-zinc-500 font-medium text-xs">
											{t("common.noData")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Section: ROOMS AND TABLES */}
			{activeSection === "rooms" && (
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
					
					{/* Header search inside rooms */}
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={t("reservations.searchRoom")}
						/>
						<span className="text-xs text-zinc-400 font-bold shrink-0">
							{t("reservations.totalRooms")} {rooms.length}
						</span>
					</div>

					{/* Rooms Table */}
					<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
						<table className="min-w-212.5 w-full border-collapse text-sm">
							<thead>
								<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
									<th className="pb-3 px-4">{t("reservations.colRoomId")}</th>
									<th className="pb-3 px-4">{t("reservations.colRoomName")}</th>
									<th className="pb-3 px-4 text-center">{t("reservations.colOperatingStatus")}</th>
									<th className="pb-3 px-4 text-center">{t("common.actions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5">
								{filteredRooms.length > 0 ? (
									filteredRooms.map((room) => (
										<tr key={room.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
											<td className={`py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{room.id}
											</td>
											<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
												{room.name}
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<span
													className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
														!room.is_disable
															? "bg-amber-500/10 text-amber-300 border-amber-500/25"
															: "bg-red-500/10 text-red-400 border-red-500/20"
													}`}
												>
													<span className={`w-1.5 h-1.5 rounded-full ${!room.is_disable ? "bg-amber-400" : "bg-red-400"}`} />
													{!room.is_disable ? t("reservations.statusAvailable") : t("reservations.statusOutOfService")}
												</span>
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<div className="flex items-center justify-center gap-2">
													{/* Toggle Room available */}
													<button
														onClick={() => handleToggleDisableRoom(room.id)}
														className={`p-1.5 rounded-lg border transition-all duration-200 ${
															!room.is_disable
																? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
																: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
														}`}
														title={!room.is_disable ? t("reservations.actionDisableTable") : t("reservations.actionEnableTable")}
													>
														{!room.is_disable ? (
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
															</svg>
														) : (
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
														)}
													</button>

													{/* Delete room */}
													<button
														onClick={() => handleDeleteRoom(room.id)}
														className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
														title={t("reservations.actionDeleteTable")}
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
										<td colSpan={4} className="py-10 text-center text-zinc-500 font-medium text-xs">
											{t("common.noData")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Modal: ADD RESERVATION */}
			{isResOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsResOpen(false)}
							className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors`}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<h2 className="text-lg font-black text-white mb-4">{t("reservations.modalAddTitle")}</h2>

						<form onSubmit={handleAddReservation} className="space-y-4">
							{/* Client Name */}
							<div className="space-y-1.5">
								<label htmlFor="resClient" className="text-xs font-bold text-zinc-400 block">
									{t("reservations.formClientName")}
								</label>
								<input
									id="resClient"
									type="text"
									value={resClientName}
									onChange={(e) => setResClientName(e.target.value)}
									placeholder={t("reservations.formClientPlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
									autoFocus
								/>
							</div>

							{/* Client Phone */}
							<div className="space-y-1.5">
								<label htmlFor="resPhone" className="text-xs font-bold text-zinc-400 block">
									{t("reservations.formPhone")}
								</label>
								<input
									id="resPhone"
									type="tel"
									value={resPhone}
									onChange={(e) => setResPhone(e.target.value)}
									placeholder="05xxxxxxxx"
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
								/>
							</div>

							{/* Date and Time */}
							<div className="space-y-1.5">
								<label htmlFor="resDate" className="text-xs font-bold text-zinc-400 block">
									{t("reservations.formDateTime")}
								</label>
								<input
									id="resDate"
									type="datetime-local"
									value={resDateTime}
									onChange={(e) => setResDateTime(e.target.value)}
									className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
								/>
							</div>

							{/* Room / Table selector */}
							<div className="space-y-1.5">
								<label htmlFor="resRoom" className="text-xs font-bold text-zinc-400 block">
									{t("reservations.formAssignedRoom")}
								</label>
								<select
									id="resRoom"
									value={resRoomId}
									onChange={(e) => setResRoomId(e.target.value)}
									className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
								>
									{rooms
										.filter((r) => !r.is_disable)
										.map((r) => (
											<option key={r.id} value={r.id}>
												{r.name}
											</option>
										))}
								</select>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsResOpen(false)}
									className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
								>
									{t("common.cancel")}
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all"
								>
									{t("common.save")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal: ADD DINING ROOM / TABLE */}
			{isRoomOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsRoomOpen(false)}
							className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors`}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<h2 className="text-lg font-black text-white mb-4">{t("reservations.modalAddRoomTitle")}</h2>

						<form onSubmit={handleAddRoom} className="space-y-4">
							<div className="space-y-1.5">
								<label htmlFor="roomNameIn" className="text-xs font-bold text-zinc-400 block">
									{t("reservations.formRoomName")}
								</label>
								<input
									id="roomNameIn"
									type="text"
									value={roomName}
									onChange={(e) => setRoomName(e.target.value)}
									placeholder={t("reservations.formRoomPlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
									autoFocus
								/>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsRoomOpen(false)}
									className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
								>
									{t("common.cancel")}
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all"
								>
									{t("common.add")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
