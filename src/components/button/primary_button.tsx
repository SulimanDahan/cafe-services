"use client";

import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

export const PrimaryButton = ({
	children,
	variant = "primary",
	size = "lg",
	fullWidth = false,
	className = "",
	...props
}: PrimaryButtonProps) => {
	const baseStyles =
		"rounded-full font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

	const sizes = {
		sm: "px-4 py-2 text-xs",
		md: "px-5 py-2.5 text-[11px] sm:text-xs",
		lg: "px-6 py-3 text-sm",
	};

	const variants = {
		primary:
			"bg-primary hover:bg-primary-hover text-background shadow-primary/20",
		secondary:
			"bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:text-white",
		outline:
			"bg-transparent border border-primary/50 text-primary hover:bg-primary/10",
	};

	return (
		<button
			className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : "w-fit"} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

