import Link from "next/link";
import { MAIN_ADMIN_ROUTE, MAIN_PAGE_ROUTE } from "@/config/page_routes";
import { LoginIcon, HomeIcon } from "@/components/icons";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Premium 403 Forbidden Page Component (SSR).
 * Styled in high-contrast Material You Dark Spec with zero emojis and clean SVGs.
 * Dynamically queries settings from the database at request-time to load system locale.
 */
export default async function ForbiddenPage() {
	const settings = await getSystemSettings();
	const locale = settings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	return (
		<div 
			className="min-h-screen bg-background text-zinc-100 font-sans flex items-center justify-center p-4 selection:bg-primary selection:text-black relative overflow-hidden"
			dir={locale === "ar" ? "rtl" : "ltr"}
		>
			{/* Ambient Glowing Graphics */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-md text-center relative z-10 space-y-8 animate-fadeIn">
				{/* 403 Glowing Number Graphic */}
				<div className="relative inline-block">
					<span className="text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-primary-hover to-amber-600 drop-shadow-lg tracking-widest block select-none">
						403
					</span>
					{/* Underline styling */}
					<div className="h-1.5 w-16 bg-primary rounded-full mx-auto mt-2" />
				</div>

				{/* Error text block */}
				<div className="space-y-3">
					<h1 className="text-2xl font-black text-white">
						{t("errors.unauthorized.title")}
					</h1>
					<p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
						{t("errors.unauthorized.desc")}
					</p>
				</div>

				{/* Action Buttons with Clean SVG Icons */}
				<div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
					<Link
						href={MAIN_ADMIN_ROUTE}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-background font-bold px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 text-sm"
					>
						<LoginIcon className="w-4 h-4" />
						<span>{t("errors.unauthorized.btnAdmin")}</span>
					</Link>

					<Link
						href={MAIN_PAGE_ROUTE}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-surface border border-white/10 hover:border-white/20 text-white font-bold px-6 py-3.5 rounded-full transition-all duration-300 text-sm"
					>
						<HomeIcon className="w-4 h-4" />
						<span>{t("errors.unauthorized.btnHome")}</span>
					</Link>
				</div>

				{/* Footer Info */}
				<div className="text-[10px] text-zinc-600 font-medium pt-8">
					<span>{t("errors.unauthorized.code")}</span>
				</div>
			</div>
		</div>
	);
}
