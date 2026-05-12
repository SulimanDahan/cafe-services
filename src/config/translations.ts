import ar from "@/translations/ar";
import en from "@/translations/en";

/**
 * Global Bilingual Translation Dictionary.
 * Arabic (ar) is the primary default language, English (en) is the secondary.
 * Imports modular translation files per language and page for easier maintenance.
 */
export const TRANSLATIONS = {
	ar,
	en,
} as const;
