"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { ADMIN_PAGE_ROUTES } from "@/config/page_routes";
import { useLanguage } from "@/config/i18n";
import { defaultLoginData, LoginModel } from "@/models/login_model";
import { LOGIN_API_ROUTE } from "@/config/api_routes";
import { ADMIN_DASHBOARD_PAGE_ROUTE } from "@/config/page_routes";

/**
 * Premium Admin Login Page Component.
 * Styled in high-contrast Material You Dark Spec with Amber-harmonized key colors,
 * glassmorphism card, and smooth animations.
 */
export default function LoginPage() {
	const router = useRouter();
	const { t, isRtl } = useLanguage();
	const [loginData, setLoginData] = useState<LoginModel>(defaultLoginData);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!loginData.username || !loginData.password) {
			setError(t("login.errorRequired"));
			return;
		}

		setIsLoading(true);
		fetch(LOGIN_API_ROUTE, {
			method: "POST",
			body: JSON.stringify(loginData),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					// Store non-sensitive display user info in client cookie
					document.cookie = `auth_user=${encodeURIComponent(data.data.username)}; path=/; max-age=1800; SameSite=Lax`;

					// Store session state in localStorage and sessionStorage for client components
					localStorage.setItem(
						"auth_session",
						JSON.stringify(data.data),
					);
					sessionStorage.setItem(
						"auth_session",
						JSON.stringify(data.data),
					);

					window.dispatchEvent(new CustomEvent("navigation-start"));
					router.push(ADMIN_DASHBOARD_PAGE_ROUTE);
				} else {
					setError(data.error || t("login.errorInvalid"));
					setIsLoading(false);
				}
			})
			.catch((err) => {
				console.log(err);
				setError(t("login.errorInvalid"));
				setIsLoading(false);
			});
	};

	return (
		<div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black relative overflow-hidden">
			{/* Ambient Amber Glow Background */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-md relative z-10">
				{/* Main Login Card - Glassmorphism & High-Contrast M3 Container */}
				<div className="rounded-[28px] border border-white/10 bg-[#131522]/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative">
					{/* Accent Top Border/Line */}
					<div className="absolute top-0 left-10 right-10 h-0.5 bg-linear-to-r from-transparent via-amber-500/50 to-transparent" />

					{/* Header / Logo */}
					<div className="flex flex-col items-center mb-8">
						<div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5 mb-4 animate-pulse">
							<svg
								className="w-7 h-7"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M18 8H6a2 2 0 00-2 2v6a4 4 0 004 4h8a4 4 0 004-4v-6a2 2 0 00-2-2z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M22 10a2 2 0 01-2 2h-2V8h2a2 2 0 012 2z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 2v2M10 2v2M14 2v2"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-black text-white tracking-wide">
							{t("login.title")}
						</h1>
						<p className="text-zinc-400 text-xs mt-2 text-center font-medium">
							{t("login.subtitle")}
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 animate-bounce">
								<svg
									className="w-4 h-4 shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<span>{error}</span>
							</div>
						)}

						{/* Username Input */}
						<div className="space-y-2">
							<label
								className={`text-xs font-bold text-zinc-300 block ${isRtl ? "mr-1" : "ml-1"}`}
							>
								{t("login.usernameLabel")}
							</label>
							<div className="relative">
								<input
									type="text"
									value={loginData.username}
									onChange={(e) =>
										setLoginData({
											...loginData,
											username: e.target.value,
										})
									}
									placeholder={t("login.usernamePlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Password Input */}
						<div className="space-y-2">
							<label
								className={`text-xs font-bold text-zinc-300 block ${isRtl ? "mr-1" : "ml-1"}`}
							>
								{t("login.passwordLabel")}
							</label>
							<div className="relative">
								<input
									type="password"
									value={loginData.password}
									onChange={(e) =>
										setLoginData({
											...loginData,
											password: e.target.value,
										})
									}
									placeholder={t("login.passwordPlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600/50 disabled:cursor-not-allowed text-[#07080a] font-bold py-3.5 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-8 text-lg"
						>
							{isLoading ? (
								<>
									<svg
										className="animate-spin h-5 w-5 text-[#07080a]"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									<span>{t("login.verifying")}</span>
								</>
							) : (
								<span>{t("login.submitButton")}</span>
							)}
						</button>
					</form>

					{/* Back Link */}
					<div className="mt-8 text-center">
						<Link
							href="/"
							className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-300 transition-colors duration-200"
						>
							<svg
								className={`w-3.5 h-3.5 transform ${isRtl ? "" : "rotate-180"}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M14 5l7 7m0 0l-7 7m7-7H3"
								/>
							</svg>
							<span>{t("login.backHome")}</span>
						</Link>
					</div>
				</div>

				{/* Footer Info */}
				<div className="mt-6 text-center text-[10px] text-zinc-500 font-medium">
					<span>{t("login.footerInfo")}</span>
				</div>
			</div>
		</div>
	);
}
