import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/config/i18n";
import { getSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
import { SettingsProvider } from "@/context/settings_context";
import { SettingsModel } from "@/models/data_models/settings_model";
import { getServerTranslations } from "@/lib/i18n_server";
// import { ItemGroupProvider } from "@/context/item_group_context";
// import { ItemProvider } from "@/context/item_context";
// import { ReservationProvider } from "@/context/reservation_context";
// import { OrderProvider } from "@/context/order_context";

const cairo = Cairo({
	variable: "--font-cairo",
	subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata() {
	const appSettings = await getSystemSettings();
	const locale = appSettings?.app_lang === "en" ? "en" : "ar";
	const { t } = getServerTranslations(locale);

	return {
		title: t("common.logoTitle") + " - " + t("common.logoSubtitle"),
		description: t("common.logoSubtitle"),
		manifest: "/customer-manifest.json",
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const appSettings = await getSystemSettings();
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
						{/* <UserProvider> */}
						{/* <ItemGroupProvider> */}
						{/* <ItemProvider> */}
						{/* <ReservationProvider> */}
						{/* <OrderProvider> */}
						{children}
						{/* </OrderProvider>
									</ReservationProvider>
								</ItemProvider>
							</ItemGroupProvider>
						</UserProvider> */}
					</LanguageProvider>
				</SettingsProvider>
			</body>
		</html>
	);
}
