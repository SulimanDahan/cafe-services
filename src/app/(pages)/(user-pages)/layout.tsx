// import UserHeader from "@/components/headers/user_header";
import { getServerTranslations } from "@/lib/i18n_server";
import { getSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

import NavigationLoader from "@/hooks/NavigationLoader";
import NewsTicker from "@/components/NewsTicker";

const UserLayout = async ({ children }: { children: React.ReactNode }) => {
	const appSettings = await getSystemSettings();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	return (
		<div className="min-h-screen bg-background text-zinc-100 font-sans flex flex-col selection:bg-primary selection:text-black">
			<NewsTicker />
			<NavigationLoader />
			{/* <UserHeader /> */}
			{children}

			{/* Footer */}
			<footer className="mt-auto py-8 h-auto border-t border-white/10 text-center text-xs text-zinc-500 bg-background">
				<p className="max-w-7xl mx-auto px-6">{t("home.footer")}</p>
			</footer>
		</div>
	);
};


export default UserLayout;
