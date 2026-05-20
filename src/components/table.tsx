"use client";

import { ReactNode } from "react";
import { useLanguage } from "@/config/i18n";

/**
 * Interface representing a column definition in the Table.
 */
export interface TableColumn {
	/** Unique key identifier for the column */
	key: string;
	/** Display label/header title of the column */
	label: string;
	/** Alignment of the text in the column header and cells */
	align?: "left" | "right" | "center";
	/** Custom CSS classes to apply to the header cell */
	className?: string;
}

/**
 * Props for the Table component.
 */
interface TableProps {
	/** Columns definition schema */
	columns: TableColumn[];
	/** Loading state flag to display loading spinner */
	isLoading?: boolean;
	/** The number of data items currently available to determine empty state */
	dataLength: number;
	/** Custom loading text override */
	loadingText?: string;
	/** Custom empty state text override */
	noDataText?: string;
	/** The rendered table rows (tr elements) */
	children: ReactNode;
	/** Custom minimum width class for the table container (default: min-w-212.5) */
	minWidth?: string;
}

/**
 * Reusable Table Component.
 * Implements high-contrast glassmorphic design and progressive tonal surfaces.
 * Automatically aligns table header cells based on current RTL/LTR language direction,
 * and handles loading and empty datasets out-of-the-box.
 */
export default function Table({
	columns,
	isLoading = false,
	dataLength,
	loadingText,
	noDataText,
	children,
	minWidth = "min-w-212.5",
}: TableProps) {
	const { t, isRtl } = useLanguage();

	const resolvedLoadingText = loadingText || t("common.loading");
	const resolvedNoDataText = noDataText || t("common.noData");

	return (
		<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
			<table className={`${minWidth} w-full border-collapse text-sm`}>
				<thead>
					<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
						{columns.map((col) => {
							let alignClass = "";
							if (col.align === "center") {
								alignClass = "text-center";
							} else if (col.align === "left") {
								alignClass = "text-left";
							} else if (col.align === "right") {
								alignClass = "text-right";
							} else {
								alignClass = isRtl ? "text-right" : "text-left";
							}

							return (
								<th
									key={col.key}
									className={`pb-3 px-4 whitespace-nowrap ${alignClass} ${col.className || ""}`}
								>
									{col.label}
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody className="divide-y divide-white/5">
					{isLoading ? (
						<tr>
							<td colSpan={columns.length} className="py-10 text-center">
								<div className="flex flex-col items-center gap-3">
									<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
									<span className="text-xs text-zinc-500 font-bold">{resolvedLoadingText}</span>
								</div>
							</td>
						</tr>
					) : dataLength > 0 ? (
						children
					) : (
						<tr>
							<td
								colSpan={columns.length}
								className="py-10 text-center text-zinc-500 font-medium text-xs"
							>
								{resolvedNoDataText}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
