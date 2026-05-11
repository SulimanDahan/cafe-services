"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Premium Admin Login Page Component.
 * Styled in high-contrast Material You Dark Spec with Amber-harmonized key colors,
 * glassmorphism card, and smooth animations.
 */
export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!username || !password) {
			setError("يرجى إدخال اسم المستخدم وكلمة المرور.");
			return;
		}

		setIsLoading(true);

		// Simulate API Call for Login
		setTimeout(() => {
			setIsLoading(false);
			// Simple check for demo / admin route
			if (username === "admin" && password === "admin123") {
				router.push("/admin");
			} else {
				setError("اسم المستخدم أو كلمة المرور غير صحيحة!");
			}
		}, 1500);
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
						<div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/5 mb-4 animate-pulse">
							☕
						</div>
						<h1 className="text-2xl font-black text-white tracking-wide">
							بوابة الإدارة
						</h1>
						<p className="text-zinc-400 text-xs mt-2 text-center font-medium">
							الرجاء تسجيل الدخول للوصول إلى لوحة تحكم الخدمات
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 animate-bounce">
								<span>⚠️</span>
								<span>{error}</span>
							</div>
						)}

						{/* Username Input */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-300 block mr-1">
								اسم المستخدم
							</label>
							<div className="relative">
								<input
									type="text"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
									placeholder="أدخل اسم المستخدم"
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
									disabled={isLoading}
								/>
							</div>
						</div>

						{/* Password Input */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-300 block mr-1">
								كلمة المرور
							</label>
							<div className="relative">
								<input
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="••••••••"
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
									<span>جاري التحقق من البيانات...</span>
								</>
							) : (
								<span>دخول</span>
							)}
						</button>
					</form>

					{/* Back Link */}
					<div className="mt-8 text-center">
						<Link
							href="/"
							className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-300 transition-colors duration-200"
						>
							<span>←</span>
							<span>العودة إلى الصفحة الرئيسية</span>
						</Link>
					</div>
				</div>

				{/* Footer Info */}
				<div className="mt-6 text-center text-[10px] text-zinc-500 font-medium">
					<span>نظام خدمات المقهى المتكامل • النسخة 1.0.0</span>
				</div>
			</div>
		</div>
	);
}
