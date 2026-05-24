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
export default function MetricCard({
 title,
 value,
 highlight = false,
 icon,
}: MetricCardProps) {
 return (
 <div className="rounded-card border border-white/10 bg-surface p-5 sm:p-6 flex flex-col justify-between shadow-md h-full gap-4 min-h-35">
 <div className="flex justify-between items-start gap-3">
 <span className="text-[11px] sm:text-[12px] font-bold text-zinc-400 uppercase tracking-wider block mt-1 line-clamp-2 flex-1">
 {title}
 </span>
 {icon && (
 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 border border-primary/30 text-primary-hover flex items-center justify-center shrink-0">
 {icon}
 </div>
 )}
 </div>
 <div className="mt-auto">
 <span
 className={`text-2xl sm:text-3xl font-black block leading-tight wrap-break-words ${
 highlight ? "text-primary-hover animate-pulse" : "text-white"
 }`}
 >
 {value}
 </span>
 </div>
 </div>
 );
}
