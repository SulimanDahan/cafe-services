import Link from "next/link";
import { MAIN_PAGE_ROUTE } from "@/config/page_routes";
import { HomeIcon } from "@/components/icons";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Premium 500 Internal Server Error Page Component (SSR).
 * Styled in high-contrast Material You Dark Spec with zero emojis and clean SVGs.
 * Dynamically queries settings from the database at request-time to load system locale.
 */
export default async function InternalServerErrorPage() {
	const settings = await getSystemSettings();
	const locale = settings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	return (
		<div 
			className="min-h-screen bg-background text-zinc-100 font-sans flex items-center justify-center p-4 selection:bg-primary selection:text-black relative overflow-hidden"
			dir={locale === "ar" ? "rtl" : "ltr"}
		>
			{/* Ambient Glowing Graphics */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-md text-center relative z-10 space-y-8 animate-fadeIn">
				{/* 500 Glowing Number Graphic */}
				<div className="relative inline-block">
					<span className="text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-red-400 to-red-600 drop-shadow-lg tracking-widest block select-none">
						500
					</span>
					{/* Underline styling */}
					<div className="h-1.5 w-16 bg-red-500 rounded-full mx-auto mt-2" />
				</div>

				{/* Error text block */}
				<div className="space-y-3">
					<h1 className="text-2xl font-black text-white">
						{t("errors.serverError.title")}
					</h1>
					<p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
						{t("errors.serverError.desc")}
					</p>
				</div>

				{/* Action Buttons with Clean SVG Icons */}
				<div className="pt-4 flex items-center justify-center">
					<Link
						href={MAIN_PAGE_ROUTE}
						className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-background font-bold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 text-sm cursor-pointer"
					>
						<HomeIcon className="w-4 h-4" />
						<span>{t("errors.serverError.btnHome")}</span>
					</Link>
				</div>

				{/* Footer Info */}
				<div className="text-[10px] text-zinc-600 font-medium pt-8">
					<span>{t("errors.serverError.code")}</span>
				</div>
			</div>
		</div>
	);
}
