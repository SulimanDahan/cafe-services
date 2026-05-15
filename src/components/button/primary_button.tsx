"use client";

import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    fullWidth?: boolean;
}

export const PrimaryButton = ({
    children,
    variant = "primary",
    fullWidth = false,
    className = "",
    ...props
}: PrimaryButtonProps) => {
    // تعريف الأنماط بناءً على الـ Variant
    const baseStyles =
        "px-6 py-3 rounded-full font-extrabold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary:
            "bg-amber-500 hover:bg-amber-400 text-[#07080a] shadow-amber-500/20",
        secondary:
            "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10",
        outline:
            "bg-transparent border border-amber-500/50 text-amber-500 hover:bg-amber-500/10",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : "w-fit"} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
