"use client";

import { useLanguage } from "@/config/i18n";

import { LogoIcon } from "@/components/icons";

/**
 * Full Screen Page Transition Loader component.
 * Features ultra-premium coffee gold / amber visual assets, modern micro-animations,
 * and high-contrast glassmorphic overlay for visual wow factor.
 * Automatically translates text using our global i18n handler.
 */
export default function PageLoader() {
	const { t } = useLanguage();
	return (
		<div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-all duration-300">
			{/* Ambient Glowing Aura */}
			<div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

			<div className="relative flex flex-col items-center gap-6">
				{/* Modern Premium Loader Graphic */}
				<div className="relative h-20 w-20">
					{/* Outer Spinning Rim */}
					<div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />

					{/* Inner Pulse Circle with SVG Icon */}
					<div className="absolute inset-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
						<LogoIcon className="w-8 h-8 text-primary" />
					</div>
				</div>

				{/* Bilingual Text Indicators */}
				<div className="text-center space-y-1.5 z-10">
					<h3 className="text-sm font-black text-white tracking-wide animate-pulse">
						{t("common.loading")}
					</h3>
					<p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
						{t("common.logoTitle")} • {t("common.logoSubtitle")}
					</p>
				</div>
			</div>
		</div>
	);
}
