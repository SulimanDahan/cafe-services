"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useReservation } from "@/context/reservation_context";
import { useRoom } from "@/context/room_context";
import {
    CheckIcon,
    TrashIcon,
    UndoCircleIcon,
    EnableCircleIcon,
    EditIcon,
} from "@/components/icons";
import ReservationModel from "@/models/data_models/reservation_model";
import ErrorModal from "@/components/partials/modals/error_modal";
import AdminReservationModal from "@/components/partials/modals/admin/AdminReservationModal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";
import TabBar from "@/components/tab_bar";
import Table, { TableColumn } from "@/components/table";
import { ActionIconButton } from "@/components/button/action_icon_button";
import PlusIcon from "@/components/icons/PlusIcon";

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
        updateReservation,
        acceptReservation,
        activateReservation,
        rejectReservation,
        deleteReservation,
        undoReservationAction,
    } = useReservation();
    const { rooms, fetchAllRooms } = useRoom();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [showPast, setShowPast] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const columns: TableColumn[] = [
        { key: "client_name", label: t("reservations.columnClient") },
        { key: "phone", label: t("reservations.columnPhone") },
        ...(settings.force_client_order_session_passKey
            ? [
                  {
                      key: "order_passkey",
                      label: t("reservations.columnPasskey") || "Passkey",
                  },
              ]
            : []),
        { key: "date_time", label: t("reservations.columnDateTime") },
        { key: "room", label: t("reservations.columnRoom") },
        {
            key: "status",
            label: t("reservations.columnStatus"),
            align: "center",
        },
        { key: "actions", label: t("common.actions"), align: "center" },
    ];

    // Form Modal Toggles
    const [isResOpen, setIsResOpen] = useState(false);
    const [editingRes, setEditingRes] = useState<ReservationModel | null>(null);
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);

    // React Hook Form values interface
    interface ReservationFormValues {
        client_name: string;
        phone: string;
        room_id: string;
        date_time: string;
    }

    const perPage = settings.per_page || 10;

    // Compute set of room IDs that currently have an active (activated, not completed) reservation
    const activeRoomIds = new Set(
        reservations
            .filter((r) => r.activated && !r.completed && !r.rejected)
            .map((r) => r.room_id),
    );

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
    }, [
        currentPage,
        searchQuery,
        activeTab,
        showPast,
        perPage,
        fetchAllReservations,
    ]);

    // Fetch rooms once for dropdown (not paginated)
    useEffect(() => {
        fetchAllRooms({ fetch_all: "true" });
    }, [fetchAllRooms]);

    const handleOpenAddForm = () => {
        setEditingRes(null);
        setIsResOpen(true);
    };

    const handleOpenEditForm = (res: ReservationModel) => {
        setEditingRes(res);
        setIsResOpen(true);
    };

    const handleSaveReservation = async (
        data: ReservationFormValues,
    ): Promise<boolean> => {
        let success = false;
        if (editingRes) {
            success = await updateReservation(editingRes.id, {
                client_name: data.client_name,
                phone: data.phone,
                room_id: data.room_id,
                date_time: new Date(data.date_time),
            });
        } else {
            success = await addReservation({
                client_name: data.client_name,
                phone: data.phone,
                room_id: data.room_id,
                date_time: new Date(data.date_time),
                accepted: true,
                completed: false,
            });
        }

        if (!success) {
            setErrorModalMsg(t("common.errorOccurred"));
        }
        return success;
    };

    const handleAccept = async (id: string) => {
        const success = await acceptReservation(id);
        if (!success) {
            setErrorModalMsg(t("apiMessages.error.roomAlreadyActive"));
        }
    };

    const handleActivate = async (id: string) => {
        const success = await activateReservation(id);
        if (!success) {
            setErrorModalMsg(t("apiMessages.error.roomAlreadyActive"));
        }
    };

    const handleReject = async (id: string) => {
        if (
            confirm(
                t("reservations.confirmReject") || t("common.confirmDelete"),
            )
        ) {
            const success = await rejectReservation(id);
            if (!success) {
                setErrorModalMsg(t("common.errorOccurred"));
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(t("common.confirmDelete"))) {
            await deleteReservation(id);
        }
    };

    const handleUndoAction = async (
        id: string,
        action: "accept" | "activate" | "complete" | "reject",
    ) => {
        const result = await undoReservationAction(id, action);
        if (!result.success) {
            setErrorModalMsg(t(result.error || "common.errorOccurred"));
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <AdminHeader
                title={t("reservations.title")}
                subtitle={t("reservations.subtitle")}
            >
                <PrimaryButton onClick={handleOpenAddForm} size="md">
                    <PlusIcon className="w-4 h-4" />
                    <span>{t("reservations.addReservation")}</span>
                </PrimaryButton>
            </AdminHeader>

            {/* Filters Panel */}
            <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md space-y-6">
                {/* Status Sub-Tabs and search bar */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    {/* Subtabs */}
                    {/* Subtabs */}
                    <TabBar
                        tabs={[
                            {
                                id: "all",
                                label: `${t("reservations.filterAll")} (${total})`,
                            },
                            {
                                id: "pending",
                                label: t("reservations.filterPending"),
                            },
                            {
                                id: "confirmed",
                                label: t("reservations.filterAccepted"),
                            },
                            {
                                id: "active",
                                label: t("reservations.filterActive"),
                            },
                            {
                                id: "completed",
                                label: t("reservations.filterCompleted"),
                            },
                            {
                                id: "rejected",
                                label: t("reservations.filterRejected"),
                            },
                        ]}
                        activeTab={activeTab}
                        onChange={(id) => {
                            setActiveTab(id);
                            setCurrentPage(1);
                        }}
                    />

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <label className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-white/5 bg-[#0d0f17]/50 hover:bg-[#0d0f17]/80 cursor-pointer transition-all duration-200 select-none text-zinc-300">
                            <input
                                type="checkbox"
                                checked={showPast}
                                onChange={(e) => setShowPast(e.target.checked)}
                                className="w-4 h-4 rounded border-white/10 bg-background text-primary focus:ring-0 focus:ring-offset-0 accent-primary cursor-pointer"
                            />
                            <span className="text-xs font-extrabold whitespace-nowrap">
                                {t("reservations.showPast")}
                            </span>
                        </label>
                        <SearchInput
                            value={searchQuery}
                            onChange={(v) => {
                                setSearchQuery(v);
                                setCurrentPage(1);
                            }}
                            placeholder={t("reservations.searchRes")}
                        />
                    </div>
                </div>

                {/* Reservations Table */}
                <Table
                    columns={columns}
                    isLoading={isReservationsLoading}
                    dataLength={reservations.length}
                >
                    {reservations.map(
                        (res: ReservationModel, index: number) => (
                            <tr
                                key={index}
                                className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
                            >
                                <td
                                    className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {res.client_name}
                                </td>
                                <td
                                    className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {res.phone}
                                </td>
                                {settings.force_client_order_session_passKey && (
                                    <td
                                        className={`py-4 px-4 font-black text-amber-500 text-sm tracking-wider whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                    >
                                        {res.order_passkey ? res.order_passkey.toString() : "—"}
                                    </td>
                                )}
                                <td
                                    className={`py-4 px-4 text-zinc-400 text-xs font-semibold whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {formatDate(res.date_time)}
                                </td>
                                <td
                                    className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {res.room?.name ?? t("common.unknown")}
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                    <Badge
                                        variant={
                                            res.rejected
                                                ? "error"
                                                : res.completed
                                                  ? "zinc"
                                                  : res.activated
                                                    ? "success"
                                                    : res.accepted
                                                      ? "info"
                                                      : "amber"
                                        }
                                        pulse={
                                            !res.rejected &&
                                            (!res.accepted ||
                                                (res.activated &&
                                                    !res.completed))
                                        }
                                    >
                                        {res.rejected
                                            ? t("reservations.statusRejected")
                                            : res.completed
                                              ? t(
                                                    "reservations.statusCompleted",
                                                )
                                              : res.activated
                                                ? t("reservations.statusActive")
                                                : res.accepted
                                                  ? t(
                                                        "reservations.statusAccepted",
                                                    )
                                                  : t(
                                                        "reservations.statusPending",
                                                    )}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        {!res.accepted &&
                                            !res.completed &&
                                            !res.rejected && (
                                                <>
                                                    <ActionIconButton
                                                        variant="accept"
                                                        icon={
                                                            <CheckIcon className="w-4 h-4" />
                                                        }
                                                        onClick={() =>
                                                            handleAccept(res.id)
                                                        }
                                                        title={t(
                                                            "reservations.btnConfirmRes",
                                                        )}
                                                    />
                                                    <ActionIconButton
                                                        variant="disable"
                                                        icon={
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        }
                                                        onClick={() =>
                                                            handleReject(res.id)
                                                        }
                                                        title={t(
                                                            "reservations.btnRejectRes",
                                                        )}
                                                    />
                                                </>
                                            )}
                                        {res.accepted &&
                                            !res.activated &&
                                            !res.completed &&
                                            !res.rejected && (
                                                <ActionIconButton
                                                    variant="enable"
                                                    icon={
                                                        <EnableCircleIcon className="w-4 h-4" />
                                                    }
                                                    onClick={() =>
                                                        handleActivate(res.id)
                                                    }
                                                    title={t(
                                                        "reservations.btnActivateRes",
                                                    )}
                                                />
                                            )}
                                        {!res.activated &&
                                            !res.completed &&
                                            !res.rejected && (
                                                <>
                                                    <ActionIconButton
                                                        variant="edit"
                                                        icon={
                                                            <EditIcon className="w-4 h-4" />
                                                        }
                                                        onClick={() =>
                                                            handleOpenEditForm(
                                                                res,
                                                            )
                                                        }
                                                        title={t("common.edit")}
                                                    />
                                                    <ActionIconButton
                                                        variant="delete"
                                                        icon={
                                                            <TrashIcon className="w-4 h-4" />
                                                        }
                                                        onClick={() =>
                                                            handleDelete(res.id)
                                                        }
                                                        title={t(
                                                            "common.delete",
                                                        )}
                                                    />
                                                </>
                                            )}
                                        {res.accepted &&
                                            !res.activated &&
                                            !res.completed &&
                                            !res.rejected && (
                                                <ActionIconButton
                                                    variant="edit"
                                                    icon={
                                                        <UndoCircleIcon className="w-4 h-4" />
                                                    }
                                                    onClick={() =>
                                                        handleUndoAction(
                                                            res.id,
                                                            "accept",
                                                        )
                                                    }
                                                    title={t(
                                                        "reservations.btnUndoAccept",
                                                    )}
                                                />
                                            )}
                                        {res.activated &&
                                            !res.completed &&
                                            !res.rejected && (
                                                <ActionIconButton
                                                    variant="edit"
                                                    icon={
                                                        <UndoCircleIcon className="w-4 h-4" />
                                                    }
                                                    onClick={() =>
                                                        handleUndoAction(
                                                            res.id,
                                                            "activate",
                                                        )
                                                    }
                                                    title={t(
                                                        "reservations.btnUndoActivate",
                                                    )}
                                                />
                                            )}
                                        {res.completed && !res.rejected && (
                                            <ActionIconButton
                                                variant="edit"
                                                icon={
                                                    <UndoCircleIcon className="w-4 h-4" />
                                                }
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            t(
                                                                "reservations.confirmUndoComplete",
                                                            ),
                                                        )
                                                    ) {
                                                        handleUndoAction(
                                                            res.id,
                                                            "complete",
                                                        );
                                                    }
                                                }}
                                                title={t(
                                                    "reservations.btnUndoComplete",
                                                )}
                                            />
                                        )}
                                        {res.rejected && (
                                            <ActionIconButton
                                                variant="edit"
                                                icon={
                                                    <UndoCircleIcon className="w-4 h-4" />
                                                }
                                                onClick={() =>
                                                    handleUndoAction(
                                                        res.id,
                                                        "reject",
                                                    )
                                                }
                                                title={t(
                                                    "reservations.btnUndoReject",
                                                )}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ),
                    )}
                </Table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={perPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            <AdminReservationModal
                isOpen={isResOpen}
                onClose={() => {
                    setIsResOpen(false);
                    setEditingRes(null);
                }}
                onSave={handleSaveReservation}
                rooms={rooms}
                activeRoomIds={activeRoomIds}
                initialData={
                    editingRes
                        ? {
                              client_name: editingRes.client_name,
                              phone: editingRes.phone,
                              room_id: editingRes.room_id,
                              order_passkey: editingRes.order_passkey,
                              date_time: new Date(
                                  editingRes.date_time,
                              ).toISOString(),
                          }
                        : null
                }
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
