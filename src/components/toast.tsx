"use client";

import { useLanguage } from "@/config/i18n";

// تعريف أنواع التنبيهات المدعومة
export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    show: boolean;
    message: string;
    type?: ToastType;
}

export const Toast = ({ show, message, type = "success" }: ToastProps) => {
    const { isRtl } = useLanguage();

    if (!show) return null;

    // إعداد الألوان والأيقونات بناءً على النوع
    const configs = {
        success: {
            bg: "bg-green-500/10 border-green-500/20 text-green-400",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        error: {
            bg: "bg-red-500/10 border-red-500/20 text-red-400",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        warning: {
            bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        info: {
            bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    };

    const currentConfig = configs[type];

    return (
        <div
            className={`fixed bottom-6 ${isRtl ? "left-6" : "right-6"} z-[100] transition-all duration-500 animate-in fade-in slide-in-from-bottom-5`}
        >
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md shadow-2xl ${currentConfig.bg}`}>
                <span className="shrink-0">{currentConfig.icon}</span>
                <span className="text-sm font-bold">{message}</span>
            </div>
        </div>
    );
};