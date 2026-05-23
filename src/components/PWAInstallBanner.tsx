"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/config/i18n";

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

		// Dynamically inject the appropriate manifest link
		const manifestFile = appType === "admin" ? "/admin-manifest.json" : "/customer-manifest.json";
		let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
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
						err
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

		// 2. If user already dismissed the prompt in this session, do not show again
		const isDismissed = sessionStorage.getItem(
			`pwa_prompt_dismissed_${appType}`,
		);
		if (isDismissed === "true") return;

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
		sessionStorage.setItem(`pwa_prompt_dismissed_${appType}`, "true");
	};

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 w-[calc(100vw-2rem)] sm:w-120 max-w-lg select-none pointer-events-auto">
			<div className="rounded-3xl border border-amber-500/30 bg-[#131522]/90 backdrop-blur-xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col gap-4 animate-slide-up text-right">
				{/* Background Glowing Aura */}
				<div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

				<div className="flex items-start gap-4">
					{/* App/Scope Icon */}
					<div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
						{appType === "admin" ? (
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						) : (
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707"
								/>
							</svg>
						)}
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
							<span className="text-amber-400 font-extrabold">
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
							className="flex-1 py-2.5 rounded-full bg-amber-500 text-black font-extrabold text-[11px] tracking-wide hover:bg-amber-400 transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
						>
							<svg
								className="w-3.5 h-3.5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							{t("common.pwaInstallBtn")}
						</button>
					) : null}
					<button
						onClick={handleDismissClick}
						className={`py-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-bold text-[11px] hover:bg-white/10 transition-colors cursor-pointer active:scale-95 ${
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
