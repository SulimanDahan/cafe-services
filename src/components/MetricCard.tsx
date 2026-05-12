"use client";

import { ReactNode } from "react";

interface MetricCardProps {
	/** Metric card title */
	title: string;
	/** Main display value (number, text, etc.) */
	value: string | number;
	/** Optional highlight style flag */
	highlight?: boolean;
	/** Optional custom SVG or React element icon wrapper */
	icon?: ReactNode;
}

/**
 * Premium glassmorphic metric card display block conforming to Material You layout guidelines.
 */
export default function MetricCard({ title, value, highlight = false, icon }: MetricCardProps) {
	return (
		<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 flex items-center justify-between shadow-md">
			<div className="space-y-2">
				<span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
					{title}
				</span>
				<span
					className={`text-2xl sm:text-3xl font-black block ${
						highlight ? "text-amber-400 animate-pulse" : "text-white"
					}`}
				>
					{value}
				</span>
			</div>
			{icon && (
				<div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
					{icon}
				</div>
			)}
		</div>
	);
}
