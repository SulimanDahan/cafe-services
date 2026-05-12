"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";
import MetricCard from "@/components/MetricCard";
import { useLanguage } from "@/config/i18n";

// Interfaces
interface Reservation {
	id: string;
	number: string;
	client_name: string;
	phone: string;
	datetime: string;
	room_id: string;
	room_name: string;
	accepted: boolean;
}

interface Order {
	id: string;
	reservation_id: string;
	client_name: string;
	reservation_number: string;
	item_id: string;
	item_name: string;
	item_price: number;
	quantity: number;
	createdAt: string;
}

export default function AdminOrdersOperations() {
	const { isRtl } = useLanguage();

	const [reservations, setReservations] = useState<Reservation[]>(() => {
		if (typeof window === "undefined") return [];
		const storedRes = localStorage.getItem("cafe_reservations");
		if (storedRes) {
			try {
				return JSON.parse(storedRes);
			} catch (e) {
				console.error("Error parsing reservations in admin", e);
			}
		}
		return [];
	});

	const [orders, setOrders] = useState<Order[]>(() => {
		if (typeof window === "undefined") return [];
		const storedOrders = localStorage.getItem("cafe_orders");
		if (storedOrders) {
			try {
				return JSON.parse(storedOrders);
			} catch (e) {
				console.error("Error parsing orders in admin", e);
			}
		}
		return [];
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [toast, setToast] = useState<{
		text: string;
		isError?: boolean;
	} | null>(null);

	// Fetch unified localStorage states on mount and set up custom event listener
	const loadDatabase = () => {
		const storedRes = localStorage.getItem("cafe_reservations");
		const storedOrders = localStorage.getItem("cafe_orders");

		if (storedRes) {
			try {
				setReservations(JSON.parse(storedRes));
			} catch (e) {
				console.error("Error parsing reservations in admin", e);
			}
		}
		if (storedOrders) {
			try {
				setOrders(JSON.parse(storedOrders));
			} catch (e) {
				console.error("Error parsing orders in admin", e);
			}
		}
	};

	useEffect(() => {
		// Update dynamically when customer places or cancels orders in another component
		const handleUpdate = () => {
			loadDatabase();
		};

		window.addEventListener("orders-updated", handleUpdate);
		window.addEventListener("storage", handleUpdate); // For multi-tab sync

		return () => {
			window.removeEventListener("orders-updated", handleUpdate);
			window.removeEventListener("storage", handleUpdate);
		};
	}, []);

	// Dismiss toast
	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 4000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	// End Reservation (إنهاء حجز الغرفة) - Settle and Checkout Table
	const handleCheckoutRoom = (res: Reservation, totalBill: number) => {
		// Remove reservation from list
		const updatedRes = reservations.filter((r) => r.id !== res.id);
		// Remove orders belonging to this reservation
		const updatedOrders = orders.filter((o) => o.reservation_id !== res.id);

		// Save updated states to localStorage
		localStorage.setItem("cafe_reservations", JSON.stringify(updatedRes));
		localStorage.setItem("cafe_orders", JSON.stringify(updatedOrders));

		setReservations(updatedRes);
		setOrders(updatedOrders);

		setToast({
			text: isRtl
				? `تم تصفية حساب العميل (${res.client_name}) بقيمة ${totalBill.toLocaleString("en-US")} د.ع وإنهاء حجز الغرفة بنجاح!`
				: `Successfully settled client (${res.client_name})'s bill of ${totalBill.toLocaleString("en-US")} IQD and checked out room!`,
		});

		// Trigger event to sync any active customer pages
		window.dispatchEvent(new CustomEvent("orders-updated"));
	};

	// Aggregated Global operational metrics
	const totalRevenue = orders.reduce(
		(sum, o) => sum + o.item_price * o.quantity,
		0,
	);
	const activeRoomsCount = reservations.length;
	const totalSoldItems = orders.reduce((sum, o) => sum + o.quantity, 0);

	// Filter reservations based on search query
	const filteredReservations = reservations.filter(
		(r) =>
			r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			r.room_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			r.number.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			{/* Admin Header with Section Details */}
			<AdminHeader
				title={
					isRtl
						? "لوحة تصفية حسابات طاولات الزبائن"
						: "Client Table Checkout & Bills"
				}
				subtitle={
					isRtl
						? "متابعة وتدقيق مجموع قيم طلبات الطاولات النشطة وإجراء إنهاء الحجوزات بعد تصفية الحساب"
						: "Monitor and audit active table order aggregates and perform checkouts after settling bills"
				}
			/>

			{/* Operational Metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<MetricCard
					title={
						isRtl
							? "إجمالي قيمة فواتير الزبائن الحالية"
							: "Active Cumulative Bills Value"
					}
					value={`${totalRevenue.toLocaleString("en-US")} ${isRtl ? "د.ع" : "IQD"}`}
					highlight
					icon={
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
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					}
				/>
				<MetricCard
					title={
						isRtl
							? "عدد الغرف والطاولات النشطة"
							: "Active Occupied Rooms"
					}
					value={`${activeRoomsCount} ${isRtl ? "طاولات وغرف" : "Rooms/Tables"}`}
					icon={
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
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					}
				/>
				<MetricCard
					title={
						isRtl
							? "إجمالي مبيعات المأكولات والمشروبات"
							: "Total Active Ordered Units"
					}
					value={`${totalSoldItems} ${isRtl ? "وحدات" : "Units"}`}
					icon={
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
								d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
							/>
						</svg>
					}
				/>
			</div>

			{/* Search field bar */}
			<div className="flex justify-between items-center bg-[#131522] rounded-3xl p-4 border border-white/10 shadow-md">
				<SearchInput
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={
						isRtl
							? "البحث باسم العميل أو الغرفة/الطاولة..."
							: "Search customer or table..."
					}
				/>
				<span className="text-xs text-zinc-400 font-bold hidden sm:inline">
					{isRtl ? "النتائج المطابقة:" : "Matching Bookings:"}{" "}
					{filteredReservations.length}
				</span>
			</div>

			{/* Interactive Grouped Bookings & Checkouts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{filteredReservations.length > 0 ? (
					filteredReservations.map((res) => {
						const resOrders = orders.filter(
							(o) => o.reservation_id === res.id,
						);
						const totalBill = resOrders.reduce(
							(sum, o) => sum + o.item_price * o.quantity,
							0,
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
											{res.number}
										</span>
										<h3 className="text-base font-black text-white mt-2 group-hover:text-amber-300 transition-colors">
											{res.client_name}
										</h3>
										<p className="text-xs text-zinc-400 font-bold mt-1">
											{res.room_name}
										</p>
									</div>

									{/* Total Bill Value highlight */}
									<div className="text-right">
										<span className="text-[10px] text-zinc-400 font-black tracking-wider block uppercase">
											{isRtl
												? "مجموع قيمة الفاتورة"
												: "Accumulated Total"}
										</span>
										<span className="text-lg font-black text-amber-400 block mt-1">
											{totalBill.toLocaleString("en-US")}{" "}
											{isRtl ? "د.ع" : "IQD"}
										</span>
									</div>
								</div>

								{/* Ordered list */}
								<div className="flex-1 space-y-3">
									<h4 className="text-xs font-black text-zinc-400 tracking-wide">
										{isRtl
											? "الأصناف والمشروبات المطلوبة على الطاولة:"
											: "Ordered Items:"}
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
															{o.item_name}
														</p>
														<p className="text-[10px] text-zinc-400 font-medium mt-0.5">
															{isRtl
																? "الكمية:"
																: "Qty:"}{" "}
															<span className="font-bold text-white">
																{o.quantity}
															</span>{" "}
															×{" "}
															{o.item_price.toLocaleString(
																"en-US",
															)}{" "}
															{isRtl
																? "د.ع"
																: "IQD"}
														</p>
													</div>
													<span className="font-black text-zinc-300">
														{(
															o.item_price *
															o.quantity
														).toLocaleString(
															"en-US",
														)}{" "}
														{isRtl ? "د.ع" : "IQD"}
													</span>
												</div>
											))
										) : (
											<div className="py-6 text-center text-zinc-600 font-bold text-xs italic">
												{isRtl
													? "لا توجد طلبات مسجلة على هذه الطاولة بعد"
													: "No orders registered yet"}
											</div>
										)}
									</div>
								</div>

								{/* Operational Actions */}
								<div className="pt-4 border-t border-white/5">
									<button
										onClick={() =>
											handleCheckoutRoom(res, totalBill)
										}
										className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
									>
										{/* Lock icon representing room checkout */}
										<svg
											className="w-4 h-4 shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2.5"
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
										<span>
											{isRtl
												? "إنهاء حجز الغرفة وتصفية الفاتورة"
												: "End Room Reservation & Settle"}
										</span>
									</button>
								</div>
							</div>
						);
					})
				) : (
					<div className="col-span-full py-16 text-center rounded-[28px] border border-white/5 bg-[#131522]/40 text-zinc-500 font-medium text-xs">
						{isRtl
							? "لا توجد حجوزات نشطة تطابق معايير البحث حالياً"
							: "No active reservations matching search criteria"}
					</div>
				)}
			</div>

			{/* Elegant Toast notifications */}
			{toast && (
				<div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:max-w-md z-50 animate-bounce">
					<div className="rounded-2xl border border-amber-500/30 bg-[#1a1c2c]/95 backdrop-blur-xl px-5 py-4 shadow-2xl flex items-center justify-between gap-4 text-amber-300">
						<div className="flex items-center gap-3">
							<span className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-xs">
								✓
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
