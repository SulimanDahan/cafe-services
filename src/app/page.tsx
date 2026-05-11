import NotificationCenter from "@/components/NotificationCenter";

/**
 * Cafe Services Dashboard Page Component.
 * Styled in high-contrast Material You Dark Spec to ensure flawless readability,
 * even at the lowest screen brightness levels.
 */
export default function Home() {
	// Material You unified service cards themed around the Amber key color
	const services = [
		{
			id: "s1",
			name: "Espresso Bar",
			desc: "Premium single-origin beans brewed to perfection by certified baristas.",
			price: "$4.50 - $6.50",
			status: "Active",
			icon: "☕",
		},
		{
			id: "s2",
			name: "Bakery Delivery",
			desc: "Fresh croissants, muffins, and pastries delivered warm to your table.",
			price: "$3.00 - $8.00",
			status: "Active",
			icon: "🥐",
		},
		{
			id: "s3",
			name: "Gourmet Catering",
			desc: "Exquisite sandwich platters and desserts for meetings and corporate events.",
			price: "Custom Quote",
			status: "Active",
			icon: "🍱",
		},
		{
			id: "s4",
			name: "Private Tasting",
			desc: "Exclusive coffee tasting session with our master roaster (booking required).",
			price: "$45.00 / person",
			status: "Scheduled",
			icon: "🎓",
		},
	];

	return (
		<div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black">
			{/* High-Contrast Glassmorphic AppBar */}
			<header className="sticky top-4 z-40 max-w-7xl w-[calc(100%-2rem)] mx-auto rounded-3xl border border-white/10 bg-[#0d0f17]/90 backdrop-blur-xl shadow-2xl transition-all duration-300">
				<div className="px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						{/* High-contrast amber logo container */}
						<div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-lg shadow-md">
							C
						</div>
						<span className="text-lg font-black tracking-wide text-white">
							Cafe Services
						</span>
					</div>

					<div className="flex items-center gap-2">
						<NotificationCenter />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
				{/* High-Contrast Large Card Hero */}
				<div className="relative rounded-[28px] overflow-hidden border border-white/10 bg-linear-to-br from-amber-500/10 via-[#0d0f17]/40 to-transparent p-8 sm:p-12 shadow-xl">
					{/* Ambient Color Glow */}
					<div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

					<div className="max-w-xl relative z-10">
						{/* Vibrant High-contrast Pill Badge */}
						<span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
							✨ Material You Core Theme
						</span>

						<h1 className="text-3xl sm:text-5xl font-black mt-6 leading-tight tracking-tight text-white drop-shadow-md">
							Savor Every Moment
						</h1>
						<p className="text-zinc-300 mt-4 text-base sm:text-lg leading-relaxed font-medium">
							Explore our premium beverage catalog and corporate
							catering options. Fully containerized, real-time
							notification capable, and harmonized around a single
							Amber design palette.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#131522] border border-white/10 text-xs font-semibold text-zinc-200">
								<span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
								Active Docker Stack
							</div>
							<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#131522] border border-white/10 text-xs font-semibold text-zinc-200">
								<span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
								SSE Event Stream
							</div>
						</div>
					</div>
				</div>

				{/* High-Contrast Outlined Guide Banner */}
				<div className="p-5 rounded-2xl bg-[#131522] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
					<div className="flex items-start gap-4">
						<div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
							💡
						</div>
						<div>
							<h4 className="font-bold text-sm text-white">
								Dynamic Testing Instructions
							</h4>
							<p className="text-xs text-zinc-300 mt-1 font-medium">
								Open the notification panel by clicking the bell
								icon. Trigger Amber-harmonized broadcasts using
								the &quot;Simulate Event&quot; controls.
							</p>
						</div>
					</div>
				</div>

				{/* Services Grid (High-Contrast M3 Slate-Grey Cards) */}
				<div className="flex flex-col gap-6">
					<h2 className="text-xl font-black text-white tracking-wide px-1">
						Our Featured Services
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{services.map((service) => (
							<div
								key={service.id}
								className="group relative rounded-[28px] border border-white/10 bg-[#131522] p-6 hover:bg-[#1a1c2c] hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										{/* High-Contrast Avatar Icon */}
										<div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-300 text-xl flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 group-hover:border-amber-500/50 transition-all duration-300 shadow-sm">
											{service.icon}
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
										className={`px-3 py-1 rounded-full text-xs font-extrabold ${
											service.status === "Active"
												? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
												: "bg-zinc-800 text-zinc-400 border border-white/10"
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
					© 2026 Cafe Services. High-Contrast Material You Dark Spec.
				</p>
			</footer>
		</div>
	);
}
