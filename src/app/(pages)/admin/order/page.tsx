"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { LockIcon, BuildingIcon } from "@/components/icons";
import BillIcon from "@/components/icons/BillIcon";
import BoxIcon from "@/components/icons/BoxIcon";
import MetricCard from "@/components/metric_card";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useReservation } from "@/context/reservation_context";
import { useOrder } from "@/context/order_context";
import ReservationModel from "@/models/data_models/reservation_model";
import OrderModel from "@/models/data_models/order_model";

/**
 * Admin Orders & Checkout Operations Page.
 * Shows accepted reservations with their orders. Checkout ends a reservation.
 * Connected to DB via ReservationContext and OrderContext.
 */
export default function AdminOrdersOperations() {
 const { t, isRtl } = useLanguage();
 const { settings } = useSettings();
 const {
 reservations,
 isReservationsLoading,
 fetchAllReservations,
 checkoutReservation,
 } = useReservation();
 const { orders, fetchAllOrders, updateOrder } = useOrder();

 const [searchQuery, setSearchQuery] = useState("");
 const [toast, setToast] = useState<{
 text: string;
 isError?: boolean;
 } | null>(null);

 // Reload both datasets on mount
 const loadData = useCallback(async () => {
 await Promise.all([
 fetchAllReservations({ fetch_all: "true" }),
 fetchAllOrders(),
 ]);
 }, [fetchAllReservations, fetchAllOrders]);

 useEffect(() => {
 loadData();
 }, [loadData]);

 // Dismiss toast after 4 seconds
 useEffect(() => {
 if (toast) {
 const timer = setTimeout(() => setToast(null), 4000);
 return () => clearTimeout(timer);
 }
 }, [toast]);

 // Checkout: end reservation and clear its orders
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
 }
 };

 // Approve individual order
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

 // Only show accepted, non-completed reservations
 const activeReservations = reservations.filter(
 (r) => r.accepted && !r.completed,
 );

 // Aggregated operational metrics
 const totalRevenue = orders.reduce(
 (sum, o) => sum + Number(o.item_price) * o.quantity,
 0,
 );
 const activeRoomsCount = activeReservations.length;
 const totalSoldItems = orders.reduce((sum, o) => sum + o.quantity, 0);

 // Filter by search
 const filteredReservations = activeReservations.filter(
 (r) =>
 r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (r.room?.name ?? "")
 .toLowerCase()
 .includes(searchQuery.toLowerCase()) ||
 String(r.number).includes(searchQuery),
 );

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
 icon={
 <BillIcon className="w-5 h-5" />
 }
 />
 <MetricCard
 title={t("orders.statOccupiedRooms")}
 value={`${activeRoomsCount} ${t("orders.unitRooms")}`}
 icon={
 <BuildingIcon className="w-5 h-5" />
 }
 />
 <MetricCard
 title={t("orders.statOrderedUnits")}
 value={`${totalSoldItems} ${t("orders.unitUnits")}`}
 icon={
 <BoxIcon className="w-5 h-5" />
 }
 />
 </div>

 {/* Search field bar */}
 <div className="flex justify-between items-center bg-surface rounded-3xl p-4 border border-white/10 shadow-md">
 <SearchInput
 value={searchQuery}
 onChange={setSearchQuery}
 placeholder={t("orders.checkoutSearch")}
 />
 <span className="text-xs text-zinc-400 font-bold hidden sm:inline">
 {t("orders.matchingBookings")} {filteredReservations.length}
 </span>
 </div>

 {/* Interactive Grouped Bookings & Checkouts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {isReservationsLoading ? (
 <div className="col-span-full py-16 text-center rounded-card border border-white/5 bg-surface/40">
 <div className="flex flex-col items-center gap-3">
 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
 <span className="text-xs text-zinc-500 font-bold">
 {t("common.loading")}
 </span>
 </div>
 </div>
 ) : filteredReservations.length > 0 ? (
 filteredReservations.map((res: ReservationModel) => {
 const resOrders: OrderModel[] = orders.filter(
 (o) => o.reservation_id === res.id,
 );
 const totalBill = resOrders.reduce(
 (sum, o) => sum + Number(o.item_price) * o.quantity,
 0,
 );

 return (
 <div
 key={res.id}
 className="rounded-card border border-white/10 bg-surface p-6 shadow-xl flex flex-col justify-between gap-6 relative group transition-all hover:border-primary/20"
 >
 {/* Ambient Glow */}
 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl pointer-events-none rounded-full" />

 {/* Header Details */}
 <div className="flex justify-between items-start border-b border-white/5 pb-4">
 <div>
 <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-background text-primary-hover border border-white/5 shadow-sm">
 R-{res.number}
 </span>
 <h3 className="text-base font-black text-white mt-2 group-hover:text-primary-light transition-colors">
 {res.client_name}
 </h3>
 <p className="text-xs text-zinc-400 font-bold mt-1">
 {res.room?.name ??
 t("common.unknown")}
 </p>
 </div>

 {/* Total Bill */}
 <div className="text-right">
 <span className="text-[10px] text-zinc-400 font-black tracking-wider block uppercase">
 {t("orders.accumulatedTotal")}
 </span>
 <span className="text-lg font-black text-primary-hover block mt-1">
 {totalBill.toLocaleString("en-US")}{" "}
 {t(
 `common.${settings.currency_name}`,
 )}
 </span>
 </div>
 </div>

 {/* Ordered list */}
 <div className="flex-1 space-y-3">
 <h4 className="text-xs font-black text-zinc-400 tracking-wide">
 {t("orders.orderedItemsLabel")}
 </h4>

 <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
 {resOrders.length > 0 ? (
 resOrders.map((o) => (
 <div
 key={o.id}
 className="p-3 rounded-2xl bg-background/50 border border-white/5 flex justify-between items-center text-xs gap-3"
 >
 <div className="flex-1 min-w-0">
 <p className="font-bold text-white truncate">
 {o.item?.name ??
 t(
 "common.unknown",
 )}
 </p>
 <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
 {t("orders.qty")}{" "}
 <span className="font-bold text-white">
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

 <div className="flex items-center gap-3 shrink-0">
 <span className="font-black text-zinc-300">
 {(
 Number(
 o.item_price,
 ) * o.quantity
 ).toLocaleString(
 "en-US",
 )}{" "}
 {t(
 `common.${settings.currency_name}`,
 )}
 </span>

 {o.accepted ? (
 <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-green-500/10 border border-green-500/20 text-green-400">
 {t(
 "orders.statusApproved",
 )}
 </span>
 ) : (
 <button
 onClick={() =>
 handleApproveOrder(
 o.id,
 )
 }
 className="px-3 py-1 rounded-full bg-primary hover:bg-primary-hover text-background font-extrabold text-[9px] transition-all cursor-pointer shadow-sm shadow-primary/10"
 >
 {t(
 "orders.btnApprove",
 )}
 </button>
 )}
 </div>
 </div>
 ))
 ) : (
 <div className="py-6 text-center text-zinc-600 font-bold text-xs italic">
 {t("orders.noOrdersRegistered")}
 </div>
 )}
 </div>
 </div>

 {/* Checkout Action */}
 <div className="pt-4 border-t border-white/5">
 <button
 onClick={() =>
 handleCheckoutRoom(res, totalBill)
 }
 className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-background font-extrabold text-xs transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
 >
 <LockIcon className="w-4 h-4 shrink-0" />
 <span>
 {t("orders.btnEndReservation")}
 </span>
 </button>
 </div>
 </div>
 );
 })
 ) : (
 <div className="col-span-full py-16 text-center rounded-card border border-white/5 bg-surface/40 text-zinc-500 font-medium text-xs">
 {t("orders.noReservationsMatching")}
 </div>
 )}
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
 className="text-zinc-400 hover:text-white font-black text-xs"
 >
 ✕
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
