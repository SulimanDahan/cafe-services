"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations/reservation";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import TabBar from "@/components/tab_bar";
import { useSettings } from "@/context/settings_context";
import { CheckIcon, TrashIcon, UndoCircleIcon, EnableCircleIcon, EmptyOrdersIcon, EmptyReportsIcon } from "@/components/icons";
import ReservationModel from "@/models/data_models/reservation_model";
import OrderModel from "@/models/data_models/order_model";
import ReportModel from "@/models/data_models/report_model";

interface ReservationFormValues {
    client_name: string;
    phone: string;
    room_id: string;
    date_time: string;
    order_passkey?: number;
}

interface CombinedReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ReservationFormValues) => Promise<boolean>;
    rooms: { id: string; name: string; is_disable: boolean }[];
    reservation: ReservationModel | null;
    initialRoomId?: string;
    orders: OrderModel[];
    reports: ReportModel[];
    roomStatuses?: Map<string, "accepted" | "active" | "pending">;
    onAccept: (id: string) => Promise<void>;
    onActivate: (id: string) => Promise<void>;
    onComplete: (id: string) => Promise<void>;
    onApproveOrder: (id: string) => Promise<void>;
    onUnapproveOrder: (id: string) => Promise<void>;
    onDeleteOrder: (id: string) => Promise<void>;
    onMarkReportRead: (id: string) => Promise<void>;
    onUndoAction: (id: string, action: "accept" | "activate" | "complete" | "reject") => Promise<void>;
}

export default function CombinedReservationModal({
    isOpen,
    onClose,
    onSave,
    rooms,
    reservation,
    initialRoomId = "",
    orders,
    reports,
    roomStatuses = new Map(),
    onAccept,
    onActivate,
    onComplete,
    onApproveOrder,
    onUnapproveOrder,
    onDeleteOrder,
    onMarkReportRead,
    onUndoAction,
}: CombinedReservationModalProps) {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState("details");

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

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setActiveTab("details"), 0);
            if (reservation) {
                reset({
                    client_name: reservation.client_name,
                    phone: reservation.phone,
                    room_id: reservation.room_id,
                    date_time: new Date(reservation.date_time).toISOString().split("T")[0],
                    order_passkey: reservation.order_passkey,
                });
            } else {
                const today = new Date().toISOString().split("T")[0];
                reset({
                    client_name: "",
                    phone: "",
                    room_id: initialRoomId || rooms.find((r) => !r.is_disable)?.id || "",
                    date_time: today,
                });
            }
        }
    }, [isOpen, reset, rooms, reservation, initialRoomId]);

    const handleFormSubmit = async (data: ReservationFormValues) => {
        const success = await onSave(data);
        if (success) {
            onClose();
        }
    };

    const unapprovedOrdersCount = orders.filter(o => !o.accepted).length;
    const unreadReportsCount = reports.filter(r => !r.is_read).length;

    const totalBill = orders.reduce((sum, o) => sum + Number(o.item_price) * o.quantity, 0);

    const desktopTabs = [
        {
            id: "orders",
            label: `${t("reservations.tabOrders") || "Orders"} ${unapprovedOrdersCount > 0 ? `(${unapprovedOrdersCount})` : ''}`
        },
        {
            id: "reports",
            label: `${t("reservations.tabReports") || "Reports"} ${unreadReportsCount > 0 ? `(${unreadReportsCount})` : ''}`
        },
    ];

    const mobileTabs = [
        { id: "details", label: t("reservations.tabDetails") || "Details" },
        ...desktopTabs
    ];

    // Fallback for right panel on desktop when activeTab is 'details'
    const rightPanelTab = activeTab === "details" ? "orders" : activeTab;

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleString(isRtl ? "ar-SA" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AdminModal isOpen={isOpen} onClose={onClose} maxWidth={reservation ? "max-w-6xl" : "max-w-md"}>
            <div className={`flex flex-col gap-6 lg:gap-8 w-full max-h-[85vh] ${reservation ? 'lg:h-auto' : ''} overflow-y-auto lg:overflow-hidden custom-scrollbar pr-1 lg:pr-0 transition-all duration-500`}>

                {/* ======================= */}
                {/* MOBILE GLOBAL TABS      */}
                {/* ======================= */}
                {reservation && (
                    <div className="lg:hidden shrink-0 w-full mb-4 sticky top-0 z-20 bg-surface/90 backdrop-blur-md py-2 -my-2">
                        <TabBar
                            tabs={mobileTabs}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>
                )}

                <div className="hidden w-full shrink-0 lg:block mb-2">
                    <h2 className="text-2xl font-black text-white tracking-wide">
                        {reservation ? t("reservations.tabDetails") : t("reservations.modalAddTitle")}
                    </h2>
                </div>

                <div className={`w-full flex-1 flex flex-col lg:grid ${reservation ? 'lg:grid-cols-[35%_minmax(0,1fr)]' : 'lg:grid-cols-1'} gap-6 lg:gap-8 min-h-0`}>
                    {/* ======================= */}
                    {/* LEFT COLUMN: DETAILS    */}
                    {/* ======================= */}
                    <div className={`flex flex-col min-h-0 ${reservation ? "w-full lg:overflow-hidden" : "w-full"} ${activeTab !== "details" && reservation ? "hidden lg:flex" : "flex"}`}>

                        <div className="flex-1 lg:overflow-y-auto custom-scrollbar lg:pr-2">
                            <form id="reservation-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                                <InputField
                                    label={t("reservations.formAssignedRoom") || "Assigned Room"}
                                    id="resRoom"
                                    isSelect
                                    {...register("room_id")}
                                    disabled={!reservation}
                                    options={rooms.filter((r) => !r.is_disable).map((r) => {
                                        const status = roomStatuses.get(r.id);
                                        let statusIcon = "🟢";
                                        if (status === "active") statusIcon = "🔴";
                                        else if (status === "accepted") statusIcon = "🟠";
                                        else if (status === "pending") statusIcon = "🔵";

                                        return {
                                            id: r.id,
                                            name: `${r.name} ${statusIcon}`
                                        };
                                    })}
                                    className={`font-black w-full ${!reservation?.accepted ? 'text-blue-400' : ''}`}
                                />
                                {errors.room_id?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">{t(String(errors.room_id.message))}</p>
                                )}

                                <InputField
                                    label={t("reservations.formClientName")}
                                    id="resClient"
                                    type="text"
                                    {...register("client_name")}
                                    placeholder={t("reservations.formClientPlaceholder")}
                                    autoFocus
                                />
                                {errors.client_name?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">{t(String(errors.client_name.message))}</p>
                                )}

                                <InputField
                                    label={t("reservations.formPhone")}
                                    id="resPhone"
                                    type="tel"
                                    {...register("phone", {
                                        onChange: (e) => {
                                            const val = e.target.value.replace(/[^0-9+]/g, "");
                                            e.target.value = val.replace(/(?!^)\+/g, "");
                                        }
                                    })}
                                    placeholder="7xxxxxxxx"
                                />
                                {errors.phone?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">{t(String(errors.phone.message))}</p>
                                )}

                                <InputField
                                    label={t("reservations.formDateTime")}
                                    id="resDate"
                                    type="date"
                                    {...register("date_time")}
                                />
                                {errors.date_time?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">{t(String(errors.date_time.message))}</p>
                                )}

                                {reservation?.order_passkey && (
                                    <InputField
                                        label={t("reservations.columnPasskey") || "Passkey"}
                                        id="resPasskey"
                                        type="text"
                                        value={reservation.order_passkey.toString()}
                                        readOnly
                                        className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 text-sm opacity-90 font-black text-amber-500 tracking-wider text-center"
                                    />
                                )}

                            </form>
                        </div>

                        <div className="shrink-0 pt-6 mt-4 border-t border-white/5 w-full">
                            <PrimaryButton type="submit" form="reservation-form" className="w-full shadow-lg shadow-primary/20">
                                {t("common.save")}
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* <hr className="hidden lg:block rotate-90 border-gray-200 dark:border-gray-700 my-4" /> */}

                    {/* ======================= */}
                    {/* RIGHT COLUMN: DASHBOARD */}
                    {/* ======================= */}
                    {reservation && (
                        <div className={`flex flex-col min-h-0 lg:overflow-hidden gap-4 ${activeTab === "details" ? "hidden lg:flex" : "flex"}`}>
                            {/* Right Header: Actions */}
                            <div className="shrink-0 flex flex-wrap justify-end gap-3 mb-2">
                                {/* Case 1: Pending */}
                                {!reservation.accepted && !reservation.completed && !reservation.rejected && (
                                    <>
                                        <PrimaryButton type="button" onClick={() => onAccept(reservation.id)} className="bg-emerald-500! hover:bg-emerald-600! text-white! shadow-emerald-500/20!">
                                            <CheckIcon className="w-5 h-5" />
                                            {t("reservations.btnConfirmRes")}
                                        </PrimaryButton>
                                    </>
                                )}
                                {/* Case 2: Accepted but not Activated */}
                                {reservation.accepted && !reservation.activated && !reservation.completed && !reservation.rejected && (
                                    <>
                                        <PrimaryButton type="button" onClick={() => onActivate(reservation.id)} className="bg-rose-500! hover:bg-rose-600! text-white! shadow-rose-500/20!">
                                            <EnableCircleIcon className="w-5 h-5" />
                                            {t("reservations.btnActivateRes")}
                                        </PrimaryButton>
                                        <PrimaryButton variant="secondary" type="button" onClick={() => onUndoAction(reservation.id, "accept")}>
                                            <UndoCircleIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
                                            {t("common.undo") || "Undo"}
                                        </PrimaryButton>
                                    </>
                                )}
                                {/* Case 3: Activated */}
                                {reservation.activated && !reservation.completed && !reservation.rejected && (
                                    <>
                                        <PrimaryButton type="button" onClick={() => onComplete(reservation.id)} className="px-8 text-base! shadow-lg">
                                            {t("reservations.btnCompleteRes") || "Complete"}
                                        </PrimaryButton>
                                        <PrimaryButton variant="secondary" type="button" onClick={() => onUndoAction(reservation.id, "activate")}>
                                            <UndoCircleIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
                                            {t("common.undo") || "Undo"}
                                        </PrimaryButton>
                                    </>
                                )}
                                {/* Case 4: Completed */}
                                {reservation.completed && (
                                    <PrimaryButton variant="secondary" type="button" onClick={() => onUndoAction(reservation.id, "complete")}>
                                        <UndoCircleIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
                                        {t("common.undo") || "Undo"}
                                    </PrimaryButton>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col bg-[#07080a]/50 rounded-3xl border border-white/5 p-4 lg:p-6 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] min-h-0 lg:overflow-hidden">
                                {/* Right Header */}
                                <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="hidden lg:block">
                                        <TabBar
                                            tabs={desktopTabs}
                                            activeTab={rightPanelTab}
                                            onChange={setActiveTab}
                                        />
                                    </div>

                                    <div className="w-full sm:w-auto text-right bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                                        <span className="text-[10px] text-amber-500/70 font-black block uppercase tracking-widest mb-0.5">
                                            {t("orders.accumulatedTotal")}
                                        </span>
                                        <span className="text-2xl font-black text-amber-400">
                                            {totalBill.toLocaleString("en-US")} <span className="text-sm text-amber-400/50 font-semibold ml-1">{t(`common.${settings.currency_name}`)}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Right Scrollable Content */}
                                <div className="flex-1 lg:overflow-y-auto custom-scrollbar lg:pr-2">

                                    {/* ORDERS TAB */}
                                    {rightPanelTab === "orders" && (
                                        <div className="space-y-3 animate-fade-in h-full">
                                            {orders.length === 0 ? (
                                                <div className="py-20 flex flex-col h-full items-center justify-center text-zinc-500 bg-white/1 rounded-3xl border border-dashed border-white/5">
                                                    <EmptyOrdersIcon className="w-20 h-20 mb-4 text-zinc-500/20" />
                                                    <p className="font-bold text-sm tracking-wide">{t("orders.noOrdersRegistered")}</p>
                                                </div>
                                            ) : (
                                                orders.map((o) => (
                                                    <div key={o.id} className="p-4 rounded-2xl bg-surface/80 backdrop-blur-md border border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm hover:border-white/10 transition-colors h-full">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-white text-base">{o.item?.name ?? t("common.unknown")}</p>
                                                            <p className="text-xs text-zinc-400 font-medium mt-1.5 flex items-center gap-2">
                                                                <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">{o.quantity}</span>
                                                                <span>× {Number(o.item_price).toLocaleString("en-US")} {t(`common.${settings.currency_name}`)}</span>
                                                            </p>
                                                            {o.notes && (
                                                                <p className="text-[11px] text-amber-400 font-bold mt-2 bg-amber-400/10 inline-block px-2.5 py-1 rounded-lg border border-amber-400/20">
                                                                    {t("orders.notePrefix") || "Note: "}{o.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                                            <span className="font-black text-white text-sm bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                                                {(Number(o.item_price) * o.quantity).toLocaleString("en-US")} <span className="text-[10px] text-zinc-500">{t(`common.${settings.currency_name}`)}</span>
                                                            </span>
                                                            {o.accepted ? (
                                                                <>
                                                                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                                                                        <CheckIcon className="w-3 h-3" />
                                                                        {t("orders.statusApproved")}
                                                                    </span>
                                                                    {!reservation.completed && (
                                                                        <button onClick={() => onUnapproveOrder(o.id)} className="p-2 rounded-xl text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 border border-transparent hover:border-amber-400/20 transition-all cursor-pointer">
                                                                            <UndoCircleIcon className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                !reservation.completed && (
                                                                    <>
                                                                        <button onClick={() => onApproveOrder(o.id)} className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-background font-extrabold text-[11px] transition-all cursor-pointer shadow-lg shadow-primary/20">
                                                                            {t("orders.btnApprove")}
                                                                        </button>
                                                                        <button onClick={() => onDeleteOrder(o.id)} className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all cursor-pointer">
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* REPORTS TAB */}
                                    {rightPanelTab === "reports" && (
                                        <div className="space-y-3 animate-fade-in h-full">
                                            {reports.length === 0 ? (
                                                <div className="py-20 flex h-full flex-col items-center justify-center text-zinc-500 bg-white/1 rounded-3xl border border-dashed border-white/5">
                                                    <EmptyReportsIcon className="w-20 h-20 mb-4 text-zinc-500/20" />
                                                    <p className="font-bold text-sm tracking-wide">{t("reservations.noReports") || "No reports for this session."}</p>
                                                </div>
                                            ) : (
                                                reports.map((r) => (
                                                    <div key={r.id} className={`p-5 rounded-2xl h-full border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${r.is_read ? 'bg-surface/80 border-white/5' : 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]'}`}>
                                                        <div>
                                                            <p className={`text-sm leading-relaxed ${r.is_read ? 'text-zinc-300' : 'text-white font-black'}`}>
                                                                {r.message_text}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-500 font-bold mt-2.5 flex items-center gap-2">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${r.is_read ? 'bg-zinc-600' : 'bg-red-500 animate-pulse'}`}></span>
                                                                {formatDate(r.created_at)}
                                                            </p>
                                                        </div>
                                                        {!r.is_read && (
                                                            <button onClick={() => onMarkReportRead(r.id)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs transition-all cursor-pointer shrink-0 shadow-lg shadow-red-500/20">
                                                                {t("common.markAsRead") || "Mark Read"}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminModal>
    );
}
