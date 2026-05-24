"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomInput } from "@/lib/validations/room";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import {
 PlusIcon,
 SunIcon,
 UndoCircleIcon,
 CheckIcon,
 TrashIcon,
 PrintIcon,
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useRoom } from "@/context/room_context";
import { useSettings } from "@/context/settings_context";
import RoomModel from "@/models/data_models/room_model";
import QRCode from "qrcode";
import Image from "next/image";
import Table, { TableColumn } from "@/components/table";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/pagination";
import { ActionIconButton } from "@/components/button/action_icon_button";

/**
 * Admin Dining Rooms, Tables, and QR Code Generator Page.
 * Connected to DB via RoomContext. QR generation remains client-side.
 */
export default function AdminRoomsPage() {
 const { t, isRtl } = useLanguage();
 const { settings } = useSettings();
 const {
 rooms,
 total,
 totalPages,
 isRoomsLoading,
 fetchAllRooms,
 addRoom,
 updateRoom,
 deleteRoom,
 } = useRoom();

 const columns: TableColumn[] = [
 { key: "name", label: t("reservations.colRoomTableName") },
 { key: "qr_code", label: t("reservations.colQrToken") },
 {
 key: "status",
 label: t("reservations.colOperatingStatus"),
 align: "center",
 },
 {
 key: "qr_actions",
 label: t("reservations.colQrActions"),
 align: "center",
 },
 {
 key: "actions",
 label: t("reservations.colOperations"),
 align: "center",
 },
 ];

 const [searchQuery, setSearchQuery] = useState("");

 // Modals toggles
 const [isAddOpen, setIsAddOpen] = useState(false);
 const [isPreviewOpen, setIsPreviewOpen] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);

 // React Hook Form
 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 } = useForm<RoomInput>({
 resolver: zodResolver(roomSchema),
 defaultValues: {
 name: "",
 qr_code: "",
 },
 });

 // Print preview states
 const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);
 const [previewQrUrl, setPreviewQrUrl] = useState("");
 const [isGeneratingQr, setIsGeneratingQr] = useState(false);

 const perPage = settings.per_page || 10;

 // Server-fetch rooms when page or search changes
 useEffect(() => {
 const params: Record<string, string> = {
 page: String(currentPage),
 per_page: String(perPage),
 };
 if (searchQuery) params.search = searchQuery;
 fetchAllRooms(params);
 }, [currentPage, searchQuery, perPage, fetchAllRooms]);

 // Open room add modal with dynamic preset QR suggestion
 const handleOpenAddModal = () => {
 reset({
 name: "",
 qr_code: `room-${Math.floor(100 + Math.random() * 900)}`,
 });
 setIsAddOpen(true);
 };

 // Submit handler to create dining room/table
 const handleAddRoomSubmit = async (data: RoomInput) => {
 const lowerToken = data.qr_code.trim().toLowerCase();

 // Validate QR code uniqueness client-side
 const isTokenDuplicate = rooms.some(
 (r) => r.qr_code.toLowerCase() === lowerToken,
 );
 if (isTokenDuplicate) {
 alert(t("reservations.errDuplicateQr"));
 return;
 }

 const success = await addRoom({
 name: data.name.trim(),
 qr_code: lowerToken,
 is_disable: false,
 });

 if (success) {
 setIsAddOpen(false);
 } else {
 alert(t("common.errorOccurred"));
 }
 };

 // Toggle room operational availability
 const handleToggleDisable = async (room: RoomModel) => {
 await updateRoom(room.id, { is_disable: !room.is_disable });
 };

 // Delete dining room/table
 const handleDeleteRoom = async (room: RoomModel) => {
 const confirmMsg = `${t("reservations.confirmDeleteTable")}${room.name}${t("reservations.confirmDeleteTableSuffix")}`;
 if (confirm(confirmMsg)) {
 await deleteRoom(room.id);
 }
 };

 // Open high-resolution printable QR label card
 const handleShowQrLabel = async (room: RoomModel) => {
 setSelectedRoom(room);
 setPreviewQrUrl("");
 setIsGeneratingQr(true);
 setIsPreviewOpen(true);

 try {
 const dataUrl = await QRCode.toDataURL(room.qr_code, {
 width: 380,
 margin: 2,
 color: { dark: "#000000", light: "#FFFFFF" },
 });
 setPreviewQrUrl(dataUrl);
 } catch (err) {
 console.error("Failed to generate QR code", err);
 } finally {
 setIsGeneratingQr(false);
 }
 };

 const handlePrintLabel = () => {
 window.print();
 };

 return (
 <div className="space-y-6">
 {/* Inject print-only styles */}
 <style jsx global>{`
 @media print {
 body * {
 visibility: hidden;
 }
 #printable-sticker,
 #printable-sticker * {
 visibility: visible;
 }
 #printable-sticker {
 position: fixed;
 left: 50%;
 top: 40%;
 : translate(-50%, -50%) scale(1.1);
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
 <PrimaryButton onClick={handleOpenAddModal} size="md">
 <PlusIcon className="w-4 h-4" />
 <span>{t("reservations.btnAddRoomTable")}</span>
 </PrimaryButton>
 </AdminHeader>

 {/* Room Statistics */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="rounded-card border border-white/10 bg-surface p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-primary/20 transition-colors">
 <div className="absolute right-0 top-0 h-16 w-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
 <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
 {t("reservations.statTotalTables")}
 </span>
 <span className="text-4xl font-black text-white">
 {rooms.length}
 </span>
 </div>
 <div className="rounded-card border border-white/10 bg-surface p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-green-500/20 transition-colors">
 <div className="absolute right-0 top-0 h-16 w-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors" />
 <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
 {t("reservations.statActiveTables")}
 </span>
 <span className="text-4xl font-black text-green-400">
 {rooms.filter((r) => !r.is_disable).length}
 </span>
 </div>
 <div className="rounded-card border border-white/10 bg-surface p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-red-500/20 transition-colors">
 <div className="absolute right-0 top-0 h-16 w-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors" />
 <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
 {t("reservations.statOutOfService")}
 </span>
 <span className="text-4xl font-black text-red-400">
 {rooms.filter((r) => r.is_disable).length}
 </span>
 </div>
 </div>

 {/* Main Table */}
 <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
 <SearchInput
 value={searchQuery}
 onChange={(v) => {
 setSearchQuery(v);
 setCurrentPage(1);
 }}
 placeholder={t("reservations.roomsSearch")}
 />
 </div>

 <Table
 columns={columns}
 isLoading={isRoomsLoading}
 dataLength={total}
 noDataText={t("reservations.noTablesRegistered")}
 >
 {rooms.map((room, index) => (
 <tr
 key={index}
 className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
 >
 <td
 className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
 >
 {room.name}
 </td>
 <td
 className={`py-4 px-4 font-black text-xs text-primary-hover whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
 >
 <span className="px-2 py-1 rounded bg-background/80 border border-white/5 font-mono uppercase tracking-wide">
 {room.qr_code}
 </span>
 </td>
 <td className="py-4 px-4 text-center whitespace-nowrap">
 <Badge
 variant={
 !room.is_disable ? "success" : "error"
 }
 pulse
 >
 {!room.is_disable
 ? t(
 "reservations.statusActiveAvailable",
 )
 : t("reservations.statusOutOfService")}
 </Badge>
 </td>
 <td className="py-4 px-4 text-center whitespace-nowrap">
 <button
 onClick={() => handleShowQrLabel(room)}
 className="px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary-light hover:bg-primary hover:text-background font-black text-[10px] uppercase transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
 >
 <SunIcon className="w-3.5 h-3.5" />
 <span>{t("reservations.btnPrintQr")}</span>
 </button>
 </td>
 <td className="py-4 px-4 text-center whitespace-nowrap">
 <div className="flex items-center justify-center gap-2">
 <ActionIconButton
 variant={
 !room.is_disable
 ? "disable"
 : "enable"
 }
 icon={
 !room.is_disable ? (
 <UndoCircleIcon className="w-4 h-4" />
 ) : (
 <CheckIcon className="w-4 h-4" />
 )
 }
 onClick={() =>
 handleToggleDisable(room)
 }
 title={
 !room.is_disable
 ? t(
 "reservations.actionDeactivate",
 )
 : t(
 "reservations.actionActivate",
 )
 }
 />

 <ActionIconButton
 variant="delete"
 icon={<TrashIcon className="w-4 h-4" />}
 onClick={() => handleDeleteRoom(room)}
 title={t(
 "reservations.actionDeletePerm",
 )}
 />
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
 isOpen={isAddOpen}
 onClose={() => setIsAddOpen(false)}
 title={t("reservations.modalAddPhysTitle")}
 >
 <form
 onSubmit={handleSubmit(handleAddRoomSubmit)}
 className="space-y-4"
 >
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
 {...register("name")}
 placeholder={t("reservations.formRoomPlaceholder")}
 className="w-full bg-background border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
 autoFocus
 />
 {errors.name && (
 <p className="text-[10px] text-red-400 font-medium mt-1">
 {t(String(errors.name.message))}
 </p>
 )}
 </div>

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
 {...register("qr_code")}
 placeholder="e.g. table7"
 className="w-full bg-background border border-white/10 text-primary-light font-mono rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-primary transition-all duration-200"
 />
 {errors.qr_code && (
 <p className="text-[10px] text-red-400 font-medium mt-1">
 {t(String(errors.qr_code.message))}
 </p>
 )}
 <p className="text-[10px] text-zinc-500 leading-normal font-medium mt-1">
 {t("reservations.formQrTokenDesc")}
 </p>
 </div>

 <div className="pt-2 flex justify-end gap-2">
 <PrimaryButton
 type="button"
 onClick={() => setIsAddOpen(false)}
 variant="secondary"
 size="md"
 >
 {t("common.cancel")}
 </PrimaryButton>
 <PrimaryButton type="submit" size="md">
 {t("reservations.btnSaveTable")}
 </PrimaryButton>
 </div>
 </form>
 </AdminModal>

 {isPreviewOpen && selectedRoom && (
 <AdminModal
 isOpen={isPreviewOpen}
 onClose={() => setIsPreviewOpen(false)}
 title={t("reservations.stickerTitle")}
 >
 <div className="space-y-6">
 <p className="text-xs text-zinc-400 -mt-2 text-center">
 {t("reservations.stickerSub")}
 </p>

 <div
 id="printable-sticker"
 className="mx-auto w-72 rounded-3xl border border-primary/30 bg-background p-6 text-center space-y-5 shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
 >
 <div className="flex items-center justify-center gap-2">
 <div className="h-7 w-7 rounded-lg bg-primary/20 border border-primary/40 text-primary-hover flex items-center justify-center font-black text-sm">
 ☕
 </div>
 <div className="text-left font-black tracking-wide leading-none text-white print:text-black">
 <p className="text-[10px] print:text-black">
 {t("reservations.stickerCafe")}
 </p>
 <p className="text-[7px] text-primary-hover/90 tracking-widest uppercase mt-0.5">
 SERVICES
 </p>
 </div>
 </div>

 <div className="space-y-1.5">
 <h3 className="text-base font-black text-white print:text-black leading-tight">
 {selectedRoom.name}
 </h3>
 </div>

 <div className="relative h-44 w-44 bg-white rounded-2xl p-3 shadow-inner flex items-center justify-center border border-white/10 print:border-black/25">
 {isGeneratingQr ? (
 <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
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

 <div className="space-y-1">
 <p className="text-[10px] font-black text-primary-hover print:text-black uppercase tracking-wide">
 {t("reservations.stickerScan")}
 </p>
 <p className="text-[8px] text-zinc-500 print:text-zinc-600 leading-normal max-w-50 mx-auto">
 {t("reservations.stickerScanDesc")}
 </p>
 </div>
 </div>

 <div className="pt-2 flex justify-end gap-2 text-sm">
 <PrimaryButton
 type="button"
 onClick={() => setIsPreviewOpen(false)}
 variant="secondary"
 size="md"
 >
 {t("reservations.btnDismissPreview")}
 </PrimaryButton>
 <PrimaryButton
 onClick={handlePrintLabel}
 disabled={isGeneratingQr || !previewQrUrl}
 size="md"
 >
 <PrintIcon className="w-4 h-4" />
 <span>{t("reservations.btnPrintLabel")}</span>
 </PrimaryButton>
 </div>
 </div>
 </AdminModal>
 )}
 </div>
 );
}
