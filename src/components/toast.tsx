"use client";

import { useLanguage } from "@/config/i18n";
import ToastSuccessIcon from "./icons/ToastSuccessIcon";
import ToastErrorIcon from "./icons/ToastErrorIcon";
import ToastWarningIcon from "./icons/ToastWarningIcon";
import ToastInfoIcon from "./icons/ToastInfoIcon";

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
 icon: <ToastSuccessIcon className="w-5 h-5" />,
 },
 error: {
 bg: "bg-red-500/10 border-red-500/20 text-red-400",
 icon: <ToastErrorIcon className="w-5 h-5" />,
 },
 warning: {
 bg: "bg-primary/10 border-primary/20 text-primary-hover",
 icon: <ToastWarningIcon className="w-5 h-5" />,
 },
 info: {
 bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
 icon: <ToastInfoIcon className="w-5 h-5" />,
 },
 };

 const currentConfig = configs[type];

 return (
 <div
 className={`fixed bottom-6 ${isRtl ? "left-6" : "right-6"} z-100 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5`}
 >
 <div
 className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md shadow-2xl ${currentConfig.bg}`}
 >
 <span className="shrink-0">{currentConfig.icon}</span>
 <span className="text-sm font-bold">{message}</span>
 </div>
 </div>
 );
};
