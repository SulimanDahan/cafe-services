"use client";

import { useEffect } from "react";

interface PWAInstallBannerProps {
    appType: "customer" | "admin";
}

/**
 * Premium PWA Installation component.
 * Handles manifest injection and service worker registration for Admin.
 * Note: UI logic for manual installation prompting is removed to favor browser-native behavior.
 */
export default function PWAInstallBanner({ appType }: PWAInstallBannerProps) {
    useEffect(() => {
        if (typeof window === "undefined" || appType === "customer") return;

        // If the context is not secure, PWA features will be blocked.
        if (!window.isSecureContext) return;

        // Dynamically inject the appropriate manifest link for admin
        const manifestFile = "/admin-manifest.json?v=2";
        let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (link) {
            link.href = manifestFile;
        } else {
            link = document.createElement("link");
            link.rel = "manifest";
            link.href = manifestFile;
            document.head.appendChild(link);
        }

        // Register Service Worker to enable PWA support for admin
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((err) => {
                if (err instanceof Error && err.name === "SecurityError") {
                    console.warn(
                        "PWA Service Worker registration failed due to security/SSL constraints. " +
                        "If you are developing locally on an IP (e.g. 192.168.x.x) with a self-signed certificate, " +
                        "you can bypass this in Chrome by visiting chrome://flags/#unsafely-treat-insecure-origin-as-secure, " +
                        "enabling the flag, and adding your target address to the text list.",
                        err,
                    );
                } else {
                    console.error("Service Worker registration failed:", err);
                }
            });
        }

        // Note: We deliberately do NOT intercept 'beforeinstallprompt' anymore.
        // This allows the browser to show its native "Install App" prompt or icon automatically.

    }, [appType]);

    // Return no UI - the installation is entirely handled natively by the browser.
    return null;
}
