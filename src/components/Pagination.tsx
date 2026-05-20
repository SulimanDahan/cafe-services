"use client";

import { useLanguage } from "@/config/i18n";

interface PaginationProps {
	/** Current active 1-based page index */
	currentPage: number;
	/** Total number of pages */
	totalPages: number;
	/** Callback function triggered when page changes */
	onPageChange: (page: number) => void;
	/** Total count of items across all pages */
	totalItems: number;
	/** Number of items displayed per page */
	itemsPerPage: number;
}

/**
 * Reusable Pagination Component.
 * Integrates glassmorphism aesthetics, responsive mobile adaptations,
 * and RTL/LTR internationalization alignment.
 */
export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	totalItems,
	itemsPerPage,
}: PaginationProps) {
	const { t, isRtl } = useLanguage();

	if (totalPages <= 1) return null;

	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;
		
		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show page 1, current page with surrounding, and final page
			pages.push(1);
			
			let start = Math.max(2, currentPage - 1);
			let end = Math.min(totalPages - 1, currentPage + 1);
			
			if (currentPage <= 2) {
				end = 4;
			} else if (currentPage >= totalPages - 1) {
				start = totalPages - 3;
			}
			
			if (start > 2) {
				pages.push("...");
			}
			
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
			
			if (end < totalPages - 1) {
				pages.push("...");
			}
			
			pages.push(totalPages);
		}
		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 text-zinc-400">
			{/* Showing info */}
			<div className="text-xs font-bold select-none order-2 sm:order-1">
				{t("common.showing")} <span className="text-amber-400">{startItem}</span> {t("common.to")}{" "}
				<span className="text-amber-400">{endItem}</span> {t("common.of")}{" "}
				<span className="text-white font-black">{totalItems}</span> {t("common.entries")}
			</div>

			{/* Pagination Controls */}
			<div className="flex items-center gap-1.5 order-1 sm:order-2">
				{/* Previous Button */}
				<button
					type="button"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className={`flex items-center justify-center p-2 rounded-full border border-white/5 transition-all duration-300 cursor-pointer ${
						currentPage === 1
							? "opacity-40 cursor-not-allowed"
							: "bg-[#131522]/50 hover:bg-white/5 hover:text-white active:scale-95"
					}`}
					title={t("common.previous")}
				>
					<svg
						className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				{/* Page Numbers */}
				<div className="flex items-center gap-1">
					{getPageNumbers().map((page, idx) => {
						if (page === "...") {
							return (
								<span
									key={`dots-${idx}`}
									className="px-2.5 py-1 text-xs font-bold text-zinc-600 select-none"
								>
									...
								</span>
							);
						}

						const isSelected = page === currentPage;
						return (
							<button
								key={`page-${page}`}
								type="button"
								onClick={() => onPageChange(Number(page))}
								className={`min-w-8 h-8 px-2 rounded-full text-xs font-black transition-all duration-300 cursor-pointer flex items-center justify-center ${
									isSelected
										? "bg-amber-500 text-[#07080a] shadow-lg shadow-amber-500/20 scale-105"
										: "bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white active:scale-95"
								}`}
							>
								{page}
							</button>
						);
					})}
				</div>

				{/* Next Button */}
				<button
					type="button"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className={`flex items-center justify-center p-2 rounded-full border border-white/5 transition-all duration-300 cursor-pointer ${
						currentPage === totalPages
							? "opacity-40 cursor-not-allowed"
							: "bg-[#131522]/50 hover:bg-white/5 hover:text-white active:scale-95"
					}`}
					title={t("common.next")}
				>
					<svg
						className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
	);
}
