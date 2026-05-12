"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { TRANSLATIONS } from "./translations";

type Locale = "ar" | "en";

interface LanguageContextType {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (keyPath: string) => string;
	isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

interface LanguageProviderProps {
	children: ReactNode;
}

/**
 * Global Language & Internationalization Provider (i18n).
 * Establishes Arabic ("ar") as the primary default language, and English ("en") as secondary.
 * Dynamically handles document layout direction ("rtl" vs "ltr") and stores preference in localStorage.
 * Provides a highly robust dot-notation translation selector (e.g., t("common.save")).
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
	const [locale, setLocaleState] = useState<Locale>("ar");

	// Synchronize locale state with localStorage preference on mount
	useEffect(() => {
		const storedLocale = localStorage.getItem("cafe_locale") as Locale;
		if (storedLocale === "ar" || storedLocale === "en") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setLocaleState(storedLocale);
		} else {
			// Arabic is the primary default
			localStorage.setItem("cafe_locale", "ar");
		}
	}, []);

	// Handle directionality and layout alignments dynamically when locale updates
	useEffect(() => {
		document.documentElement.lang = locale;
		if (locale === "ar") {
			document.documentElement.dir = "rtl";
			// document.documentElement.style.fontFamily = "'Cairo', sans-serif";
		} else {
			document.documentElement.dir = "ltr";
			// document.documentElement.style.fontFamily = "'Inter', sans-serif";
		}
	}, [locale]);

	const setLocale = (newLocale: Locale) => {
		setLocaleState(newLocale);
		localStorage.setItem("cafe_locale", newLocale);
	};

	/**
	 * Dot-notation translation helper function.
	 * Resolves paths like t("sidebar.dashboard") or t("common.save").
	 * Falls back gracefully to Arabic translation if a key is missing from English.
	 */
	const t = (keyPath: string): string => {
		const parts = keyPath.split(".");
		let current: any = TRANSLATIONS[locale];

		for (const part of parts) {
			if (current && current[part] !== undefined) {
				current = current[part];
			} else {
				// Fallback to primary Arabic translation
				let fallback: any = TRANSLATIONS.ar;
				for (const fbPart of parts) {
					if (fallback && fallback[fbPart] !== undefined) {
						fallback = fallback[fbPart];
					} else {
						return keyPath; // fallback of fallback: return path name
					}
				}
				return fallback;
			}
		}

		return typeof current === "string" ? current : keyPath;
	};

	const isRtl = locale === "ar";

	return (
		<LanguageContext.Provider value={{ locale, setLocale, t, isRtl }}>
			{children}
		</LanguageContext.Provider>
	);
}

/**
 * Custom hook to consume Global Bilingual Localization state and translation handles.
 */
export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
