import UserHeader from "@/components/headers/user_header";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

import NavigationLoader from "@/hooks/NavigationLoader";

const UserLayout = async ({ children }: { children: React.ReactNode }) => {
	const appSettings = await getSystemSettings();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	return (
		<div className="h-screen bg-[#07080a] text-zinc-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black overflow-x-hidden">
			<NavigationLoader />
			<UserHeader />
			{children}

			{/* Footer */}
			<footer className="py-8 h-auto border-t border-white/10 text-center text-xs text-zinc-500 bg-[#07080a]">
				<p className="max-w-7xl mx-auto px-6">{t("home.footer")}</p>
			</footer>
		</div>
	);
};


export default UserLayout;
