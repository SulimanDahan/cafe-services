"use client";

import { PrimaryButton } from "@/components/button/primary_button";

interface AdminBlockOverlayProps {
 title: string;
 description: string;
 buttonText: string;
 isRtl: boolean;
}

export default function AdminBlockOverlay({
 title,
 description,
 buttonText,
 isRtl,
}: AdminBlockOverlayProps) {
 return (
 <div
 className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background p-6 text-center select-none"
 dir={isRtl ? "rtl" : "ltr"}
 >
 <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
 <div className="max-w-md w-full rounded-3xl border border-primary/20 bg-surface p-8 space-y-6 shadow-2xl relative overflow-hidden">
 <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-hover font-black text-2xl">
 ☕
 </div>
 <div className="space-y-2">
 <h2 className="text-lg font-black text-white">{title}</h2>
 <p className="text-xs text-zinc-400 leading-relaxed">
 {description}
 </p>
 </div>
 <PrimaryButton
 onClick={() => {
 window.location.href = "/admin/room";
 }}
 className="w-full py-3 rounded-full bg-primary text-background font-black text-xs hover:bg-amber-600 transition-colors cursor-pointer"
 >
 {buttonText}
 </PrimaryButton>
 </div>
 </div>
 );
}
