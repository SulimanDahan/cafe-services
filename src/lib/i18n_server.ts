import { TRANSLATIONS } from "@/config/translations";

/**
 * Server-side translation helper.
 * Allows using translations in Server Components (like layouts and pages).
 * @param locale The locale to use for translations.
 * @returns A translation function 't'.
 */
export function getServerTranslations(locale: "ar" | "en") {
    /**
     * Dot-notation translation helper function.
     * Resolves paths like t("sidebar.dashboard") or t("common.save").
     */
    const t = (keyPath: string): string => {
        const parts = keyPath.split(".");
        let current: unknown = TRANSLATIONS[locale];

        for (const part of parts) {
            if (current && typeof current === "object" && part in current) {
                current = (current as Record<string, unknown>)[part];
            } else {
                // Fallback to primary Arabic translation
                let fallback: unknown = TRANSLATIONS.ar;
                for (const fbPart of parts) {
                    if (fallback && typeof fallback === "object" && fbPart in fallback) {
                        fallback = (fallback as Record<string, unknown>)[fbPart];
                    } else {
                        return keyPath; // fallback of fallback: return path name
                    }
                }
                return typeof fallback === "string" ? fallback : keyPath;
            }
        }

        return typeof current === "string" ? current : keyPath;
    };

    return { t };
}
