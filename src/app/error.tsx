"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/**
 * Premium 500 Internal Server Error Page Component.
 * Handled as a Next.js error boundary Client Component.
 * Styled in high-contrast Material You Dark Spec with zero emojis and clean SVGs.
 */
export default function ErrorPage({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Securely log the error to console
		console.error("System Error Handled:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black relative overflow-hidden">
			{/* Ambient Glowing Graphics */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-md text-center relative z-10 space-y-8 animate-fadeIn">
				
				{/* 500 Glowing Number Graphic */}
				<div className="relative inline-block">
					<span className="text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-red-400 to-red-600 drop-shadow-lg tracking-widest block select-none animate-pulse">
						500
					</span>
					{/* Underline styling */}
					<div className="h-1.5 w-16 bg-red-500 rounded-full mx-auto mt-2" />
				</div>

				{/* Error text block */}
				<div className="space-y-3">
					<h1 className="text-2xl font-black text-white">
						حدث خطأ غير متوقع في النظام
					</h1>
					<p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
						عذراً، يواجه الخادم مشكلة فنية داخلية في تلبية الطلب حالياً. نحن نعمل بكل جد على إصلاح الخلل بأسرع وقت ممكن.
					</p>
				</div>

				{/* Action Buttons with Clean SVG Icons */}
				<div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
					<button
						onClick={reset}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-[#07080a] font-bold px-6 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] text-sm cursor-pointer"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
						</svg>
						<span>إعادة المحاولة</span>
					</button>

					<Link
						href="/"
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#131522] border border-white/10 hover:border-white/20 text-white font-bold px-6 py-3.5 rounded-full transition-all duration-300 active:scale-[0.98] text-sm"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						<span>الصفحة الرئيسية</span>
					</Link>
				</div>

				{/* Footer Info */}
				<div className="text-[10px] text-zinc-600 font-medium pt-8">
					<span>رمز الخطأ: HTTP 500 INTERNAL SERVER ERROR</span>
				</div>

			</div>
		</div>
	);
}
