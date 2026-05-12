"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import FormToggle from "@/components/FormToggle";
import { useLanguage } from "@/config/i18n";

/**
 * Admin Settings Page.
 * Manages configuration variables such as store settings, currency representation,
 * operating hours, real-time alert toggles, and system-wide parameter configurations.
 * Formatted in high-contrast Material You dark-mode, completely bilingual.
 */
export default function SettingsAdmin() {
	const { t, isRtl } = useLanguage();

	// Store configurations state
	const [cafeName, setCafeName] = useState("مقهى الخدمات الفاخر");
	const [contactPhone, setContactPhone] = useState("0554321098");
	const [currency, setCurrency] = useState(isRtl ? "دينار عراقي (IQD)" : "Iraqi Dinar (IQD)");

	// Operational parameters
	const [openHour, setOpenHour] = useState("07:00");
	const [closeHour, setCloseHour] = useState("23:30");
	const [enableReservations, setEnableReservations] = useState(true);

	// Live alert parameters
	const [enableAudioChime, setEnableAudioChime] = useState(true);
	const [ssePingInterval, setSsePingInterval] = useState("20");

	const [isSaved, setIsSaved] = useState(false);

	const handleSaveAll = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaved(true);
		setTimeout(() => setIsSaved(false), 4000);
	};

	return (
		<div className="space-y-6 max-w-4xl" dir={isRtl ? "rtl" : "ltr"}>
			{/* Top Header */}
			<AdminHeader
				title={t("settings.title")}
				subtitle={t("settings.subtitle")}
			/>

			{/* Form Container */}
			<form onSubmit={handleSaveAll} className="space-y-6">
				{/* 1. General Identity Settings */}
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-4">
					<div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
						<div className="text-amber-400">
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
									strokeWidth="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<h2 className="text-sm font-black text-white">
							{isRtl ? "إعدادات الهوية والعلامة التجارية" : "Identity & Branding Settings"}
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Store Name */}
						<div className="space-y-1.5">
							<label
								htmlFor="cName"
								className="text-xs font-bold text-zinc-400 block"
							>
								{isRtl ? "اسم المقهى التجاري" : "Cafe Name"}
							</label>
							<input
								id="cName"
								type="text"
								value={cafeName}
								onChange={(e) => setCafeName(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								required
							/>
						</div>

						{/* Phone Number */}
						<div className="space-y-1.5">
							<label
								htmlFor="cPhone"
								className="text-xs font-bold text-zinc-400 block"
							>
								{isRtl ? "رقم الهاتف والتواصل" : "Contact Phone Number"}
							</label>
							<input
								id="cPhone"
								type="text"
								value={contactPhone}
								onChange={(e) => setContactPhone(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								required
							/>
						</div>

						{/* Default Currency */}
						<div className="space-y-1.5">
							<label
								htmlFor="cCurrency"
								className="text-xs font-bold text-zinc-400 block"
							>
								{isRtl ? "العملة الافتراضية المعتمدة" : "Default Certified Currency"}
							</label>
							<input
								id="cCurrency"
								type="text"
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								required
							/>
						</div>
					</div>
				</div>

				{/* 2. Operations & Reservations Settings */}
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-4">
					<div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
						<div className="text-amber-400">
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
									strokeWidth="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-sm font-black text-white">
							{isRtl ? "إعدادات العمل والتشغيل" : "Operational Settings"}
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Open Hour */}
						<div className="space-y-1.5">
							<label
								htmlFor="oHour"
								className="text-xs font-bold text-zinc-400 block"
							>
								{isRtl ? "ساعة بدء الاستقبال والعمل" : "Opening Hours"}
							</label>
							<input
								id="oHour"
								type="time"
								value={openHour}
								onChange={(e) => setOpenHour(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								required
							/>
						</div>

						{/* Close Hour */}
						<div className="space-y-1.5">
							<label
								htmlFor="cHour"
								className="text-xs font-bold text-zinc-400 block"
							>
								{isRtl ? "ساعة إغلاق الصالة والمنصة" : "Closing Hours"}
							</label>
							<input
								id="cHour"
								type="time"
								value={closeHour}
								onChange={(e) => setCloseHour(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								required
							/>
						</div>
					</div>

					{/* Toggle live reservations */}
					<FormToggle
						checked={enableReservations}
						onChange={setEnableReservations}
						label={isRtl ? "تفعيل نظام حجز الطاولات المباشر" : "Enable Live Table Booking"}
						description={isRtl ? "يسمح لعملاء الموقع المفتوح برؤية الطاولات الشاغرة وحجزها حياً." : "Enables customers to view and dynamically book empty tables."}
					/>
				</div>

				{/* 3. Real-time Streams & Alerts Parameters */}
				<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-4">
					<div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
						<div className="text-amber-400">
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
									strokeWidth="2"
									d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
								/>
							</svg>
						</div>
						<h2 className="text-sm font-black text-white">
							{isRtl ? "إعدادات الإشعارات وبث الأحداث الفورية (SSE)" : "Live Events & Notifications Settings (SSE)"}
						</h2>
					</div>

					{/* Audio Chime toggles */}
					<FormToggle
						checked={enableAudioChime}
						onChange={setEnableAudioChime}
						label={isRtl ? "تفعيل النغمات والمنبهات الصوتية للحساب الإداري" : "Enable Sound Signals for Admin Console"}
						description={isRtl ? "توليد نغمات موسيقية متناسقة برمجياً عبر الـ Web Audio API فور وصول طلب أو إشعار جديد." : "Synthesize premium alerts natively using the Web Audio API."}
					/>

					{/* SSE Stream Ping Interval */}
					<div className="space-y-1.5">
						<div className="flex justify-between items-center">
							<label
								htmlFor="pingInt"
								className="text-xs font-bold text-zinc-400"
							>
								{isRtl ? "الفاصل الزمني لإرسال نبضات الاتصال (SSE Ping Interval)" : "SSE Keep-Alive Ping Interval"}
							</label>
							<span className="text-xs text-amber-400 font-black">
								{ssePingInterval} {isRtl ? "ثانية" : "seconds"}
							</span>
						</div>
						<input
							id="pingInt"
							type="range"
							min="10"
							max="60"
							step="5"
							value={ssePingInterval}
							onChange={(e) => setSsePingInterval(e.target.value)}
							className="w-full accent-amber-500 bg-[#07080a] h-1.5 rounded-lg appearance-none cursor-pointer"
						/>
						<span className="text-[10px] text-zinc-500 font-bold block mt-0.5">
							{isRtl ? "عدد الثواني الفاصلة لحماية البث من الانقطاع المفاجئ من قِبل جدران الحماية وخوادم AWS/Cloudflare." : "Seconds between background pings to prevent system-wide SSE connection dropouts."}
						</span>
					</div>
				</div>

				{/* Save button and alerts */}
				<div className="flex items-center justify-between">
					{isSaved ? (
						<div className="px-4 py-2 rounded-2xl bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-extrabold animate-fade-in flex items-center gap-1.5">
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
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{isRtl ? "تم حفظ وتحديث الإعدادات بنجاح تـام!" : "All platform settings successfully saved!"}</span>
						</div>
					) : (
						<div />
					)}
					<button
						type="submit"
						className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10"
					>
						{isRtl ? "حفظ كافة الإعدادات" : "Save All Configuration"}
					</button>
				</div>
			</form>
		</div>
	);
}
