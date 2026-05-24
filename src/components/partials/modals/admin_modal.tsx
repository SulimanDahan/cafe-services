"use client";

import { ReactNode } from "react";
import { useLanguage } from "@/config/i18n";
import { CloseIcon } from "@/components/icons";

interface AdminModalProps {
	/** Controls whether the modal is visible */
	isOpen: boolean;
	/** Callback function triggered when close action is requested */
	onClose: () => void;
	/** Optional title displayed at the top of the modal */
	title?: string;
	/** Content of the modal */
	children: ReactNode;
	/** Optional max-width class override (defaults to 'max-w-md') */
	maxWidth?: string;
}

/**
 * Premium Reusable Admin Modal overlay component.
 * Implements Material Design 3 and glassmorphic styling conventions.
 * Inherits and applies global bilingual RTL/LTR directionality.
 */
export default function AdminModal({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = "max-w-md",
}: AdminModalProps) {
	const { isRtl } = useLanguage();

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
			dir={isRtl ? "rtl" : "ltr"}
		>
			<div className="flex min-h-full items-center justify-center p-4">
				<div
					className={`${maxWidth} w-full rounded-3xl border border-white/10 bg-surface/95 backdrop-blur-xl p-6 shadow-2xl relative text-start`}
				>
					{/* Close Button */}
					<button
						onClick={onClose}
						className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors cursor-pointer`}
					>
						<CloseIcon className="w-5 h-5" />
					</button>

					{/* Modal Title */}
					{title && (
						<h2 className="text-lg font-black text-white mb-4">
							{title}
						</h2>
					)}

					{/* Modal Content */}
					{children}
				</div>
			</div>
		</div>
	);
}
