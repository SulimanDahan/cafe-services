import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/config/i18n";
import loadAppSettings from "@/events/load_app_settings";

const cairo = Cairo({
    variable: "--font-cairo",
    subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Cafe Services - Real-Time Dashboard",
    description:
        "Containerized Next.js Cafe Services platform with live notifications and PostgreSQL connection.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

	const appSettings = await loadAppSettings();

    return (
        <html
            lang={appSettings?.app_lang}
            dir={appSettings?.app_lang === "ar" ? "rtl" : "ltr"}
            className={`${cairo.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <LanguageProvider>{children}</LanguageProvider>
            </body>
        </html>
    );
}
