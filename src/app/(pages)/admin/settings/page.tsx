"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/lib/validations/settings";
import {
    BuildingIcon,
    BellIcon,
    CheckCircleIcon,
    WarningIcon,
    MoneyIcon,
    ClockIcon,
    LockIcon,
    CheckIcon,
} from "@/components/icons";
import LanguageIcon from "@/components/icons/LanguageIcon";
import RowsIcon from "@/components/icons/RowsIcon";
import AlertIcon from "@/components/icons/AlertIcon";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import systemCurrencies from "@/config/system_currencies";
import TabBar from "@/components/tab_bar";
import SpinnerIcon from "@/components/icons/SpinnerIcon";
// import { common } from "@/translations/ar/common";

/**
 * Admin Settings Page.
 * Loads current settings from DB via SettingsContext and saves changes back on submit.
 * Language changes apply immediately via LanguageProvider without a full page reload.
 */
export default function SettingsAdmin() {
    const { t, isRtl, setLocale } = useLanguage();
    const { settings, isLoading, saveSettings } = useSettings();

    // Local form state — initialised directly from context (re-initialised if settings.id changes)
    // React Hook Form values interface
    interface SettingsFormValues {
        currency_name: string;
        app_lang: "ar" | "en";
        per_page: string;
        notification_threshold: string;
        session_expiry_minutes: string;
        force_client_order_session_passKey: boolean;
    }

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(
            settingsSchema,
        ) as unknown as Resolver<SettingsFormValues>,
        defaultValues: {
            currency_name: settings.currency_name || "YER",
            app_lang: (settings.app_lang as "ar" | "en") || "ar",
            per_page: String(settings.per_page || 25),
            notification_threshold: String(
                settings.notification_threshold || 100,
            ),
            session_expiry_minutes: String(
                settings.session_expiry_minutes || 30,
            ),
            force_client_order_session_passKey:
                settings.force_client_order_session_passKey ?? false,
        },
    });

    const currencyName = useWatch({
        control,
        name: "currency_name",
    });

    // Update form default values when settings load from context
    useEffect(() => {
        if (settings) {
            reset(
                {
                    currency_name: settings.currency_name || "YER",
                    app_lang: (settings.app_lang as "ar" | "en") || "ar",
                    per_page: String(settings.per_page || 25),
                    notification_threshold: String(
                        settings.notification_threshold || 100,
                    ),
                    session_expiry_minutes: String(
                        settings.session_expiry_minutes || 30,
                    ),
                    force_client_order_session_passKey:
                        settings.force_client_order_session_passKey ?? false,
                },
                { keepDirtyValues: true },
            );
        }
    }, [settings, reset]);

    const [saveStatus, setSaveStatus] = useState<
        "idle" | "saving" | "saved" | "error"
    >("idle");
    const [activeTab, setActiveTab] = useState<"system" | "security">("system");

    const handleSaveAll = async (data: SettingsFormValues) => {
        setSaveStatus("saving");

        const success = await saveSettings({
            currency_name: data.currency_name,
            app_lang: data.app_lang,
            per_page: Number(data.per_page),
            notification_threshold: Number(data.notification_threshold),
            session_expiry_minutes: Number(data.session_expiry_minutes),
            force_client_order_session_passKey:
                data.force_client_order_session_passKey,
        });

        if (success) {
            setSaveStatus("saved");
            // Apply language change immediately without a full page reload
            if (data.app_lang === "ar" || data.app_lang === "en") {
                setLocale(data.app_lang);
            }
            setTimeout(() => setSaveStatus("idle"), 4000);
        } else {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 4000);
        }
    };

    return (
        <div className="space-y-6 w-full" dir={isRtl ? "rtl" : "ltr"}>
            {/* Top Header Banner Card */}
            <div className="relative overflow-hidden rounded-card border border-white/10 bg-surface p-8 shadow-2xl backdrop-blur-xl">
                {/* Glowing ambient backgrounds */}
                <div
                    className={`absolute top-0 ${isRtl ? "left-0 -ml-16" : "right-0 -mr-16"} -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none`}
                />
                <div
                    className={`absolute bottom-0 ${isRtl ? "right-0 -mr-16" : "left-0 -ml-16"} -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none`}
                />

                <div className="relative z-10 flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-wide">
                            {t("settings.title")}
                        </h1>
                        <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
                            {t("settings.subtitle")}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <TabBar
                        tabs={[
                            {
                                id: "system",
                                label: t("settings.sectionIdentity"),
                                icon: <BuildingIcon className="w-4 h-4" />,
                            },
                            {
                                id: "security",
                                label: t("settings.sectionNotifications"),
                                icon: <BellIcon className="w-4 h-4" />,
                            },
                        ]}
                        activeTab={activeTab}
                        onChange={(id) =>
                            setActiveTab(id as "system" | "security")
                        }
                    />
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit(handleSaveAll)} className="space-y-6">
                {/* 1. System & Localization Settings */}
                <div
                    className={`rounded-card border border-white/10 bg-surface/80 p-8 shadow-2xl backdrop-blur-xl space-y-6 ${activeTab === "system" ? "block" : "hidden"}`}
                >
                    <div
                        className={`flex items-center gap-3 pb-4 border-b border-white/10 ${isRtl ? "border-r-4 border-r-primary pr-3" : "border-l-4 border-l-primary pl-3"}`}
                    >
                        <div className="text-primary-hover">
                            <BuildingIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-black text-white">
                            {t("settings.sectionIdentity")}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Default Currency */}
                        <div className="space-y-2 bg-background/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary-hover">
                                    <MoneyIcon className="w-4 h-4" />
                                    <label
                                        htmlFor="cCurrency"
                                        className="text-xs font-black text-zinc-300 block cursor-pointer"
                                    >
                                        {t("settings.inputDefaultCurrency")}
                                    </label>
                                </div>
                                <select
                                    id="cCurrency"
                                    {...register("currency_name")}
                                    className="w-full bg-background border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-white/20 transition-all block cursor-pointer mt-1"
                                >
                                    {systemCurrencies.map(
                                        (currency: string, index: number) => (
                                            <option
                                                value={currency}
                                                key={index}
                                            >
                                                {t(`common.${currency}`)}
                                            </option>
                                        ),
                                    )}
                                </select>
                                {errors.currency_name?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">
                                        {t(
                                            String(
                                                errors.currency_name.message,
                                            ),
                                        )}
                                    </p>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold block mt-3 leading-normal border-t border-white/5 pt-2">
                                {t("settings.inputDefaultCurrencyDesc")}
                            </span>
                        </div>

                        {/* Application Language */}
                        <div className="space-y-2 bg-background/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary-hover">
                                    <LanguageIcon className="w-4 h-4" />
                                    <label
                                        htmlFor="appLangSel"
                                        className="text-xs font-black text-zinc-300 block cursor-pointer"
                                    >
                                        {t("settings.appLangLabel")}
                                    </label>
                                </div>
                                <select
                                    id="appLangSel"
                                    {...register("app_lang")}
                                    className="w-full bg-background border border-white/10 text-primary-light font-black rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-white/20 transition-all block cursor-pointer mt-1"
                                >
                                    <option value="ar">
                                        {t("settings.langAr")}
                                    </option>
                                    <option value="en">
                                        {t("settings.langEn")}
                                    </option>
                                </select>
                                {errors.app_lang?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">
                                        {t(String(errors.app_lang.message))}
                                    </p>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold block mt-3 leading-normal border-t border-white/5 pt-2">
                                {t("settings.appLangDesc")}
                            </span>
                        </div>

                        {/* Items Per Page */}
                        <div className="space-y-2 bg-background/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary-hover">
                                    <RowsIcon className="w-4 h-4" />
                                    <label
                                        htmlFor="perPageSel"
                                        className="text-xs font-black text-zinc-300 block cursor-pointer"
                                    >
                                        {t("settings.perPageLabel")}
                                    </label>
                                </div>
                                <select
                                    id="perPageSel"
                                    {...register("per_page")}
                                    className="w-full bg-background border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-white/20 transition-all block cursor-pointer mt-1"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                {errors.per_page?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">
                                        {t(String(errors.per_page.message))}
                                    </p>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold block mt-3 leading-normal border-t border-white/5 pt-2">
                                {t("settings.perPageDesc")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Notifications & Session Settings */}
                <div
                    className={`rounded-card border border-white/10 bg-surface/80 p-8 shadow-2xl backdrop-blur-xl space-y-6 ${activeTab === "security" ? "block" : "hidden"}`}
                >
                    <div
                        className={`flex items-center gap-3 pb-4 border-b border-white/10 ${isRtl ? "border-r-4 border-r-primary pr-3" : "border-l-4 border-l-primary pl-3"}`}
                    >
                        <div className="text-primary-hover">
                            <BellIcon size={20} className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-black text-white">
                            {t("settings.sectionNotifications")}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Notification Threshold */}
                        <div className="space-y-2 bg-background/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary-hover">
                                    <AlertIcon className="w-4 h-4" />
                                    <label
                                        htmlFor="nThresh"
                                        className="text-xs font-black text-zinc-300 block cursor-pointer"
                                    >
                                        {t("settings.inputThreshold")}
                                    </label>
                                </div>
                                <div className="relative flex items-center mt-1">
                                    <input
                                        id="nThresh"
                                        type="number"
                                        min="0"
                                        step="10"
                                        {...register("notification_threshold")}
                                        className="w-full bg-background border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-white/20 transition-all block"
                                    />
                                    <span
                                        className={`absolute ${isRtl ? "left-4" : "right-4"} text-xs font-black text-primary-hover pointer-events-none`}
                                    >
                                        {t(`common.${currencyName}`) ||
                                            currencyName}
                                    </span>
                                </div>
                                {errors.notification_threshold?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">
                                        {String(
                                            errors.notification_threshold
                                                .message,
                                        )}
                                    </p>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold block mt-3 leading-normal border-t border-white/5 pt-2">
                                {t("settings.inputThresholdDesc")}
                            </span>
                        </div>

                        {/* Session Expiry */}
                        <div className="space-y-2 bg-background/50 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary-hover">
                                    <ClockIcon className="w-4 h-4" />
                                    <label
                                        htmlFor="sessionExp"
                                        className="text-xs font-black text-zinc-300 block cursor-pointer"
                                    >
                                        {t("settings.sessionExpiryLabel")}
                                    </label>
                                </div>
                                <div className="relative flex items-center mt-1">
                                    <input
                                        id="sessionExp"
                                        type="number"
                                        min="5"
                                        max="1440"
                                        step="5"
                                        {...register("session_expiry_minutes")}
                                        className="w-full bg-background border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-white/20 transition-all block"
                                    />
                                    <span
                                        className={`absolute ${isRtl ? "left-4" : "right-4"} text-xs font-black text-primary-hover pointer-events-none`}
                                    >
                                        {t("settings.minutesUnit")}
                                    </span>
                                </div>
                                {errors.session_expiry_minutes?.message && (
                                    <p className="text-[10px] text-red-400 font-medium mt-1">
                                        {String(
                                            errors.session_expiry_minutes
                                                .message,
                                        )}
                                    </p>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold block mt-3 leading-normal border-t border-white/5 pt-2">
                                {t("settings.sessionExpiryDesc")}
                            </span>
                        </div>
                    </div>

                    {/* Force Passkey Switch */}
                    <div className="border-t border-white/10 pt-6 mt-4">
                        <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-background/30 hover:border-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary-hover rounded-xl">
                                    <LockIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-black text-white">
                                        {t("settings.toggleForcePasskey")}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-bold leading-relaxed max-w-lg">
                                        {t("settings.toggleForcePasskeyDesc")}
                                    </span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    {...register(
                                        "force_client_order_session_passKey",
                                    )}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:content-[''] after:content-[''] after:absolute after:top-0.5 after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-background peer-checked:after:border-transparent after:inset-s-0.5 peer-checked:after:inset-s-5.5"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save button and status floating-style bar */}
                <div className="flex items-center justify-between bg-surface/80 border border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-xl">
                    <div>
                        {saveStatus === "saved" && (
                            <div className="px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-black flex items-center gap-2 animate-pulse">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>{t("settings.msgSaved")}</span>
                            </div>
                        )}
                        {saveStatus === "error" && (
                            <div className="px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-black flex items-center gap-2 animate-pulse">
                                <WarningIcon className="w-4 h-4" />
                                <span>{t("settings.msgError")}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || saveStatus === "saving"}
                        className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover disabled:bg-amber-600/50 disabled:cursor-not-allowed text-background font-black text-xs transition-all duration-300 shadow-lg shadow-primary/10 flex items-center gap-2 cursor-pointer"
                    >
                        {saveStatus === "saving" ? (
                            <>
                                <SpinnerIcon className="animate-spin h-3.5 w-3.5" />
                                <span>{t("common.saving")}</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-4 h-4" />
                                <span>{t("settings.btnSaveAll")}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
