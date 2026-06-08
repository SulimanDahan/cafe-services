"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { LockIcon, BuildingIcon, UndoCircleIcon, TrashIcon } from "@/components/icons";
import BillIcon from "@/components/icons/BillIcon";
import BoxIcon from "@/components/icons/BoxIcon";
import MetricCard from "@/components/metric_card";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useReservation } from "@/context/reservation_context";
import { useOrder } from "@/context/order_context";
import ReservationModel from "@/models/data_models/reservation_model";

export default function AdminOrdersOperations() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const {
        reservations,
        totalPages,
        isReservationsLoading,
        fetchAllReservations,
        checkoutReservation,
    } = useReservation();
    const { orders, fetchAllOrders, updateOrder, deleteOrder } = useOrder();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"active" | "completed">(
        "active",
    );
    const [selectedReservationId, setSelectedReservationId] = useState<
        string | null
    >(null);

    const [toast, setToast] = useState<{
        text: string;
        isError?: boolean;
    } | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Extract per_page to satisfy React Compiler's dependency tracking
    const perPage = settings?.per_page;

    // Fetch reservations with debouncing when filters change
    const fetchReservations = useCallback(async () => {
        await fetchAllReservations({
            page: currentPage.toString(),
            per_page: perPage?.toString() || "10",
            status: activeTab === "active" ? "in_progress" : "completed",
            all: "true",
            search: searchQuery,
        });
    }, [
        fetchAllReservations,
        currentPage,
        perPage,
        activeTab,
        searchQuery,
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReservations();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchReservations]);

    // Fetch orders once on mount
    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);

    // Dismiss toast after 4 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleCheckoutRoom = async (
        res: ReservationModel,
        totalBill: number,
    ) => {
        const success = await checkoutReservation(res.id);
        if (success) {
            setToast({
                text: isRtl
                    ? `${t("orders.msgCheckoutSuccessPrefix")}${res.client_name}${t("orders.msgCheckoutSuccessMiddle")}${totalBill.toLocaleString("en-US")}${t("orders.msgCheckoutSuccessSuffix")}`
                    : `${t("orders.msgCheckoutSuccessPrefix")}${res.client_name}${t("orders.msgCheckoutSuccessMiddle")}${totalBill.toLocaleString("en-US")}${t("orders.msgCheckoutSuccessSuffix")}`,
            });
            setSelectedReservationId(null); // Reset selection
        }
    };

    const handleApproveOrder = async (orderId: string) => {
        const success = await updateOrder(orderId, { accepted: true });
        if (success) {
            setToast({
                text: t("orders.msgOrderApproveSuccess"),
            });
        } else {
            setToast({
                text: t("orders.msgOrderApproveFailed"),
                isError: true,
            });
        }
    };

    const handleUnapproveOrder = async (orderId: string) => {
        const success = await updateOrder(orderId, { accepted: false });
        if (success) {
            setToast({ text: t("orders.msgOrderUnapproveSuccess") || "تم التراجع عن اعتماد الطلب" });
        } else {
            setToast({ text: t("orders.msgOrderUnapproveFailed") || "فشل التراجع عن الاعتماد", isError: true });
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        const success = await deleteOrder(orderId);
        if (success) {
            setToast({ text: t("orders.msgOrderDeleteSuccess") || "تم حذف الطلب بنجاح" });
        } else {
            setToast({ text: t("orders.msgOrderDeleteFailed") || "فشل حذف الطلب", isError: true });
        }
    };

    // Reset page when tab or search changes
    useEffect(() => {
        (() => setCurrentPage(1))();
    }, [activeTab, searchQuery]);

    // Select the first one by default if none is selected
    useEffect(() => {
        if (
            reservations.length > 0 &&
            !reservations.some((r) => r.id === selectedReservationId)
        ) {
            (() => setSelectedReservationId(reservations[0].id))();
        } else if (reservations.length === 0) {
            (() => setSelectedReservationId(null))();
        }
    }, [reservations, selectedReservationId, activeTab]);

    const selectedReservation =
        reservations.find((r) => r.id === selectedReservationId) ||
        null;

    // Operational metrics
    const activeOnlyReservations = reservations.filter(
        (r) => r.accepted && !r.completed,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at);
        return orderDate >= today;
    });

    const totalRevenue = todayOrders.reduce(
        (sum, o) => sum + Number(o.item_price) * o.quantity,
        0,
    );
    const activeRoomsCount = activeOnlyReservations.length;
    const totalSoldItems = todayOrders.reduce((sum, o) => sum + o.quantity, 0);

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <AdminHeader
                title={t("orders.checkoutTitle")}
                subtitle={t("orders.checkoutSubtitle")}
            />

            {/* Operational Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                    title={t("orders.statActiveBills")}
                    value={`${totalRevenue.toLocaleString("en-US")} ${t(`common.${settings.currency_name}`)}`}
                    highlight
                    icon={<BillIcon className="w-5 h-5" />}
                />
                <MetricCard
                    title={t("orders.statOccupiedRooms")}
                    value={`${activeRoomsCount} ${t("orders.unitRooms")}`}
                    icon={<BuildingIcon className="w-5 h-5" />}
                />
                <MetricCard
                    title={t("orders.statOrderedUnits")}
                    value={`${totalSoldItems} ${t("orders.unitUnits")}`}
                    icon={<BoxIcon className="w-5 h-5" />}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${activeTab === "active" ? "bg-primary text-background shadow-md" : "bg-surface hover:bg-surface-hover text-zinc-400 border border-white/5"}`}
                >
                    {t("orders.tabActiveRooms")}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${activeTab === "completed" ? "bg-zinc-100 text-zinc-900 shadow-md" : "bg-surface hover:bg-surface-hover text-zinc-400 border border-white/5"}`}
                >
                    {t("orders.tabCompleted")}
                </button>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: Sidebar List */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Search field bar */}
                    <div className="bg-surface rounded-3xl p-2 border border-white/10 shadow-md">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t("orders.checkoutSearch")}
                        />
                    </div>

                    {/* Rooms List */}
                    <div className="flex flex-col gap-3 max-h-150 overflow-y-auto pr-1">
                        {isReservationsLoading ? (
                            <div className="py-16 text-center rounded-3xl border border-white/5 bg-surface/40">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <span className="text-xs text-zinc-500 font-bold">
                                    {t("common.loading")}
                                </span>
                            </div>
                        ) : reservations.length > 0 ? (
                            reservations.map(
                                (res: ReservationModel) => {
                                    const resOrders = orders.filter(
                                        (o) => o.reservation_id === res.id,
                                    );
                                    const unapprovedCount = resOrders.filter(
                                        (o) => !o.accepted,
                                    ).length;
                                    const isSelected =
                                        selectedReservationId === res.id;

                                    return (
                                        <button
                                            key={res.id}
                                            onClick={() =>
                                                setSelectedReservationId(res.id)
                                            }
                                            className={`w-full text-start p-4 rounded-[20px] border transition-all flex justify-between items-center ${isSelected ? "bg-primary/10 border-primary/40 shadow-sm" : "bg-surface border-white/5 hover:border-white/20"} cursor-pointer`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-md text-[9px] font-black ${isSelected ? "bg-primary text-background" : "bg-background text-zinc-400"}`}
                                                    >
                                                        R-{res.number}
                                                    </span>
                                                    <h3
                                                        className={`text-sm font-black ${isSelected ? "text-primary-light" : "text-white"}`}
                                                    >
                                                        {res.client_name}
                                                    </h3>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 font-bold">
                                                    {res.room?.name ??
                                                        t("common.unknown")}
                                                </p>
                                            </div>
                                            {activeTab === "active" &&
                                                unapprovedCount > 0 && (
                                                    <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-black shadow-lg shadow-red-500/30">
                                                        {unapprovedCount}
                                                    </span>
                                                )}
                                        </button>
                                    );
                                },
                            )
                        ) : (
                            <div className="py-12 text-center rounded-3xl border border-white/5 bg-surface/40 text-zinc-500 font-medium text-xs">
                                {t("orders.noReservationsMatching")}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2 px-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-1.5 rounded-full bg-surface border border-white/5 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                            >
                                {t("common.previous")}
                            </button>
                            <span className="text-xs text-zinc-500 font-medium">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-1.5 rounded-full bg-surface border border-white/5 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                            >
                                {t("common.next")}
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: Detail View */}
                <div className="lg:col-span-8">
                    {selectedReservation ? (
                        <div className="rounded-[28px] border border-white/10 bg-surface shadow-2xl relative overflow-hidden flex flex-col min-h-125">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl pointer-events-none rounded-full" />

                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-end bg-linear-to-b from-white/2 to-transparent gap-4">
                                <div>
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-background text-primary-hover border border-white/5 shadow-sm mb-3 inline-block">
                                        R-{selectedReservation.number} •{" "}
                                        {selectedReservation.room?.name ??
                                            t("common.unknown")}
                                    </span>
                                    <h2 className="text-3xl font-black text-white tracking-tight">
                                        {selectedReservation.client_name}
                                    </h2>
                                </div>
                                <div className="sm:text-right">
                                    <span className="text-[11px] text-zinc-400 font-black tracking-wider block uppercase mb-1">
                                        {t("orders.accumulatedTotal")}
                                    </span>
                                    <span className="text-4xl font-black text-primary-light">
                                        {orders
                                            .filter(
                                                (o) =>
                                                    o.reservation_id ===
                                                    selectedReservation.id,
                                            )
                                            .reduce(
                                                (sum, o) =>
                                                    sum +
                                                    Number(o.item_price) *
                                                    o.quantity,
                                                0,
                                            )
                                            .toLocaleString("en-US")}{" "}
                                        <span className="text-xl text-primary/60">
                                            {t(
                                                `common.${settings.currency_name}`,
                                            )}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="p-4 sm:p-8 flex-1 overflow-y-auto bg-black/20">
                                <h4 className="text-sm font-black text-zinc-400 tracking-wide mb-4">
                                    {t("orders.orderedItemsLabel")}
                                </h4>

                                {(() => {
                                    const resOrders = orders.filter(
                                        (o) =>
                                            o.reservation_id ===
                                            selectedReservation.id,
                                    );
                                    if (resOrders.length === 0) {
                                        return (
                                            <div className="py-12 text-center text-zinc-600 font-bold text-sm italic border border-dashed border-white/10 rounded-3xl">
                                                {t("orders.noOrdersRegistered")}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="space-y-3">
                                            {resOrders.map((o) => (
                                                <div
                                                    key={o.id}
                                                    className="p-4 rounded-2xl bg-surface/60 backdrop-blur-md border border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-white/10 transition-colors"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-white text-base">
                                                            {o.item?.name ??
                                                                t(
                                                                    "common.unknown",
                                                                )}
                                                        </p>
                                                        <p className="text-xs text-zinc-400 font-medium mt-1">
                                                            {t("orders.qty")}{" "}
                                                            <span className="font-bold text-white px-1">
                                                                {o.quantity}
                                                            </span>{" "}
                                                            ×{" "}
                                                            {Number(
                                                                o.item_price,
                                                            ).toLocaleString(
                                                                "en-US",
                                                            )}{" "}
                                                            {t(
                                                                `common.${settings.currency_name}`,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                                        <span className="font-black text-zinc-300 text-lg">
                                                            {(
                                                                Number(
                                                                    o.item_price,
                                                                ) * o.quantity
                                                            ).toLocaleString(
                                                                "en-US",
                                                            )}{" "}
                                                            <span className="text-xs text-zinc-500">
                                                                {t(
                                                                    `common.${settings.currency_name}`,
                                                                )}
                                                            </span>
                                                        </span>

                                                        {o.accepted ? (
                                                            <>
                                                                <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-green-500/10 border border-green-500/20 text-green-400">
                                                                    {t(
                                                                        "orders.statusApproved",
                                                                    )}
                                                                </span>
                                                                {/* Undo approval button — only when reservation is active */}
                                                                {activeTab === "active" && (
                                                                    <button
                                                                        onClick={() => handleUnapproveOrder(o.id)}
                                                                        title={t("orders.btnUnapprove") || "التراجع عن الاعتماد"}
                                                                        className="p-1.5 rounded-full text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all cursor-pointer"
                                                                    >
                                                                        <UndoCircleIcon className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            activeTab ===
                                                            "active" && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleApproveOrder(
                                                                                o.id,
                                                                            )
                                                                        }
                                                                        className="px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-background font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-primary/20"
                                                                    >
                                                                        {t(
                                                                            "orders.btnApprove",
                                                                        )}
                                                                    </button>
                                                                    {/* Delete button — only for unapproved orders */}
                                                                    <button
                                                                        onClick={() => handleDeleteOrder(o.id)}
                                                                        title={t("orders.btnDeleteOrder") || "حذف الطلب"}
                                                                        className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Footer Actions */}
                            {activeTab === "active" && (
                                <div className="p-6 border-t border-white/5 bg-surface/50">
                                    <button
                                        onClick={() =>
                                            handleCheckoutRoom(
                                                selectedReservation,
                                                orders
                                                    .filter(
                                                        (o) =>
                                                            o.reservation_id ===
                                                            selectedReservation.id,
                                                    )
                                                    .reduce(
                                                        (sum, o) =>
                                                            sum +
                                                            Number(
                                                                o.item_price,
                                                            ) *
                                                            o.quantity,
                                                        0,
                                                    ),
                                            )
                                        }
                                        className="w-full py-4 px-6 rounded-full bg-primary hover:bg-primary-hover text-background font-extrabold text-sm transition-all duration-200 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 cursor-pointer"
                                    >
                                        <LockIcon className="w-5 h-5 shrink-0" />
                                        <span>
                                            {t("orders.btnEndReservation")}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full min-h-125 flex items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-surface/20">
                            <p className="text-zinc-500 font-medium text-sm">
                                {t("orders.noReservationsMatching")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Elegant Toast notifications */}
            {toast && (
                <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
                    <div
                        className={`rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 ${toast.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-primary/10 border-primary/30 text-primary-light"}`}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-xs border ${toast.isError ? "bg-red-500/20 border-red-500/30" : "bg-primary/20 border-primary/30"}`}
                            >
                                {toast.isError ? "✕" : "✓"}
                            </span>
                            <p className="text-xs font-black leading-relaxed">
                                {toast.text}
                            </p>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="text-zinc-400 hover:text-white font-black text-xs cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
