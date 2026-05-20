"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { LockIcon } from "@/components/icons";
import MetricCard from "@/components/MetricCard";
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
	const { orders, fetchAllOrders } = useOrder();

	const [searchQuery, setSearchQuery] = useState("");
	const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

	// Reload both datasets on mount
	const loadData = useCallback(async () => {
		await Promise.all([fetchAllReservations({ fetch_all: "true" }), fetchAllOrders()]);
	}, [fetchAllReservations, fetchAllOrders]);

	useEffect(() => { loadData(); }, [loadData]);

	// Dismiss toast after 4 seconds
	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 4000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	// Checkout: end reservation and clear its orders
	const handleCheckoutRoom = async (res: ReservationModel, totalBill: number) => {
		const success = await checkoutReservation(res.id);
		if (success) {
			setToast({
				text: isRtl
					? `${t("orders.msgCheckoutSuccessPrefix")}${res.client_name}${t("orders.msgCheckoutSuccessMiddle")}${totalBill.toLocaleString("en-US")}${t("orders.msgCheckoutSuccessSuffix")}`
					: `${t("orders.msgCheckoutSuccessPrefix")}${res.client_name}${t("orders.msgCheckoutSuccessMiddle")}${totalBill.toLocaleString("en-US")}${t("orders.msgCheckoutSuccessSuffix")}`,
			});
		}
	};

	// Only show accepted, non-completed reservations
	const activeReservations = reservations.filter((r) => r.accepted && !r.completed);

	// Aggregated operational metrics
	const totalRevenue = orders.reduce((sum, o) => sum + Number(o.item_price) * o.quantity, 0);
	const activeRoomsCount = activeReservations.length;
	const totalSoldItems = orders.reduce((sum, o) => sum + o.quantity, 0);

	// Filter by search
	const filteredReservations = activeReservations.filter(
		(r) =>
			r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(r.room?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			String(r.number).includes(searchQuery)
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
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					}
				/>
				<MetricCard
					title={t("orders.statOccupiedRooms")}
					value={`${activeRoomsCount} ${t("orders.unitRooms")}`}
					icon={
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
					}
				/>
				<MetricCard
					title={t("orders.statOrderedUnits")}
					value={`${totalSoldItems} ${t("orders.unitUnits")}`}
					icon={
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					}
				/>
			</div>

			{/* Search field bar */}
			<div className="flex justify-between items-center bg-[#131522] rounded-3xl p-4 border border-white/10 shadow-md">
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
					<div className="col-span-full py-16 text-center rounded-[28px] border border-white/5 bg-[#131522]/40">
						<div className="flex flex-col items-center gap-3">
							<div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
							<span className="text-xs text-zinc-500 font-bold">{t("common.loading")}</span>
						</div>
					</div>
				) : filteredReservations.length > 0 ? (
					filteredReservations.map((res: ReservationModel) => {
						const resOrders: OrderModel[] = orders.filter((o) => o.reservation_id === res.id);
						const totalBill = resOrders.reduce(
							(sum, o) => sum + Number(o.item_price) * o.quantity,
							0
						);

						return (
							<div
								key={res.id}
								className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-xl flex flex-col justify-between gap-6 relative group transition-all hover:border-amber-500/20"
							>
								{/* Ambient Glow */}
								<div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl pointer-events-none rounded-full" />

								{/* Header Details */}
								<div className="flex justify-between items-start border-b border-white/5 pb-4">
									<div>
										<span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-[#07080a] text-amber-400 border border-white/5 shadow-sm">
											R-{res.number}
										</span>
										<h3 className="text-base font-black text-white mt-2 group-hover:text-amber-300 transition-colors">
											{res.client_name}
										</h3>
										<p className="text-xs text-zinc-400 font-bold mt-1">
											{res.room?.name ?? t("common.unknown")}
										</p>
									</div>

									{/* Total Bill */}
									<div className="text-right">
										<span className="text-[10px] text-zinc-400 font-black tracking-wider block uppercase">
											{t("orders.accumulatedTotal")}
										</span>
										<span className="text-lg font-black text-amber-400 block mt-1">
											{totalBill.toLocaleString("en-US")} {t(`common.${settings.currency_name}`)}
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
													className="p-3 rounded-2xl bg-[#07080a]/50 border border-white/5 flex justify-between items-center text-xs"
												>
													<div>
														<p className="font-bold text-white">
															{o.item?.name ?? t("common.unknown")}
														</p>
														<p className="text-[10px] text-zinc-400 font-medium mt-0.5">
															{t("orders.qty")}{" "}
															<span className="font-bold text-white">{o.quantity}</span>{" "}
															× {Number(o.item_price).toLocaleString("en-US")}{" "}
															{t(`common.${settings.currency_name}`)}
														</p>
													</div>
													<span className="font-black text-zinc-300">
														{(Number(o.item_price) * o.quantity).toLocaleString("en-US")}{" "}
														{t(`common.${settings.currency_name}`)}
													</span>
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
										onClick={() => handleCheckoutRoom(res, totalBill)}
										className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
									>
										<LockIcon className="w-4 h-4 shrink-0" />
										<span>{t("orders.btnEndReservation")}</span>
									</button>
								</div>
							</div>
						);
					})
				) : (
					<div className="col-span-full py-16 text-center rounded-[28px] border border-white/5 bg-[#131522]/40 text-zinc-500 font-medium text-xs">
						{t("orders.noReservationsMatching")}
					</div>
				)}
			</div>

			{/* Elegant Toast notifications */}
			{toast && (
				<div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
					<div className="rounded-2xl border border-amber-500/30 bg-[#1a1c2c]/95 backdrop-blur-xl px-5 py-4 shadow-2xl flex items-center justify-between gap-4 text-amber-300">
						<div className="flex items-center gap-3">
							<span className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-xs">✓</span>
							<p className="text-xs font-black leading-relaxed">{toast.text}</p>
						</div>
						<button onClick={() => setToast(null)} className="text-zinc-400 hover:text-white font-black text-xs">✕</button>
					</div>
				</div>
			)}
		</div>
	);
}
