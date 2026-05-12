"use client";

import { useLanguage } from "@/config/i18n";

/**
 * Premium Language Switcher component.
 * Allows toggling between Arabic (ar) and English (en).
 * Designed with a glassmorphic pill style, smooth animations, and zero emojis.
 */
export default function LanguageSwitcher() {
	const { locale, setLocale } = useLanguage();

	return (
		<div className="flex items-center gap-1.5 p-1 rounded-full bg-[#07080a] border border-white/10 shrink-0">
			<button
				onClick={() => setLocale("ar")}
				className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all duration-300 ${
					locale === "ar"
						? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
						: "text-zinc-400 hover:text-white"
				}`}
			>
				العربية
			</button>
			<button
				onClick={() => setLocale("en")}
				className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-all duration-300 ${
					locale === "en"
						? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
						: "text-zinc-400 hover:text-white"
				}`}
			>
				English
			</button>
		</div>
	);
}
