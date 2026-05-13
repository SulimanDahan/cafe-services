"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/config/i18n";

/**
 * Redesigned Premium Cafe Services Landing Page Component.
 * Styled in high-contrast Material You Dark Spec (GEMINI.md) using Cairo font.
 * Supports native RTL layouts, glassmorphism elements, and uses clean SVGs with zero emojis.
 */
export default function Home() {
	const { t, isRtl, locale, setLocale } = useLanguage();
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);

	// Arabic-localized unified service cards themed around the Amber key color
	const services = [
		{
			id: "s1",
			name: t("home.service1Name"),
			desc: t("home.service1Desc"),
			price: t("home.service1Price"),
			status: t("home.statusActive"),
			rating: "4.9",
			iconSvg: (
				<svg
					className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M18 8H6a2 2 0 00-2 2v6a4 4 0 004 4h8a4 4 0 004-4v-6a2 2 0 00-2-2z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M22 10a2 2 0 01-2 2h-2V8h2a2 2 0 012 2z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M6 2v2M10 2v2M14 2v2"
					/>
				</svg>
			),
		},
		{
			id: "s2",
			name: t("home.service2Name"),
			desc: t("home.service2Desc"),
			price: t("home.service2Price"),
			status: t("home.statusActive"),
			rating: "5.0",
			iconSvg: (
				<svg
					className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
					/>
				</svg>
			),
		},
		{
			id: "s3",
			name: t("home.service3Name"),
			desc: t("home.service3Desc"),
			price: t("home.service3Price"),
			status: t("home.statusActive"),
			rating: "4.8",
			iconSvg: (
				<svg
					className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M12 8V4H8M4 20h16a1 1 0 001-1v-1a5 5 0 00-5-5H8a5 5 0 00-5 5v1a1 1 0 001 1z"
					/>
				</svg>
			),
		},
		{
			id: "s4",
			name: t("home.service4Name"),
			desc: t("home.service4Desc"),
			price: t("home.service4Price"),
			status: t("home.statusScheduled"),
			rating: "5.0",
			iconSvg: (
				<svg
					className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
					/>
				</svg>
			),
		},
	];

	return (
		<div
			className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden"
			dir={isRtl ? "rtl" : "ltr"}
		>
			{/* High-Contrast Glassmorphic AppBar */}
			<header className="sticky top-4 z-40 max-w-7xl w-[calc(100%-2rem)] mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
				<div className="px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-6">
						{/* High-contrast amber logo container (Geometric - NO emoji) */}
						<div className="h-9.5 w-9.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-lg">
							<svg
								className="w-5.5 h-5.5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3"
								/>
							</svg>
						</div>
						<span className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white whitespace-nowrap hidden sm:inline">
							{t("home.title")}
						</span>

						{/* Customer Navigation menu */}
						<nav className="flex items-center gap-1 sm:gap-2">
							<Link
								href="/"
								className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-md active:scale-95"
							>
								{t("home.navHome")}
							</Link>
							<Link
								href="/order"
								className="px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
							>
								{t("home.navOrder")}
							</Link>
						</nav>
					</div>

					{/* Language Switch */}
					<div className="flex items-center gap-3">
						{/* Modern Language Toggler */}
						<button
							onClick={() =>
								setLocale(locale === "ar" ? "en" : "ar")
							}
							className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30 text-xs font-black text-zinc-200 transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
						>
							<svg
								className="w-4 h-4 text-amber-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.2"
									d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a3 3 0 013 3V16.5m-1.5-12.1a9 9 0 012.3 12.3"
								/>
							</svg>
							<span className="hidden sm:inline">
								{locale === "ar" ? "English" : "العربية"}
							</span>
							<span className="sm:hidden font-extrabold uppercase">
								{locale === "ar" ? "EN" : "AR"}
							</span>
						</button>
					</div>
				</div>
			</header>

			{/* Main Content Layout */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 flex flex-col gap-10">
				{/* High-Contrast Hero Panel (Grid style to adjust proportions beautifully) */}
				<div className="relative rounded-[28px] overflow-hidden border border-white/10 bg-[#131522]/40 p-6 sm:p-10 md:p-14 shadow-2xl">
					{/* Ambient Color Glows */}
					<div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
					<div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-600/5 blur-[130px] pointer-events-none" />

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
						{/* Left Text Block */}
						<div className="lg:col-span-7 space-y-6">
							{/* Vibrant High-contrast Pill Badge */}
							<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-md">
								<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
								{t("home.heroBadge")}
							</span>

							<h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
								{t("home.heroTitle")}
							</h1>
							<p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
								{t("home.heroDesc")}
							</p>

							{/* Stack Tags */}
							<div className="pt-2 flex flex-wrap gap-3">
								<div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0f17] border border-white/10 text-xs font-bold text-zinc-300 shadow-lg">
									<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
									{t("home.tagDocker")}
								</div>
								<div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0f17] border border-white/10 text-xs font-bold text-zinc-300 shadow-lg">
									<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
									{t("home.tagSse")}
								</div>
							</div>
						</div>

						{/* Right Visual Dashboard Panel */}
						<div className="lg:col-span-5 w-full">
							<div className="rounded-3xl border border-white/15 bg-[#0d0f17]/90 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />

								<div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
									<div className="flex items-center gap-2">
										<div className="w-2.5 h-2.5 rounded-full bg-red-500" />
										<div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
										<div className="w-2.5 h-2.5 rounded-full bg-green-500" />
									</div>
									<span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
										{t("home.liveChannelsTitle")}
									</span>
								</div>

								<div className="space-y-3">
									<div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="flex h-7 w-7 rounded-lg bg-green-500/10 text-green-400 border border-green-500/25 items-center justify-center font-extrabold text-xs">
												✓
											</span>
											<div>
												<p className="text-xs font-bold text-white">
													{t("home.simOrderTitle")}
												</p>
												<p className="text-[10px] text-zinc-400 font-medium">
													{t("home.simOrderSub")}
												</p>
											</div>
										</div>
										<span className="text-[9px] text-zinc-500 font-bold">
											{t("home.simOrderTime")}
										</span>
									</div>

									<div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="flex h-7 w-7 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 items-center justify-center font-extrabold text-xs">
												!
											</span>
											<div>
												<p className="text-xs font-bold text-white">
													{t("home.simStockTitle")}
												</p>
												<p className="text-[10px] text-zinc-400 font-medium">
													{t("home.simStockSub")}
												</p>
											</div>
										</div>
										<span className="text-[9px] text-zinc-500 font-bold">
											{t("home.simStockTime")}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* SSE Alert Guidelines Banner */}
				<div className="p-6 rounded-3xl bg-[#131522] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl transition-all duration-300 hover:border-amber-500/30">
					<div className="flex items-start gap-4">
						<div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
							<svg
								className="w-6 h-6 text-amber-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="space-y-1">
							<h4 className="font-extrabold text-sm text-white tracking-wide">
								{t("home.guideTitle")}
							</h4>
							<p className="text-xs text-zinc-300 font-medium leading-relaxed">
								{t("home.guideDesc")}
							</p>
						</div>
					</div>
				</div>

				{/* Services Grid (Beautiful high-contrast card system with rich padding) */}
				<div className="flex flex-col gap-6">
					<div className="flex items-center justify-between px-1">
						<h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
							{t("home.sectionTitle")}
						</h2>
						<span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider hidden sm:inline">
							{t("home.cateringSubtitle")}
						</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{services.map((service) => (
							<div
								key={service.id}
								onMouseEnter={() => setHoveredCard(service.id)}
								onMouseLeave={() => setHoveredCard(null)}
								className={`group relative rounded-[28px] border bg-[#131522] p-6.5 transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between ${
									hoveredCard === service.id
										? "border-amber-400/50 bg-[#1a1c2c] -translate-y-1 shadow-amber-500/5"
										: "border-white/10"
								}`}
							>
								<div>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-center gap-4">
											{/* High-Contrast Dynamic Icon Avatar */}
											<div
												className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-md shrink-0 ${
													hoveredCard === service.id
														? "bg-amber-500/30 border-amber-500/50"
														: "bg-amber-500/20 border-amber-500/30"
												}`}
											>
												{service.iconSvg}
											</div>
											<div>
												<h3 className="font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors duration-200 leading-tight">
													{service.name}
												</h3>
												<div className="flex items-center gap-2 mt-1.5">
													<span className="text-xs font-bold text-amber-400">
														{service.price}
													</span>
													<span className="text-zinc-600 text-xs">
														•
													</span>
													<span className="text-[10px] text-zinc-400 font-extrabold flex items-center gap-0.5">
														<svg
															className="w-3 h-3 text-amber-400"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
														</svg>
														{service.rating}
													</span>
												</div>
											</div>
										</div>

										{/* High-contrast Status Chip */}
										<span
											className={`px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-sm transition-colors duration-200 whitespace-nowrap shrink-0 ${
												service.status ===
												t("home.statusActive")
													? "bg-amber-500/20 text-amber-300 border-amber-500/40 group-hover:bg-amber-500/30 group-hover:border-amber-500/60"
													: "bg-zinc-800 text-zinc-400 border-white/10"
											}`}
										>
											{service.status}
										</span>
									</div>

									<p className="text-xs text-zinc-300 mt-4 leading-relaxed font-medium">
										{service.desc}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="py-8 border-t border-white/10 text-center text-xs text-zinc-500 bg-[#07080a]">
				<p className="max-w-7xl mx-auto px-6">{t("home.footer")}</p>
			</footer>
		</div>
	);
}
