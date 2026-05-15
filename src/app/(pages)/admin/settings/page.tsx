"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { useLanguage } from "@/config/i18n";

/**
 * Admin Settings Page.
 * Manages configuration variables mapped directly to the Prisma Settings schema:
 * currency_name, notification_threshold, app_lang, and per_page.
 * Formatted in high-contrast Material You dark-mode, completely bilingual.
 */
export default function SettingsAdmin() {
	const { t, isRtl, locale, setLocale } = useLanguage();

	// Prisma Settings Schema States
	const [currencyName, setCurrencyName] = useState("yemeniRial");
	const [appLang, setAppLang] = useState(locale);
	const [perPage, setPerPage] = useState(25);
	const [notificationThreshold, setNotificationThreshold] = useState(100);

	const [isSaved, setIsSaved] = useState(false);

	const handleSaveAll = (e: React.FormEvent) => {
		e.preventDefault();
		if (appLang === "ar" || appLang === "en") {
			setLocale(appLang);
		}
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
				{/* 1. System & Localization Settings (currency_name, app_lang, per_page) */}
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
							{t("settings.sectionIdentity")}
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Default Currency (currency_name) */}
						<div className="space-y-1.5">
							<label
								htmlFor="cCurrency"
								className="text-xs font-bold text-zinc-400 block"
							>
								{t("settings.inputDefaultCurrency")}
							</label>
							<select
								id="cCurrency"
								value={currencyName}
								onChange={(e) => setCurrencyName(e.target.value)}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block cursor-pointer"
							>
								<option value="yemeniRial">{t("common.yemeniRial")}</option>
								<option value="IQD">دينار عراقي (IQD)</option>
								<option value="USD">دولار أمريكي (USD)</option>
								<option value="EUR">يورو (EUR)</option>
								<option value="SAR">ريال سعودي (SAR)</option>
								<option value="AED">درهم إماراتي (AED)</option>
							</select>
							<span className="text-[10px] text-zinc-500 font-bold block mt-1">
								{t("settings.inputDefaultCurrencyDesc")}
							</span>
						</div>

						{/* Application Language (app_lang) */}
						<div className="space-y-1.5">
							<label
								htmlFor="appLangSel"
								className="text-xs font-bold text-zinc-400 block"
							>
								{t("settings.appLangLabel")}
							</label>
							<select
								id="appLangSel"
								value={appLang}
								onChange={(e) => setAppLang(e.target.value as "ar" | "en")}
								className="w-full bg-[#07080a] border border-white/10 text-amber-300 font-bold rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block cursor-pointer"
							>
								<option value="ar">العربية (Arabic)</option>
								<option value="en">English (الإنجليزية)</option>
							</select>
							<span className="text-[10px] text-zinc-500 font-bold block mt-1">
								{t("settings.appLangDesc")}
							</span>
						</div>

						{/* Items Per Page (per_page) */}
						<div className="space-y-1.5">
							<label
								htmlFor="perPageSel"
								className="text-xs font-bold text-zinc-400 block"
							>
								{t("settings.perPageLabel")}
							</label>
							<select
								id="perPageSel"
								value={perPage}
								onChange={(e) => setPerPage(Number(e.target.value))}
								className="w-full bg-[#07080a] border border-white/10 text-white font-bold rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block cursor-pointer"
							>
								<option value="10">10</option>
								<option value="25">25</option>
								<option value="50">50</option>
								<option value="100">100</option>
							</select>
							<span className="text-[10px] text-zinc-500 font-bold block mt-1">
								{t("settings.perPageDesc")}
							</span>
						</div>
					</div>
				</div>

				{/* 2. Notifications & Priority Threshold Settings (notification_threshold) */}
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
							{t("settings.sectionNotifications")}
						</h2>
					</div>

					{/* High Priority Billing Threshold (notification_threshold) */}
					<div className="space-y-1.5">
						<label
							htmlFor="nThresh"
							className="text-xs font-bold text-zinc-400 block"
						>
							{t("settings.inputThreshold")}
						</label>
						<div className="relative flex items-center">
							<input
								id="nThresh"
								type="number"
								min="0"
								step="10"
								value={notificationThreshold}
								onChange={(e) => setNotificationThreshold(Number(e.target.value))}
								className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all block"
								required
							/>
							<span className={`absolute ${isRtl ? "left-4" : "right-4"} text-xs font-black text-amber-400 pointer-events-none`}>
								{currencyName === "yemeniRial" ? t("common.yemeniRial") : currencyName}
							</span>
						</div>
						<span className="text-[10px] text-zinc-500 font-bold block mt-1">
							{t("settings.inputThresholdDesc")}
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
							<span>{t("settings.msgSaved")}</span>
						</div>
					) : (
						<div />
					)}
					<button
						type="submit"
						className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10"
					>
						{t("settings.btnSaveAll")}
					</button>
				</div>
			</form>
		</div>
	);
}
