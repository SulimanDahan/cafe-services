import Link from "next/link";

/**
 * Premium 404 Not Found Page.
 * Styled in high-contrast Material You Dark Spec with zero emojis and clean SVGs.
 */
export default function NotFound() {
	return (
		<div className="min-h-screen bg-[#07080a] text-zinc-100 font-sans flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black relative overflow-hidden">
			{/* Ambient Glowing Graphics */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

			<div className="w-full max-w-md text-center relative z-10 space-y-8 animate-fadeIn">
				
				{/* 404 Glowing Number Graphic */}
				<div className="relative inline-block">
					<span className="text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-amber-400 to-amber-600 drop-shadow-lg tracking-widest block select-none">
						404
					</span>
					{/* Underline styling */}
					<div className="h-1.5 w-16 bg-amber-500 rounded-full mx-auto mt-2" />
				</div>

				{/* Error text block */}
				<div className="space-y-3">
					<h1 className="text-2xl font-black text-white">
						الصفحة غير موجودة
					</h1>
					<p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
						عذراً، الصفحة التي تبحث عنها غير موجودة، قد يكون الرابط خاطئاً أو تم حذف الصفحة أو نقلها لموقع آخر.
					</p>
				</div>

				{/* Action Button with Clean SVG Arrow */}
				<div className="pt-4">
					<Link
						href="/"
						className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-[#07080a] font-bold px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] text-sm"
					>
						<svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
						<span>العودة إلى الصفحة الرئيسية</span>
					</Link>
				</div>

				{/* Footer Info */}
				<div className="text-[10px] text-zinc-600 font-medium pt-8">
					<span>رمز الخطأ: HTTP 404 NOT FOUND</span>
				</div>

			</div>
		</div>
	);
}
