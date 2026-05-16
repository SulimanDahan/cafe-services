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
        let current: any = (TRANSLATIONS as any)[locale];

        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                // Fallback to primary Arabic translation
                let fallback: any = (TRANSLATIONS as any).ar;
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

    return { t };
}
