import NotificationCenter from "@/components/NotificationCenter";

/**
 * Redesigned Premium Cafe Services Landing Page Component.
 * Styled in high-contrast Material You Dark Spec (GEMINI.md) using Cairo font.
 * Supports native RTL layouts, glassmorphism elements, and uses clean SVGs with zero emojis.
 */
export default function Home() {
	// Arabic-localized unified service cards themed around the Amber key color
	const services = [
		{
			id: "s1",
			name: "ركن الإسبريسو المختص",
			desc: "أجود أنواع البن أحادي المصدر المحضر بدقة وعناية على أيدي باريستا محترفين.",
			price: "15.00 - 25.00 ريال",
			status: "نشط",
			// Beautiful Coffee Cup SVG
			iconSvg: (
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
			name: "المخبوزات والحلويات الطازجة",
			desc: "كرواسون فرنسي هش، كعك، وحلويات فاخرة مخبوزة يومياً لتقدم دافئة على طاولتك.",
			price: "10.00 - 35.00 ريال",
			status: "نشط",
			// Beautiful Bakery/Cake SVG
			iconSvg: (
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
						strokeWidth="2"
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
					/>
				</svg>
			),
		},
		{
			id: "s3",
			name: "الضيافة الخارجية الفاخرة",
			desc: "تنسيق متكامل وأطباق مبتكرة للميتينغز والاجتماعات الرسمية وحفلات الشركات والمؤسسات.",
			price: "حسب الطلب",
			status: "نشط",
			// Beautiful Food/Plate Serving Tray SVG
			iconSvg: (
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
						strokeWidth="2"
						d="M12 8V4H8M4 20h16a1 1 0 001-1v-1a5 5 0 00-5-5H8a5 5 0 00-5 5v1a1 1 0 001 1z"
					/>
				</svg>
			),
		},
		{
			id: "s4",
			name: "جلسات التذوق الخاصة",
			desc: "رحلة معرفية تفاعلية لتذوق محاصيل القهوة النادرة واستكشاف النكهات مع خبير التحميص.",
			price: "150.00 ريال / للشخص",
			status: "مجدول",
			// Beautiful Certificate/Award Badge SVG
			iconSvg: (
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
						strokeWidth="2"
						d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
					/>
				</svg>
			),
		},
	];

	return (
		<div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black">
			{/* High-Contrast Glassmorphic AppBar */}
			<header className="sticky top-4 z-40 max-w-7xl w-[calc(100%-2rem)] mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
				<div className="px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						{/* High-contrast amber logo container (Geometric - NO emoji) */}
						<div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-md">
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
									d="M12 3v1m0 16v1m9-9h-1M4 12H3"
								/>
							</svg>
						</div>
						<span className="text-lg font-black tracking-wide text-white">
							خدمات المقهى الفاخرة
						</span>
					</div>

					{/* Notification Center Trigger */}
					<div className="flex items-center gap-2">
						<NotificationCenter />
					</div>
				</div>
			</header>

			{/* Main Content Layout */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
				{/* High-Contrast Large Card Hero Panel */}
				<div className="relative rounded-[28px] overflow-hidden border border-white/10 bg-linear-to-br from-amber-500/10 via-[#0d0f17]/40 to-transparent p-8 sm:p-12 shadow-xl">
					{/* Ambient Smooth Color Glow */}
					<div className="absolute top-0 right-1/4 w-125 h-125 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

					<div className="max-w-xl relative z-10 space-y-6">
						{/* Vibrant High-contrast Pill Badge */}
						<span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
							<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
							نمط الماتيريال الموحد والراقي
						</span>

						<h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
							استمتع بتجربة ضيافة استثنائية
						</h1>
						<p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-medium">
							اكتشف قائمتنا المختصة من المشروبات الفاخرة وطلب
							المعجنات الدافئة لفعالياتك. بيئة مجهزة بالكامل لدعم
							البث الفوري وتحديث الحالات لحظياً عبر لوحة الإشراف
							المتكاملة.
						</p>

						{/* Stack Tags */}
						<div className="pt-2 flex flex-wrap gap-3">
							<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#131522] border border-white/10 text-xs font-semibold text-zinc-200">
								<span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
								بيئة تشغيل Docker متكاملة
							</div>
							<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#131522] border border-white/10 text-xs font-semibold text-zinc-200">
								<span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
								بث أحداث فوري SSE مباشر
							</div>
						</div>
					</div>
				</div>

				{/* High-Contrast Outlined Guide Banner for SSE alerts (NO emoji, using pure SVG) */}
				<div className="p-5 rounded-2xl bg-[#131522] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
					<div className="flex items-start gap-4">
						<div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
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
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<h4 className="font-bold text-sm text-white">
								تعليمات تجربة البث الفوري
							</h4>
							<p className="text-xs text-zinc-300 mt-1 font-medium">
								انقر على أيقونة الجرس في الأعلى لفتح مركز
								الإشعارات التفاعلي. استخدم ميزة{" "}
								<strong>«محاكاة الحدث»</strong> لتجربة نغمات
								التنبيه الموسيقية المصنعة برمجياً والنوافذ
								المنبثقة اللحظية.
							</p>
						</div>
					</div>
				</div>

				{/* Services Grid (High-Contrast M3 Slate-Grey Cards) */}
				<div className="flex flex-col gap-6">
					<h2 className="text-xl font-black text-white tracking-wide px-1">
						خدماتنا المتميزة
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{services.map((service) => (
							<div
								key={service.id}
								className="group relative rounded-[28px] border border-white/10 bg-[#131522] p-6 hover:bg-[#1a1c2c] hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										{/* High-Contrast SVG Icon Avatar */}
										<div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 group-hover:border-amber-500/50 transition-all duration-300 shadow-sm">
											{service.iconSvg}
										</div>
										<div>
											<h3 className="font-black text-base text-white group-hover:text-amber-300 transition-colors duration-200">
												{service.name}
											</h3>
											<span className="text-xs font-bold text-amber-400 mt-1 block">
												{service.price}
											</span>
										</div>
									</div>

									{/* High-contrast Status Chip */}
									<span
										className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
											service.status === "نشط"
												? "bg-amber-500/20 text-amber-300 border-amber-500/40"
												: "bg-zinc-800 text-zinc-400 border-white/10"
										}`}
									>
										{service.status}
									</span>
								</div>

								<p className="text-xs text-zinc-300 mt-4 leading-relaxed font-medium pl-1">
									{service.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="py-8 border-t border-white/10 text-center text-xs text-zinc-500 bg-[#07080a]">
				<p>
					© 2026 خدمات المقهى المتكاملة. مصمم بمعايير الفخامة والتباين
					العالي.
				</p>
			</footer>
		</div>
	);
}
