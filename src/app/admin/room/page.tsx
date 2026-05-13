"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import QRCode from "qrcode";
import Image from "next/image";

interface Room {
	id: string;
	name: string;
	is_disable: boolean;
	qr_code: string;
}

const DEFAULT_ROOMS: Room[] = [
	{
		id: "rm1",
		name: "طاولة VIP 1 (المنطقة الزجاجية)",
		is_disable: false,
		qr_code: "vip1",
	},
	{
		id: "rm2",
		name: "طاولة عائلية 4 (الدور الثاني)",
		is_disable: false,
		qr_code: "table4",
	},
	{
		id: "rm3",
		name: "طاولة ثنائية 2 (شرفة المقهى)",
		is_disable: false,
		qr_code: "table2",
	},
	{
		id: "rm4",
		name: "طاولة بار 5 (ركن الباريستا)",
		is_disable: false,
		qr_code: "bar5",
	},
	{
		id: "rm5",
		name: "قاعة الاجتماعات الفاخرة",
		is_disable: true,
		qr_code: "meeting5",
	},
];

/**
 * Admin Dining Rooms, Tables, and QR Code Generator Page.
 * Conforms fully to modern Material Design 3 and premium dark mode aesthetics.
 * Allows managing physical rooms/tables and printing their dynamic QR codes.
 */
export default function AdminRoomsPage() {
	const { t, isRtl } = useLanguage();
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
	const [searchQuery, setSearchQuery] = useState("");

	// Modals toggles
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	// Form input states
	const [newRoomName, setNewRoomName] = useState("");
	const [newRoomQrToken, setNewRoomQrToken] = useState("");

	// Print preview states
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [previewQrUrl, setPreviewQrUrl] = useState("");
	const [isGeneratingQr, setIsGeneratingQr] = useState(false);

	// Save and dispatch updates helper
	const updateRoomsState = (updatedRooms: Room[]) => {
		setRooms(updatedRooms);
		localStorage.setItem("cafe_rooms", JSON.stringify(updatedRooms));
		window.dispatchEvent(new CustomEvent("rooms-updated"));
	};

	// Open room add modal with dynamic preset QR suggestions
	const handleOpenAddModal = () => {
		setNewRoomName("");
		// Pre-populate QR code token with a unique string
		setNewRoomQrToken(`room-${Math.floor(100 + Math.random() * 900)}`);
		setIsAddOpen(true);
	};

	// Submit handler to create dining room/table
	const handleAddRoomSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newRoomName.trim() || !newRoomQrToken.trim()) return;

		// Validation: check if QR code is unique
		const lowerToken = newRoomQrToken.trim().toLowerCase();
		const isTokenDuplicate = rooms.some(
			(r) => r.qr_code.toLowerCase() === lowerToken,
		);
		if (isTokenDuplicate) {
			alert(t("reservations.errDuplicateQr"));
			return;
		}

		const newRoom: Room = {
			id: `rm-${Date.now()}`,
			name: newRoomName.trim(),
			is_disable: false,
			qr_code: lowerToken,
		};

		const updated = [...rooms, newRoom];
		updateRoomsState(updated);
		setIsAddOpen(false);
	};

	// Toggle room operational availability
	const handleToggleDisable = (id: string) => {
		const updated = rooms.map((r) =>
			r.id === id ? { ...r, is_disable: !r.is_disable } : r,
		);
		updateRoomsState(updated);
	};

	// Delete dining room/table
	const handleDeleteRoom = (id: string) => {
		const roomToDelete = rooms.find((r) => r.id === id);
		if (!roomToDelete) return;

		const confirmMsg = `${t("reservations.confirmDeleteTable")}${roomToDelete.name}${t("reservations.confirmDeleteTableSuffix")}`;

		if (confirm(confirmMsg)) {
			const updated = rooms.filter((r) => r.id !== id);
			updateRoomsState(updated);
		}
	};

	// Open high-resolution printable QR label card
	const handleShowQrLabel = async (room: Room) => {
		setSelectedRoom(room);
		setPreviewQrUrl("");
		setIsGeneratingQr(true);
		setIsPreviewOpen(true);

		try {
			// Generate clean, high-resolution QR data URL
			const dataUrl = await QRCode.toDataURL(room.qr_code, {
				width: 380,
				margin: 2,
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
			});
			setPreviewQrUrl(dataUrl);
		} catch (err) {
			console.error("Failed to generate QR code data URL", err);
		} finally {
			setIsGeneratingQr(false);
		}
	};

	// Trigger browser native print job on sticker
	const handlePrintLabel = () => {
		window.print();
	};

	// Filters rooms list
	const filteredRooms = rooms.filter(
		(r) =>
			r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			r.qr_code.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			{/* Inject print-only styles for standard paper layout */}
			<style jsx global>{`
				@media print {
					/* Hide full layout wrappers */
					body * {
						visibility: hidden;
					}
					/* Only render the printable sticker panel */
					#printable-sticker,
					#printable-sticker * {
						visibility: visible;
					}
					#printable-sticker {
						position: fixed;
						left: 50%;
						top: 40%;
						transform: translate(-50%, -50%) scale(1.1);
						width: 320px !important;
						height: auto !important;
						display: flex !important;
						flex-direction: column !important;
						align-items: center !important;
						justify-content: center !important;
						background-color: #ffffff !important;
						color: #000000 !important;
						border: 2px dashed #000000 !important;
						border-radius: 16px !important;
						padding: 24px !important;
						box-shadow: none !important;
					}
					.no-print {
						display: none !important;
					}
				}
			`}</style>

			{/* Page Header */}
			<AdminHeader
				title={t("reservations.roomsPageTitle")}
				subtitle={t("reservations.roomsPageSub")}
			>
				<button
					onClick={handleOpenAddModal}
					className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
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
					<span>
						{t("reservations.btnAddRoomTable")}
					</span>
				</button>
			</AdminHeader>

			{/* Room Statistics Dashboard Panels */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-amber-500/20 transition-colors">
					<div className="absolute right-0 top-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
					<span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
						{t("reservations.statTotalTables")}
					</span>
					<span className="text-4xl font-black text-white">
						{rooms.length}
					</span>
				</div>
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-green-500/20 transition-colors">
					<div className="absolute right-0 top-0 h-16 w-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors" />
					<span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
						{t("reservations.statActiveTables")}
					</span>
					<span className="text-4xl font-black text-green-400">
						{rooms.filter((r) => !r.is_disable).length}
					</span>
				</div>
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-red-500/20 transition-colors">
					<div className="absolute right-0 top-0 h-16 w-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors" />
					<span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
						{t("reservations.statOutOfService")}
					</span>
					<span className="text-4xl font-black text-red-400">
						{rooms.filter((r) => r.is_disable).length}
					</span>
				</div>
			</div>

			{/* Main Grid View of Room cards with Live QR Code trigger */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				{/* Inner search layout */}
				<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={t("reservations.roomsSearch")}
					/>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-212.5 w-full border-collapse text-sm">
						<thead>
							<tr
								className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}
							>
								<th className="pb-3 px-4">
									{t("reservations.colRoomIdentifier")}
								</th>
								<th className="pb-3 px-4">
									{t("reservations.colRoomTableName")}
								</th>
								<th className="pb-3 px-4">
									{t("reservations.colQrToken")}
								</th>
								<th className="pb-3 px-4 text-center">
									{t("reservations.colOperatingStatus")}
								</th>
								<th className="pb-3 px-4 text-center">
									{t("reservations.colQrActions")}
								</th>
								<th className="pb-3 px-4 text-center">
									{t("reservations.colOperations")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredRooms.length > 0 ? (
								filteredRooms.map((room) => (
									<tr
										key={room.id}
										className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
									>
										{/* Room ID */}
										<td
											className={`py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
										>
											{room.id}
										</td>

										{/* Name */}
										<td
											className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
										>
											{room.name}
										</td>

										{/* QR Token */}
										<td
											className={`py-4 px-4 font-black text-xs text-amber-400 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
										>
											<span className="px-2 py-1 rounded bg-[#07080a]/80 border border-white/5 font-mono uppercase tracking-wide">
												{room.qr_code}
											</span>
										</td>

										{/* Status */}
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
													!room.is_disable
														? "bg-green-500/10 text-green-400 border-green-500/20"
														: "bg-red-500/10 text-red-400 border-red-500/20"
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${!room.is_disable ? "bg-green-400" : "bg-red-400"}`}
												/>
												{!room.is_disable
													? t("reservations.statusActiveAvailable")
													: t("reservations.statusOutOfService")}
											</span>
										</td>

										{/* QR Label Show Action */}
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<button
												onClick={() =>
													handleShowQrLabel(room)
												}
												className="px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-300 hover:bg-amber-500 hover:text-[#07080a] font-black text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
											>
												<svg
													className="w-3.5 h-3.5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2.5"
														d="M12 4v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
													/>
												</svg>
												<span>
													{t("reservations.btnPrintQr")}
												</span>
											</button>
										</td>

										{/* Toggle & Delete buttons */}
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex items-center justify-center gap-2">
												{/* Toggle Service */}
												<button
													onClick={() =>
														handleToggleDisable(
															room.id,
														)
													}
													className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
														!room.is_disable
															? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
															: "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-[#07080a]"
													}`}
													title={
														!room.is_disable
															? t("reservations.actionDeactivate")
															: t("reservations.actionActivate")
													}
												>
													{!room.is_disable ? (
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
																d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
															/>
														</svg>
													) : (
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
																d="M9 12l2 2 4-4"
															/>
														</svg>
													)}
												</button>

												{/* Delete Room */}
												<button
													onClick={() =>
														handleDeleteRoom(
															room.id,
														)
													}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
													title={t("reservations.actionDeletePerm")}
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
										colSpan={6}
										className="py-12 text-center text-zinc-500 font-medium text-xs"
									>
										{t("reservations.noTablesRegistered")}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal: ADD NEW ROOM/TABLE */}
			{isAddOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
					dir={isRtl ? "rtl" : "ltr"}
				>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsAddOpen(false)}
							className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors cursor-pointer`}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						<h2 className="text-lg font-black text-white mb-4">
							{t("reservations.modalAddPhysTitle")}
						</h2>

						<form
							onSubmit={handleAddRoomSubmit}
							className="space-y-4"
						>
							{/* Room Name */}
							<div className="space-y-1.5">
								<label
									htmlFor="rName"
									className="text-xs font-bold text-zinc-400 block"
								>
									{t("reservations.formRoomName")}
								</label>
								<input
									id="rName"
									type="text"
									value={newRoomName}
									onChange={(e) =>
										setNewRoomName(e.target.value)
									}
									placeholder={t("reservations.formRoomPlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
									autoFocus
								/>
							</div>

							{/* Room QR Token */}
							<div className="space-y-1.5">
								<label
									htmlFor="rToken"
									className="text-xs font-bold text-zinc-400 block"
								>
									{t("reservations.formQrToken")}
								</label>
								<input
									id="rToken"
									type="text"
									value={newRoomQrToken}
									onChange={(e) =>
										setNewRoomQrToken(e.target.value)
									}
									placeholder="e.g. table7"
									className="w-full bg-[#07080a] border border-white/10 text-amber-300 font-mono rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
								/>
								<p className="text-[10px] text-zinc-500 leading-normal font-medium mt-1">
									{t("reservations.formQrTokenDesc")}
								</p>
							</div>

							{/* Buttons */}
							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsAddOpen(false)}
									className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
								>
									{t("common.cancel")}
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all cursor-pointer shadow-md"
								>
									{t("reservations.btnSaveTable")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal: PRINTABLE QR CODE PREVIEW CARD */}
			{isPreviewOpen && selectedRoom && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
					dir={isRtl ? "rtl" : "ltr"}
				>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative space-y-6 no-print">
						{/* Dismiss */}
						<button
							onClick={() => setIsPreviewOpen(false)}
							className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						<div className="text-center space-y-1">
							<h2 className="text-lg font-black text-white">
								{t("reservations.stickerTitle")}
							</h2>
							<p className="text-xs text-zinc-400">
								{t("reservations.stickerSub")}
							</p>
						</div>

						{/* STICKER CONTAINER CARD: THIS CARD WILL BE VISIBLE AND PRINTED VIA @MEDIA PRINT */}
						<div
							id="printable-sticker"
							className="mx-auto w-72 rounded-3xl border border-amber-500/30 bg-[#07080a] p-6 text-center space-y-5 shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
						>
							{/* Logo Header of the Café */}
							<div className="flex items-center justify-center gap-2">
								<div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-sm">
									☕
								</div>
								<div className="text-left font-black tracking-wide leading-none text-white print:text-black">
									<p className="text-[10px] print:text-black">
										{t("reservations.stickerCafe")}
									</p>
									<p className="text-[7px] text-amber-400/90 tracking-widest uppercase mt-0.5">
										SERVICES
									</p>
								</div>
							</div>

							{/* Room / Table Label */}
							<div className="space-y-1.5">
								<h3 className="text-base font-black text-white print:text-black leading-tight">
									{selectedRoom.name}
								</h3>
								<span className="inline-flex items-center px-2 py-0.5 rounded bg-[#131522] print:bg-zinc-100 border border-white/5 print:border-black/10 text-[8px] font-mono text-zinc-400 print:text-zinc-600 uppercase">
									{t("reservations.stickerId")}{" "}
									{selectedRoom.qr_code}
								</span>
							</div>

							{/* Dynamic QR image */}
							<div className="relative h-44 w-44 bg-white rounded-2xl p-3 shadow-inner flex items-center justify-center border border-white/10 print:border-black/25">
								{isGeneratingQr ? (
									<div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full" />
								) : (
									previewQrUrl && (
										<Image
											src={previewQrUrl}
											alt={`${selectedRoom.name} QR Code`}
											width={176}
											height={176}
											className="h-full w-full object-contain"
											unoptimized
										/>
									)
								)}
							</div>

							{/* Call to action */}
							<div className="space-y-1">
								<p className="text-[10px] font-black text-amber-400 print:text-black uppercase tracking-wide">
									{t("reservations.stickerScan")}
								</p>
								<p className="text-[8px] text-zinc-500 print:text-zinc-600 leading-normal max-w-50 mx-auto">
									{t("reservations.stickerScanDesc")}
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="pt-2 flex justify-end gap-2 text-sm">
							<button
								onClick={() => setIsPreviewOpen(false)}
								className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
							>
								{t("reservations.btnDismissPreview")}
							</button>
							<button
								onClick={handlePrintLabel}
								className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
								disabled={isGeneratingQr || !previewQrUrl}
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
										d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
									/>
								</svg>
								<span>
									{t("reservations.btnPrintLabel")}
								</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
