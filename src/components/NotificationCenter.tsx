"use client";
import { NOTIFICATION_CREATE_API_ROUTE, NOTIFICATION_STREAM_API_ROUTE } from "@/config/api_routes";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useRef } from "react";
import { BellIcon } from "./icons";
import { useLanguage } from "@/config/i18n";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: string; // info, success, warning, error
	read: boolean;
	created_at: string;
}

/**
 * Renders a glassmorphic notification dropdown and manages active SSE client stream.
 * Displays unread alert counts and slides in live toast notifications with chime playbacks.
 * Designed in accordance with high-contrast Material You (Material 3) dark theme specs.
 */
export default function NotificationCenter() {
	const { t, isRtl } = useLanguage();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [toasts, setToasts] = useState<Notification[]>([]);
	const dropdownRef = useRef<HTMLDivElement>(null);

	/**
	 * Synthesizes a beautiful harmonic chime (E5 and G5 chord) natively via Web Audio API.
	 * Bypasses the need for downloading/hosting external `.mp3` audio files.
	 */
	const playChime = () => {
		if (typeof window === "undefined") return;
		try {
			const AudioContext =
				window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContext) return;
			const ctx = new AudioContext();

			const playTone = (
				freq: number,
				start: number,
				duration: number,
			) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();

				osc.type = "sine";
				osc.frequency.setValueAtTime(freq, start);

				gain.gain.setValueAtTime(0.12, start);
				gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

				osc.connect(gain);
				gain.connect(ctx.destination);

				osc.start(start);
				osc.stop(start + duration);
			};

			const now = ctx.currentTime;
			// Beautiful harmonic interval: E5 (659.25Hz) followed by G5 (783.99Hz)
			playTone(659.25, now, 0.15);
			playTone(783.99, now + 0.08, 0.3);
		} catch (e) {
			console.warn("AudioContext playback blocked or failed:", e);
		}
	};

	// Connect to Real-time SSE Stream
	useEffect(() => {
		const eventSource = new EventSource(NOTIFICATION_STREAM_API_ROUTE);

		// Initial load of previous notifications
		eventSource.addEventListener("initial-notifications", (event: any) => {
			try {
				const data = JSON.parse(event.data);
				setNotifications(data);
			} catch (err) {
				console.error("Error parsing initial notifications:", err);
			}
		});

		// Handle new real-time notification
		eventSource.addEventListener("new-notification", (event: any) => {
			try {
				const notification = JSON.parse(event.data);

				// Add to main notifications list
				setNotifications((prev) => [notification, ...prev]);

				// Push as active toast
				setToasts((prev) => [...prev, notification]);

				// Play audio chime
				playChime();

				// Auto remove toast after 5 seconds
				setTimeout(() => {
					setToasts((prev) =>
						prev.filter((t) => t.id !== notification.id),
					);
				}, 5000);
			} catch (err) {
				console.error("Error parsing new notification:", err);
			}
		});

		eventSource.onerror = (err) => {
			console.warn("SSE Connection lost. Retrying...", err);
		};

		// Close connection on unmount
		return () => {
			eventSource.close();
		};
	}, []);

	// Register Service Worker for PWA support on mount
	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) =>
					console.log(
						"PWA Service Worker registered with scope:",
						reg.scope,
					),
				)
				.catch((err) =>
					console.warn(
						"PWA Service Worker registration failed:",
						err,
					),
				);
		}
	}, []);

	// Close dropdown on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const markAsRead = async (id: string) => {
		// Optimistic UI update
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
		);
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	const clearNotifications = () => {
		setNotifications([]);
	};

	/**
	 * Simple helper triggering a test alert event by querying the broadcast API endpoint.
	 *
	 * @param type - The notification category: "success" | "info" | "warning" | "error"
	 */
	const triggerTestNotification = async (type: string) => {
		const titles: Record<string, string> = {
			success: "Order Prepared!",
			warning: "Low Inventory Alert!",
			error: "Payment Failed!",
			info: "System Maintenance",
		};
		const messages: Record<string, string> = {
			success:
				"Order #2405 has been successfully prepared and is ready for pickup.",
			warning: "Espresso beans are running low. Please restock soon.",
			error: "Transaction #A329 was rejected by the payment processor.",
			info: "Database optimization scheduled tonight at 2:00 AM UTC.",
		};

		try {
			await fetch(
				`${NOTIFICATION_CREATE_API_ROUTE}?title=${encodeURIComponent(
					titles[type],
				)}&message=${encodeURIComponent(messages[type])}&type=${type}`,
			);
		} catch (err) {
			console.error("Failed to trigger notification:", err);
		}
	};

	return (
		<div className="relative z-50 font-sans" dir={isRtl ? "rtl" : "ltr"}>
			{/* High-Contrast Real-time Toast Notifications */}
			<div className={`fixed top-5 flex flex-col gap-3 max-w-sm w-[calc(100vw-2.5rem)] z-50 ${isRtl ? "left-5" : "right-5"}`}>
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="p-4 rounded-[20px] shadow-2xl backdrop-blur-xl border-2 border-amber-500/40 bg-[#181a26]/95 text-white flex gap-3 transition-all duration-300 transform translate-x-0 animate-slide-in hover:border-amber-500/60 shadow-black"
					>
						{/* High-contrast icon badge */}
						<div className="mt-0.5 shrink-0">
							<span className="flex h-6 w-6 rounded-lg bg-amber-500/20 text-amber-300 items-center justify-center font-extrabold text-xs border border-amber-500/40 shadow-sm">
								{toast.type === "success" && "✓"}
								{toast.type === "error" && "✕"}
								{toast.type === "warning" && "!"}
								{toast.type === "info" && "i"}
							</span>
						</div>

						<div className="flex-1">
							<h4 className="font-extrabold text-sm tracking-wide text-white drop-shadow-sm">
								{toast.title}
							</h4>
							<p className="text-xs mt-1 text-zinc-200 font-semibold leading-relaxed">
								{toast.message}
							</p>
						</div>

						<button
							onClick={() =>
								setToasts((prev) =>
									prev.filter((t) => t.id !== toast.id),
								)
							}
							className="text-zinc-400 hover:text-amber-300 transition-colors duration-150 self-start text-sm font-black px-1"
						>
							✕
						</button>
					</div>
				))}
			</div>

			{/* Bell Icon Trigger */}
			<div ref={dropdownRef} className="relative">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all duration-200 border border-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-md cursor-pointer"
					aria-label="Toggle notifications"
				>
					{/* Bell Icon */}
					<BellIcon size={20} className="text-white" />

					{/* High-Contrast Badge */}
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-5 w-5">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[10px] font-black text-black items-center justify-center shadow-md">
								{unreadCount}
							</span>
						</span>
					)}
				</button>

				{/* High-Contrast Dropdown Menu (M3 Card layout) */}
				{isOpen && (
					<div className={`absolute mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-3xl border border-white/15 shadow-2xl bg-[#131522]/95 backdrop-blur-2xl text-white overflow-hidden transition-all duration-300 transform scale-100 shadow-black ${
						isRtl 
							? "left-0 origin-top-left" 
							: "right-0 origin-top-right"
					}`}>
						{/* Header */}
						<div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
							<div>
								<h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white">
									{t("common.notificationCenterTitle")}
								</h3>
								<p className="text-xs text-zinc-300 mt-0.5 font-bold">
									{unreadCount} {t("common.notificationCenterUnread")}
								</p>
							</div>
							{unreadCount > 0 && (
								<button
									onClick={markAllAsRead}
									className="text-xs font-black text-amber-300 hover:text-amber-100 transition-colors duration-150 cursor-pointer"
								>
									{t("common.notificationCenterMarkRead")}
								</button>
							)}
						</div>

						{/* List */}
						<div className="max-h-80 overflow-y-auto divide-y divide-white/10">
							{notifications.length === 0 ? (
								<div className="p-8 text-center text-zinc-400">
									<p className="text-sm font-bold">
										{t("common.notificationCenterNone")}
									</p>
									<p className="text-xs mt-1 text-zinc-500 font-semibold">
										{t("common.notificationCenterDesc")}
									</p>
								</div>
							) : (
								notifications.map((n) => (
									<div
										key={n.id}
										onClick={() =>
											!n.read && markAsRead(n.id)
										}
										className={`p-4 transition-all duration-200 cursor-pointer relative group flex gap-3 ${
											n.read
												? "hover:bg-white/4"
												: "bg-amber-500/8 hover:bg-amber-500/12 border-l-4 border-l-amber-500 pl-3"
										}`}
									>
										{/* Left Icon decoration based on type (High-contrast dynamic color) */}
										<div className="shrink-0 mt-0.5">
											<div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-xs shadow-sm">
												{n.type === "success" && "✓"}
												{n.type === "error" && "✕"}
												{n.type === "warning" && "!"}
												{n.type === "info" && "i"}
											</div>
										</div>

										<div className="flex-1">
											<div className="flex items-center justify-between gap-2">
												<span
													className={`text-sm font-black tracking-wide ${n.read ? "text-zinc-400" : "text-white"}`}
												>
													{n.title}
												</span>
												<span className="text-[10px] text-zinc-400 font-bold shrink-0">
													{new Date(
														n.created_at,
													).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</span>
											</div>
											<p
												className={`text-xs mt-1 leading-relaxed font-semibold ${n.read ? "text-zinc-400" : "text-zinc-200"}`}
											>
												{n.message}
											</p>
										</div>
									</div>
								))
							)}
						</div>

						{/* Quick manual testing triggers inside dropdown (M3 Tonal Chips) */}
						<div className="p-4 bg-white/2 border-t border-white/10">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
									{t("common.notificationCenterSimulate")}
								</span>
								{notifications.length > 0 && (
									<button
										onClick={clearNotifications}
										className="text-[11px] font-black text-amber-300 hover:text-amber-100 transition-colors cursor-pointer"
									>
										{t("common.notificationCenterClear")}
									</button>
								)}
							</div>
							<div className="grid grid-cols-4 gap-1.5">
								<button
									onClick={() =>
										triggerTestNotification("success")
									}
									className="py-1.5 px-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold hover:bg-amber-500/30 active:scale-95 transition-all text-center cursor-pointer"
								>
									Success
								</button>
								<button
									onClick={() =>
										triggerTestNotification("info")
									}
									className="py-1.5 px-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold hover:bg-amber-500/30 active:scale-95 transition-all text-center cursor-pointer"
								>
									Info
								</button>
								<button
									onClick={() =>
										triggerTestNotification("warning")
									}
									className="py-1.5 px-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold hover:bg-amber-500/30 active:scale-95 transition-all text-center cursor-pointer"
								>
									Warn
								</button>
								<button
									onClick={() =>
										triggerTestNotification("error")
									}
									className="py-1.5 px-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold hover:bg-amber-500/30 active:scale-95 transition-all text-center cursor-pointer"
								>
									Error
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
