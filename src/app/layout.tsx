import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/config/i18n";
import { UserProvider } from "@/context/user_context";
import { prisma } from "@/lib/prisma";
import { SettingsProvider } from "@/context/settings_context";
import { SettingsModel } from "@/models/data_models/settings_model";
import { getServerTranslations } from "@/lib/i18n_server";

const cairo = Cairo({
	variable: "--font-cairo",
	subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata() {
	const appSettings = await prisma.settings.findFirst();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	return {
		title: t("common.logoTitle") + " - " + t("common.logoSubtitle"),
		description: t("common.logoSubtitle"),
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const appSettings = await prisma.settings.findFirst();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";

	return (
		<html
			lang={locale}
			dir={locale === "en" ? "ltr" : "rtl"}
			className={`${cairo.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<SettingsProvider initialData={appSettings as SettingsModel}>
					<LanguageProvider initialLocale={locale}>
						<UserProvider>{children}</UserProvider>
					</LanguageProvider>
				</SettingsProvider>
			</body>
		</html>
	);
}
