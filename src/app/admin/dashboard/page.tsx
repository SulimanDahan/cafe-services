"use client";

import { useState } from "react";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import MetricCard from "@/components/MetricCard";
import { ADMIN_ROUTES } from "@/config/routes";

interface Reservation {
	id: string;
	number: number;
	clientName: string;
	phone: string;
	roomName: string;
	dateTime: string;
	accepted: boolean;
	itemsCount: number;
	totalPrice: number;
}

/**
 * Premium Admin Dashboard Component.
 * Fully styled according to high-contrast Material You Dark Spec (GEMINI.md).
 * Uses pure SVG icons and contains absolutely NO emojis, as requested.
 */
export default function AdminDashboard() {
	// Pre-populated realistic cafe mock data (NO emojis)
	const [reservations, setReservations] = useState<Reservation[]>([
		{
			id: "res-1",
			number: 1024,
			clientName: "أحمد بن عبد الله",
			phone: "0501234567",
			roomName: "القاعة الرئيسية - طاولة 5",
			dateTime: "12 مايو 2026 - 08:30 م",
			accepted: true,
			itemsCount: 3,
			totalPrice: 85.50,
		},
		{
			id: "res-2",
			number: 1025,
			clientName: "سليمان الدهان",
			phone: "0559876543",
			roomName: "قاعة VIP المغلقة",
			dateTime: "12 مايو 2026 - 09:15 م",
			accepted: false,
			itemsCount: 5,
			totalPrice: 180.00,
		},
		{
			id: "res-3",
			number: 1026,
			clientName: "سارة عبد الرحمن",
			phone: "0543332211",
			roomName: "الشرفة الخارجية - طاولة 12",
			dateTime: "13 مايو 2026 - 06:00 م",
			accepted: false,
			itemsCount: 2,
			totalPrice: 42.00,
		},
		{
			id: "res-4",
			number: 1027,
			clientName: "فيصل الحربي",
			phone: "0561112223",
			roomName: "القاعة الرئيسية - طاولة 2",
			dateTime: "13 مايو 2026 - 07:45 م",
			accepted: true,
			itemsCount: 4,
			totalPrice: 110.00,
		},
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed">("all");
	const [isAdding, setIsAdding] = useState(false);
	
	// Form state for adding simulated reservation
	const [newClientName, setNewClientName] = useState("");
	const [newPhone, setNewPhone] = useState("");
	const [newRoom, setNewRoom] = useState("القاعة الرئيسية - طاولة 1");
	const [newPrice, setNewPrice] = useState("");

	// Actions
	const handleAccept = (id: string) => {
		setReservations(prev =>
			prev.map(res => (res.id === id ? { ...res, accepted: true } : res))
		);
	};

	const handleDelete = (id: string) => {
		setReservations(prev => prev.filter(res => res.id !== id));
	};

	const handleAddReservation = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newClientName || !newPhone) return;

		const newRes: Reservation = {
			id: `res-${Date.now()}`,
			number: reservations.length > 0 ? Math.max(...reservations.map(r => r.number)) + 1 : 1001,
			clientName: newClientName,
			phone: newPhone,
			roomName: newRoom,
			dateTime: "الآن (محاكاة)",
			accepted: false,
			itemsCount: 1,
			totalPrice: parseFloat(newPrice) || 30.00,
		};

		setReservations([newRes, ...reservations]);
		setNewClientName("");
		setNewPhone("");
		setNewPrice("");
		setIsAdding(false);
	};

	// Computations for premium metric cards
	const totalRevenue = reservations
		.filter(r => r.accepted)
		.reduce((sum, r) => sum + r.totalPrice, 0);

	const pendingCount = reservations.filter(r => !r.accepted).length;
	const confirmedCount = reservations.filter(r => r.accepted).length;

	// Filter & Search
	const filteredReservations = reservations.filter(res => {
		const matchesSearch =
			res.clientName.includes(searchQuery) || res.phone.includes(searchQuery);

		if (activeTab === "pending") return matchesSearch && !res.accepted;
		if (activeTab === "confirmed") return matchesSearch && res.accepted;
		return matchesSearch;
	});

	return (
		<div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black pb-12 relative overflow-hidden">
			{/* Ambient Glowing Background Graphics */}
			<div className="absolute top-0 right-1/4 w-125 h-125 rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
			<div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

			{/* Top Bar Navigation */}
			<header className="sticky top-4 z-40 max-w-7xl w-[calc(100%-2rem)] mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300 mt-4">
				<div className="px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-md">
							C
						</div>
						<span className="text-lg font-black tracking-wide text-white">
							لوحة التحكم لخدمات المقهى
						</span>
					</div>

					<div className="flex items-center gap-4">
						<div className="hidden sm:flex flex-col items-end text-left">
							<span className="text-xs font-black text-white">مدير النظام</span>
							<span className="text-[10px] text-amber-400 font-medium flex items-center gap-1.5">
								<span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
								متصل بشكل آمن
							</span>
						</div>
						
						{/* Logout Button (No emojis, using SVG) */}
						<Link
							href={ADMIN_ROUTES.login}
							className="px-4 py-2 rounded-full bg-[#131522] border border-white/10 hover:border-amber-500/40 text-xs font-bold text-zinc-300 hover:text-amber-300 transition-all duration-300 flex items-center gap-2"
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
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							<span>خروج</span>
						</Link>
					</div>
				</div>
			</header>

			{/* Main Grid Content */}
			<main className="max-w-7xl w-full mx-auto px-6 mt-10 flex flex-col gap-8 relative z-10">
				
				{/* Welcome Hero Panel */}
				<div className="rounded-[28px] border border-white/10 bg-linear-to-br from-amber-500/10 via-[#131522]/30 to-transparent p-6 sm:p-8 shadow-xl">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
								لوحة الإدارة والمراقبة الفورية
							</span>
							<h1 className="text-2xl sm:text-3xl font-black mt-4 tracking-tight text-white">
								مرحباً بك مجدداً في لوحة التحكم
							</h1>
							<p className="text-zinc-400 text-xs sm:text-sm mt-1 font-medium">
								راقب حجوزات الطاولات والغرف، وتحقق من الطلبات المفعلة لحظياً.
							</p>
						</div>

						{/* Action to toggle simulate reservation dialog */}
						<button
							onClick={() => setIsAdding(!isAdding)}
							className="px-5 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
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
							<span>إضافة حجز جديد</span>
						</button>
					</div>
				</div>

				{/* Collapsible New Reservation Simulation Form (NO emojis, Clean layouts) */}
				{isAdding && (
					<div className="rounded-[28px] border border-amber-500/30 bg-[#131522]/90 backdrop-blur-xl p-6 shadow-xl animate-fadeIn">
						<h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
							<span className="w-1.5 h-6 bg-amber-500 rounded-full" />
							محاكاة إضافة حجز جديد لقاعدة البيانات
						</h3>
						<form onSubmit={handleAddReservation} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
							<div className="space-y-1.5">
								<label className="text-[10px] font-bold text-zinc-400 mr-1">اسم العميل</label>
								<input
									type="text"
									required
									value={newClientName}
									onChange={e => setNewClientName(e.target.value)}
									placeholder="اسم العميل الكامل"
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-[10px] font-bold text-zinc-400 mr-1">رقم الهاتف</label>
								<input
									type="text"
									required
									value={newPhone}
									onChange={e => setNewPhone(e.target.value)}
									placeholder="05xxxxxxxx"
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="text-[10px] font-bold text-zinc-400 mr-1">الموقع / الطاولة</label>
								<select
									value={newRoom}
									onChange={e => setNewRoom(e.target.value)}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
								>
									<option value="القاعة الرئيسية - طاولة 1">القاعة الرئيسية - طاولة 1</option>
									<option value="القاعة الرئيسية - طاولة 5">القاعة الرئيسية - طاولة 5</option>
									<option value="قاعة VIP المغلقة">قاعة VIP المغلقة</option>
									<option value="الشرفة الخارجية - طاولة 12">الشرفة الخارجية - طاولة 12</option>
								</select>
							</div>

							<div className="space-y-1.5">
								<label className="text-[10px] font-bold text-zinc-400 mr-1">إجمالي الحساب (ريال)</label>
								<div className="flex gap-2">
									<input
										type="number"
										value={newPrice}
										onChange={e => setNewPrice(e.target.value)}
										placeholder="30"
										className="w-full bg-[#07080a] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
									/>
									<button
										type="submit"
										className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#07080a] font-bold rounded-xl text-xs shrink-0 transition-all duration-200"
									>
										حفظ
									</button>
								</div>
							</div>
						</form>
					</div>
				)}

				{/* 4 Premium High-Contrast Metrics Cards (Material 3 Spec) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<MetricCard
						title="إجمالي الحجوزات"
						value={reservations.length}
						icon={
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						}
					/>
					<MetricCard
						title="بانتظار التأكيد"
						value={pendingCount}
						highlight={pendingCount > 0}
						icon={
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
					/>
					<MetricCard
						title="الحجوزات المؤكدة"
						value={confirmedCount}
						icon={
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
					/>
					<MetricCard
						title="المدخول التقريبي (المؤكد)"
						value={`${totalRevenue.toFixed(2)} ر.س`}
						highlight
						icon={
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
					/>
				</div>

				{/* Main Tables Container with Filters & Search */}
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md">
					
					{/* Header actions of the list */}
					<div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
						
						{/* Tabs selection (No emojis) */}
						<div className="flex gap-2 bg-[#07080a] p-1 rounded-full border border-white/10 self-start">
							<button
								onClick={() => setActiveTab("all")}
								className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeTab === "all" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
							>
								الكل
							</button>
							<button
								onClick={() => setActiveTab("pending")}
								className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeTab === "pending" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
							>
								قيد المراجعة ({pendingCount})
							</button>
							<button
								onClick={() => setActiveTab("confirmed")}
								className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeTab === "confirmed" ? "bg-amber-500 text-[#07080a]" : "text-zinc-400 hover:text-white"}`}
							>
								المؤكدة ({confirmedCount})
							</button>
						</div>

						{/* Search Input */}
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="البحث باسم العميل أو رقم الهاتف..."
							className="max-w-sm w-full"
						/>
					</div>

					{/* Responsive Layout Table */}
					<div className="overflow-x-auto overflow-y-auto max-h-75 lg:max-h-[calc(100vh-520px)]">
						<table className="min-w-212.5 w-full border-collapse text-right text-sm">
							<thead>
								<tr className="border-b border-white/10 text-zinc-400 text-xs font-black">
									<th className="pb-3 px-4 text-right whitespace-nowrap">رقم الحجز</th>
									<th className="pb-3 px-4 text-right whitespace-nowrap">العميل</th>
									<th className="pb-3 px-4 text-right whitespace-nowrap">الموقع</th>
									<th className="pb-3 px-4 text-right whitespace-nowrap">التاريخ والوقت</th>
									<th className="pb-3 px-4 text-right whitespace-nowrap">إجمالي الحساب</th>
									<th className="pb-3 px-4 text-center whitespace-nowrap">الحالة</th>
									<th className="pb-3 px-4 text-center whitespace-nowrap">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5">
								{filteredReservations.length > 0 ? (
									filteredReservations.map(res => (
										<tr
											key={res.id}
											className="group hover:bg-[#1a1c2c]/40 transition-all duration-200"
										>
											<td className="py-4 px-4 font-black text-xs text-zinc-500 whitespace-nowrap">
												#{res.number}
											</td>
											<td className="py-4 px-4 whitespace-nowrap">
												<div className="flex flex-col">
													<span className="font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
														{res.clientName}
													</span>
													<span className="text-[10px] text-zinc-500 font-bold mt-0.5">
														{res.phone}
													</span>
												</div>
											</td>
											<td className="py-4 px-4 font-semibold text-zinc-300 text-xs whitespace-nowrap">
												{res.roomName}
											</td>
											<td className="py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap">
												{res.dateTime}
											</td>
											<td className="py-4 px-4 font-black text-amber-400 text-xs whitespace-nowrap">
												{res.totalPrice.toFixed(2)} ريال
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<span
													className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
														res.accepted
															? "bg-green-500/10 text-green-400 border-green-500/20"
															: "bg-amber-500/10 text-amber-300 border-amber-500/25"
													}`}
												>
													<span
														className={`w-1.5 h-1.5 rounded-full ${
															res.accepted
																? "bg-green-400"
																: "bg-amber-400 animate-pulse"
														}`}
													/>
													{res.accepted ? "مؤكد ومقبول" : "قيد الانتظار"}
												</span>
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<div className="flex justify-center items-center gap-2">
													{!res.accepted && (
														<button
															onClick={() => handleAccept(res.id)}
															className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200"
															title="قبول وتأكيد الحجز"
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
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														</button>
													)}
													<button
														onClick={() => handleDelete(res.id)}
														className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
														title="إلغاء وحذف الحجز"
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
											colSpan={7}
											className="py-12 text-center text-zinc-500 font-medium text-xs"
										>
											لا توجد حجوزات تطابق خيارات التصفية الحالية.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
}
