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
import Pagination from "@/components/pagination";
import TabBar from "@/components/tab_bar";
import { InputField } from "@/components/input";
import Table, { TableColumn } from "@/components/table";
import { ActionIconButton } from "@/components/button/action_icon_button";

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

    const columns: TableColumn[] = [
        { key: "client_name", label: t("reservations.columnClient") },
        { key: "phone", label: t("reservations.columnPhone") },
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
        resolver: zodResolver(
            reservationSchema,
        ) as unknown as Resolver<ReservationFormValues>,
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
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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
            <div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
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
                                className="w-4 h-4 rounded border-white/10 bg-[#07080a] text-amber-500 focus:ring-0 focus:ring-offset-0 accent-amber-500 cursor-pointer"
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
                                    className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {res.client_name}
                                </td>
                                <td
                                    className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {res.phone}
                                </td>
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
                                            res.accepted ? "success" : "amber"
                                        }
                                        pulse={!res.accepted}
                                    >
                                        {res.accepted
                                            ? t("reservations.statusAccepted")
                                            : t("reservations.statusPending")}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        {!res.accepted && (
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
                                        )}
                                        <ActionIconButton
                                            variant="delete"
                                            icon={
                                                <TrashIcon className="w-4 h-4" />
                                            }
                                            onClick={() => handleDelete(res.id)}
                                            title={t("common.delete")}
                                        />
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

            <AdminModal
                isOpen={isResOpen}
                onClose={() => setIsResOpen(false)}
                title={t("reservations.modalAddTitle")}
            >
                <form
                    onSubmit={handleSubmit(handleAddReservation)}
                    className="space-y-4"
                >
                    {/* Client Name */}
                    <InputField
                        label={t("reservations.formClientName")}
                        id="resClient"
                        type="text"
                        {...register("client_name")}
                        placeholder={t("reservations.formClientPlaceholder")}
                        autoFocus
                    />
                    {errors.client_name?.message && (
                        <p className="text-[10px] text-red-400 font-medium mt-1">
                            {String(errors.client_name.message)}
                        </p>
                    )}

                    {/* Client Phone */}
                    <InputField
                        label={t("reservations.formPhone")}
                        id="resPhone"
                        type="tel"
                        {...register("phone")}
                        placeholder="05xxxxxxxx"
                    />
                    {errors.phone?.message && (
                        <p className="text-[10px] text-red-400 font-medium mt-1">
                            {String(errors.phone.message)}
                        </p>
                    )}

                    {/* Date and Time */}
                    <InputField
                        label={t("reservations.formDateTime")}
                        id="resDate"
                        type="datetime-local"
                        {...register("date_time")}
                    />
                    {errors.date_time?.message && (
                        <p className="text-[10px] text-red-400 font-medium mt-1">
                            {String(errors.date_time.message)}
                        </p>
                    )}

                    {/* Room / Table selector */}
                    <InputField
                        isSelect
                        label={t("reservations.formAssignedRoom")}
                        id="resRoom"
                        {...register("room_id")}
                        options={rooms
                            .filter((r) => !r.is_disable)
                            .map((r) => ({ id: r.id, name: r.name }))}
                    />
                    {errors.room_id?.message && (
                        <p className="text-[10px] text-red-400 font-medium mt-1">
                            {String(errors.room_id.message)}
                        </p>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                        <PrimaryButton
                            type="button"
                            onClick={() => setIsResOpen(false)}
                            variant="secondary"
                            size="md"
                        >
                            {t("common.cancel")}
                        </PrimaryButton>
                        <PrimaryButton type="submit" size="md">
                            {t("common.save")}
                        </PrimaryButton>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
