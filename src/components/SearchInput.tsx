"use client";

import { SearchIcon } from "./icons";
import { useLanguage } from "@/config/i18n";

interface SearchInputProps {
    /** Current search string value */
    value: string;
    /** Callback function triggered on input text changes */
    onChange: (value: string) => void;
    /** Placeholder string helper */
    placeholder?: string;
    /** Optional class string overrides */
    className?: string;
}

/**
 * Premium glassmorphic text input component with custom styling and a search icon.
 */
export default function SearchInput({
    value,
    onChange,
    placeholder,
    className = "w-full sm:max-w-xs",
}: SearchInputProps) {
    const { t } = useLanguage();
    const defaultPlaceholder = placeholder || t("common.searchPlaceholder");

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={defaultPlaceholder}
                className="w-full bg-background border border-white/10 text-white placeholder-zinc-500 rounded-2xl px-4 ltr:pr-10 rtl:pl-10 py-3 text-sm focus:outline-none focus:border-primary transition-all duration-200"
            />
            <div className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <SearchIcon size={16} />
            </div>
        </div>
    );
}
