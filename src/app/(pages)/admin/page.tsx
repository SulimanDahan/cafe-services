"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { ADMIN_PAGE_ROUTES } from "@/config/page_routes";
import { useLanguage } from "@/config/i18n";
import { defaultLoginData, LoginModel } from "@/models/data_models/login_model";
import { LOGIN_API_ROUTE } from "@/config/api_routes";
import { ADMIN_DASHBOARD_PAGE_ROUTE, MAIN_PAGE_ROUTE } from "@/config/page_routes";
import { AUTH_COOKIE_NAME } from "@/config/constants";
import { ServerIcon, WarningIcon, SpinnerIcon, ArrowIcon } from "@/components/icons";

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
						AUTH_COOKIE_NAME,
						JSON.stringify(data.data),
					);
					sessionStorage.setItem(
						AUTH_COOKIE_NAME,
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
							<ServerIcon className="w-7 h-7" />
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
								<WarningIcon className="w-4 h-4 shrink-0" />
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
									<SpinnerIcon className="animate-spin h-5 w-5 text-[#07080a]" />
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
							href={MAIN_PAGE_ROUTE}
							className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-300 transition-colors duration-200"
						>
							<ArrowIcon className={`w-3.5 h-3.5 transform ${isRtl ? "" : "rotate-180"}`} />
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
