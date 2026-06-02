"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/config/i18n";
import DownloadIcon from "./icons/DownloadIcon";
import { LogoIcon } from "./icons";

interface PWAInstallBannerProps {
    appType: "customer" | "admin";
}

/**
 * Premium PWA Installation Banner component.
 * Intercepts beforeinstallprompt events to trigger custom Chrome/Android installations.
 * Detects iOS/Safari to render tailored "Add to Home Screen" micro-instructions.
 * Complies with Material Design 3 guidelines: rounded-3xl, glassmorphism, and smooth slide-up animations.
 */
export default function PWAInstallBanner({ appType }: PWAInstallBannerProps) {
    const { isRtl, t } = useLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<"standard" | "ios" | "other">(
        "other",
    );

    useEffect(() => {
        if (typeof window === "undefined") return;

        // If the context is not secure (e.g. self-signed IP address without flags),
        // PWA features (like service workers) will be blocked by the browser.
        // So we silently abort to avoid confusing errors or un-installable banners.
        if (!window.isSecureContext) {
            return;
        }

        // Dynamically inject the appropriate manifest link
        const manifestFile =
            appType === "admin"
                ? "/admin-manifest.json?v=2"
                : "/customer-manifest.json?v=2";
        let link = document.querySelector(
            'link[rel="manifest"]',
        ) as HTMLLinkElement;
        if (link) {
            link.href = manifestFile;
        } else {
            link = document.createElement("link");
            link.rel = "manifest";
            link.href = manifestFile;
            document.head.appendChild(link);
        }

        // Register Service Worker to enable PWA support
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((err) => {
                if (err instanceof Error && err.name === "SecurityError") {
                    console.warn(
                        "PWA Service Worker registration failed due to security/SSL constraints. " +
                            "If you are developing locally on an IP (e.g. 192.168.x.x) with a self-signed certificate, " +
                            "you can bypass this in Chrome by visiting chrome://flags/#unsafely-treat-insecure-origin-as-secure, " +
                            "enabling the flag, and adding 'https://192.168.92.249:3000' (or your target address) to the text list.",
                        err,
                    );
                } else {
                    console.error("Service Worker registration failed:", err);
                }
            });
        }

        // 1. If already running as installed standalone app, do not show prompt
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean })
                .standalone === true;

        if (isStandalone) return;

        // 2. If user already dismissed the prompt in the last 24 hours, do not show
        const dismissedAtStr = localStorage.getItem(
            `pwa_prompt_dismissed_at_${appType}`,
        );
        if (dismissedAtStr) {
            const dismissedAt = parseInt(dismissedAtStr, 10);
            const now = Date.now();
            if (now - dismissedAt < 24 * 60 * 60 * 1000) {
                return;
            } else {
                localStorage.removeItem(`pwa_prompt_dismissed_at_${appType}`);
            }
        }

        // 3. Detect Platform
        const userAgent = navigator.userAgent || "";
        const isIOS =
            /iPad|iPhone|iPod/i.test(userAgent) ||
            (navigator.maxTouchPoints > 0 && /Macintosh/i.test(userAgent));

        if (isIOS) {
            setTimeout(() => {
                setPlatform("ios");
            }, 0);
            // Defer showing iOS prompt for 3 seconds to let users orient themselves first
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setTimeout(() => {
                setPlatform("standard");
            }, 0);
        }

        // 4. Listen to beforeinstallprompt event (Chrome, Edge, Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent default native mini-infobar
            e.preventDefault();
            // Save event to trigger it later
            setDeferredPrompt(e);
            // Display custom banner
            setIsVisible(true);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );
        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
        };
    }, [appType]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        const promptEvent = deferredPrompt as Event & {
            prompt: () => void;
            userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
        };

        // Trigger installation prompt
        promptEvent.prompt();

        // Await choice
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
            console.log(`User installed the ${appType} PWA application!`);
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismissClick = () => {
        setIsVisible(false);
        localStorage.setItem(
            `pwa_prompt_dismissed_at_${appType}`,
            Date.now().toString(),
        );
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 w-[calc(100vw-2rem)] sm:w-120 max-w-lg select-none pointer-events-auto">
            <div className="rounded-3xl border border-primary/30 bg-surface/90 backdrop-blur-xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col gap-4 animate-slide-up text-right">
                {/* Background Glowing Aura */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                <div className="flex items-start gap-4">
                    {/* App/Scope Icon */}
                    <div className="h-12 w-12 shrink-0">
                        <LogoIcon className="w-full h-full drop-shadow-md" />
                    </div>

                    <div
                        className="flex-1 space-y-1"
                        dir={isRtl ? "rtl" : "ltr"}
                    >
                        <h4 className="text-sm font-black text-white">
                            {appType === "admin"
                                ? t("common.pwaAdminTitle")
                                : t("common.pwaCustomerTitle")}
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                            {appType === "admin"
                                ? t("common.pwaAdminDesc")
                                : t("common.pwaCustomerDesc")}
                        </p>
                    </div>
                </div>

                {/* Platform Specific Actions */}
                {platform === "ios" ? (
                    <div
                        className="rounded-2xl bg-white/3 border border-white/5 p-3 flex items-center gap-3"
                        dir={isRtl ? "rtl" : "ltr"}
                    >
                        <span className="text-lg">💡</span>
                        <p className="text-[10px] text-zinc-300 leading-normal font-bold">
                            {t("common.pwaIosInstructAdmin")}{" "}
                            <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs mx-0.5 text-center font-bold">
                                📤
                            </span>{" "}
                            {t("common.pwaIosInstructCustomer")}{" "}
                            <span className="text-primary-hover font-extrabold">
                                {t("common.pwaIosAddBtn")}
                            </span>
                            .
                        </p>
                    </div>
                ) : null}

                {/* Action Buttons */}
                <div
                    className="flex items-center gap-2"
                    dir={isRtl ? "rtl" : "ltr"}
                >
                    {platform === "standard" && deferredPrompt ? (
                        <button
                            onClick={handleInstallClick}
                            className="flex-1 py-2.5 rounded-full bg-primary text-black font-extrabold text-[11px] tracking-wide hover:bg-primary-hover transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <DownloadIcon className="w-3.5 h-3.5" />
                            {t("common.pwaInstallBtn")}
                        </button>
                    ) : null}
                    <button
                        onClick={handleDismissClick}
                        className={`py-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-bold text-[11px] hover:bg-white/10 transition-colors cursor-pointer ${
                            platform === "ios" || !deferredPrompt
                                ? "flex-1"
                                : "px-6"
                        }`}
                    >
                        {t("common.pwaDismissBtn")}
                    </button>
                </div>
            </div>
        </div>
    );
}
