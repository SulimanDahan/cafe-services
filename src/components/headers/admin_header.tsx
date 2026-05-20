"use client";

import { ReactNode } from "react";

interface AdminHeaderProps {
	/** Section title */
	title: string;
	/** Short description/subtitle below the title */
	subtitle?: string;
	/** Optional actions (e.g. Add Button) on the left side of header */
	children?: ReactNode;
}

/**
 * Premium Admin Page Header Component.
 * Implements the Material Design 3 layout for section titles and action prompts.
 */
export default function AdminHeader({ title, subtitle, children }: AdminHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<div>
				<h1 className="text-2xl font-black text-white tracking-wide">{title}</h1>
				{subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
			</div>
			{children && <div className="flex items-center gap-2 w-full sm:w-auto">{children}</div>}
		</div>
	);
}
