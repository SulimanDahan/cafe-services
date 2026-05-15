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
            className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#07080a] p-6 text-center select-none"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
            <div className="max-w-md w-full rounded-3xl border border-amber-500/20 bg-[#131522] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="h-16 w-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-2xl">
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
                    className="w-full py-3 rounded-full bg-amber-500 text-[#07080a] font-black text-xs hover:bg-amber-600 transition-colors cursor-pointer active:scale-95"
                >
                    {buttonText}
                </PrimaryButton>
            </div>
        </div>
    );
}
