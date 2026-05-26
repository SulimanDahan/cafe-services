"use client";

import { useState, useEffect } from "react";
import { type RoomInput } from "@/lib/validations/room";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import {
    SunIcon,
    UndoCircleIcon,
    CheckIcon,
    TrashIcon,
    EditIcon,
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useRoom } from "@/context/room_context";
import { useSettings } from "@/context/settings_context";
import RoomModel from "@/models/data_models/room_model";
import QRCode from "qrcode";
import Table, { TableColumn } from "@/components/table";
import ErrorModal from "@/components/partials/modals/error_modal";
import RoomModal from "@/components/partials/modals/admin/RoomModal";
import PrintQrModal from "@/components/partials/modals/admin/PrintQrModal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/pagination";
import { ActionIconButton } from "@/components/button/action_icon_button";
import PlusIcon from "@/components/icons/PlusIcon";

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
    const [editingRoom, setEditingRoom] = useState<RoomModel | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

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

    // Open room add modal
    const handleOpenAddModal = () => {
        setEditingRoom(null);
        setIsAddOpen(true);
    };

    const handleOpenEditModal = (room: RoomModel) => {
        setEditingRoom(room);
        setIsAddOpen(true);
    };

    const handleSaveRoomSubmit = async (
        data: RoomInput & { id?: string },
    ): Promise<boolean> => {
        let success = false;
        if (editingRoom) {
            success = await updateRoom(editingRoom.id, {
                name: data.name,
                qr_code: data.qr_code,
            });
        } else {
            success = await addRoom({
                name: data.name,
                qr_code: data.qr_code,
            });
        }

        if (!success) {
            setErrorModalMsg(t("common.errorOccurred"));
        }
        return success;
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
                width: 800,
                margin: 1,
                color: { dark: "#000000", light: "#FFFFFF" },
            });
            setPreviewQrUrl(dataUrl);
        } catch (err) {
            console.error("Failed to generate QR code", err);
        } finally {
            setIsGeneratingQr(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Inject print-only styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: portrait;
                        background-color: #07080a !important;
                    }
                    body {
                        background-color: #07080a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        width: 100%;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-sticker,
                    #printable-sticker * {
                        visibility: visible;
                    }
                    #printable-sticker {
                        position: absolute !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 18cm !important;
                        height: auto !important;
                        min-height: 25cm !important;
                        margin: 0 !important;
                        border-radius: 1.5cm !important;
                        border: 2px solid rgba(255, 255, 255, 0.1) !important;
                        /* Force the entire page background to be black by casting a massive shadow outwards */
                        box-shadow: 0 0 0 100cm #07080a !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 1.5cm !important;
                        padding: 2cm !important;
                        background-color: #07080a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Scale elements using physical units for print */
                    #printable-sticker .header-group {
                        gap: 0.5cm !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                    }
                    #printable-sticker .logo-container {
                        width: 3.5cm !important;
                        height: 3.5cm !important;
                        margin-bottom: 0.5cm !important;
                    }
                    #printable-sticker .cafe-name {
                        font-size: 16pt !important;
                        text-align: center !important;
                    }
                    #printable-sticker .cafe-subtitle {
                        font-size: 10pt !important;
                        text-align: center !important;
                        margin-top: 0.2cm !important;
                    }
                    #printable-sticker .room-name {
                        font-size: 32pt !important;
                        text-align: center !important;
                        margin-bottom: 0.5cm !important;
                    }
                    #printable-sticker .qr-container {
                        width: 12cm !important;
                        height: 12cm !important;
                        padding: 0.5cm !important;
                        border-radius: 1cm !important;
                        border: 4px solid rgba(251, 191, 36, 0.3) !important; /* amber-500/30 */
                        background: #ffffff !important;
                    }
                    #printable-sticker .footer-title {
                        font-size: 14pt !important;
                        text-align: center !important;
                        margin-top: 0.5cm !important;
                    }
                    #printable-sticker .footer-desc {
                        font-size: 11pt !important;
                        text-align: center !important;
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
                                                ? t("reservations.actionDeactivate")
                                                : t("reservations.actionActivate")
                                        }
                                    />

                                    <ActionIconButton
                                        variant="edit"
                                        icon={<EditIcon className="w-4 h-4" />}
                                        onClick={() => handleOpenEditModal(room)}
                                        title={t("common.edit")}
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

            <RoomModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleSaveRoomSubmit}
                rooms={rooms}
                onError={setErrorModalMsg}
                editingRoom={editingRoom}
            />

            <PrintQrModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                selectedRoom={selectedRoom}
                isGeneratingQr={isGeneratingQr}
                previewQrUrl={previewQrUrl}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={!!errorModalMsg}
                onClose={() => setErrorModalMsg(null)}
                message={errorModalMsg}
            />
        </div>
    );
}
