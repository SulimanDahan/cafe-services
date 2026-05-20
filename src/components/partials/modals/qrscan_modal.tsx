"use client";

import { RefObject } from "react";

interface QrScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    scanLoading: boolean;
    scanStep: "idle" | "scanning" | "error" | "success";
    scanErrorMsg: string;
    cameraStream: MediaStream | null;
    videoRef: RefObject<HTMLVideoElement | null>;
    onSimulateScan: (roomId: string, tableName: string) => void;
    t: (key: string) => string;
    isRtl: boolean;
    forcePasskeySetting: boolean;
    enteredPasskey: string;
    onPasskeyChange: (val: string) => void;
}

export default function QrScannerModal({
    isOpen,
    onClose,
    scanLoading,
    scanStep,
    scanErrorMsg,
    cameraStream,
    videoRef,
    onSimulateScan,
    t,
    isRtl,
    forcePasskeySetting,
    enteredPasskey,
    onPasskeyChange,
}: QrScannerModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fade-in" 
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative space-y-6 text-start">
                    {/* زر الإغلاق */}
                    <button 
                        onClick={() => !scanLoading && onClose()} 
                        className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer" 
                        disabled={scanLoading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="text-center">
                        <h2 className="text-base font-black text-white">{t("orders.scanModalTitle")}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{t("orders.scanModalSub")}</p>
                    </div>

                    {/* Passkey Input Field */}
                    {forcePasskeySetting && (
                        <div className="space-y-1.5 px-4">
                            <label 
                                htmlFor="modalPasskeyIn" 
                                className="text-xs font-bold text-zinc-400 block text-center"
                            >
                                {t("orders.inputPasskeyLabel")}
                            </label>
                            <input
                                id="modalPasskeyIn"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={enteredPasskey}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    onPasskeyChange(val);
                                }}
                                placeholder={t("orders.inputPasskeyPlaceholder")}
                                className="w-full text-center bg-[#07080a] border border-white/10 text-amber-300 font-extrabold tracking-widest rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:border-amber-500 transition-all block"
                            />
                        </div>
                    )}

                    {/* منطقة عرض الكاميرا وحالة الفحص */}
                    <div className="relative mx-auto h-48 w-48 rounded-2xl border border-white/10 bg-[#07080a] overflow-hidden flex flex-col items-center justify-center shadow-inner">
                        <video 
                            ref={videoRef} 
                            id="scannerVideo" 
                            playsInline 
                            muted 
                            autoPlay 
                            className={`absolute inset-0 w-full h-full object-cover z-0 ${cameraStream ? "block" : "hidden"}`} 
                        />

                        {/* زوايا إطار المسح الافتراضي */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-green-400 rounded-tl-md z-10" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-green-400 rounded-tr-md z-10" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-green-400 rounded-bl-md z-10" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-green-400 rounded-br-md z-10" />

                        {/* خط الليزر المتحرك أثناء البحث */}
                        {scanStep === "scanning" && <div className="absolute left-1 right-1 h-0.5 bg-red-500 shadow-md shadow-red-500/80 animate-laser z-20" />}

                        {/* الحالة الافتراضية بدون كاميرا */}
                        {scanStep === "idle" && !cameraStream && (
                            <svg className="w-12 h-12 text-zinc-600 animate-pulse z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        )}

                        {/* جاري فك وتفسير الكود */}
                        {scanStep === "scanning" && !cameraStream && (
                            <div className="text-center space-y-2 z-10">
                                <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
                                <p className="text-[10px] text-amber-400 font-bold">{t("orders.decoding")}</p>
                            </div>
                        )}

                        {/* نجاح عملية التحقق */}
                        {scanStep === "success" && (
                            <div className="text-center space-y-1.5 z-30 text-green-400 scale-110 transition-transform duration-300 bg-[#07080a]/80 p-3 rounded-xl backdrop-blur-sm">
                                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-[10px] font-black">{t("orders.verified")}</p>
                            </div>
                        )}

                        {/* فشل عملية التحقق */}
                        {scanStep === "error" && (
                            <div className="text-center space-y-1.5 z-30 text-red-400 scale-105 transition-transform bg-[#07080a]/80 p-3 rounded-xl backdrop-blur-sm">
                                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-[10px] font-black">{t("orders.failed")}</p>
                            </div>
                        )}
                    </div>

                    {/* خيارات محاكاة المسح للطاولات */}
                    <div className="space-y-2.5">
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block text-center">{t("orders.simulatedScanSub")}</span>
                        <div className="grid grid-cols-1 gap-2">
                            <button 
                                type="button" 
                                disabled={scanLoading} 
                                onClick={() => onSimulateScan("rm1", "VIP 1")} 
                                className="p-3.5 rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-between gap-3 group cursor-pointer"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white group-hover:text-amber-300">{t("orders.qrVip1")}</p>
                                    <p className="text-[10px] text-green-400 font-bold">{t("orders.qrVip1Desc")}</p>
                                </div>
                                <span className="text-xs font-black text-zinc-400 uppercase font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{t("orders.btnScanCode")}</span>
                            </button>

                            <button 
                                type="button" 
                                disabled={scanLoading} 
                                onClick={() => onSimulateScan("rm2", isRtl ? "طاولة عائلية 4" : "Family Table 4")} 
                                className="p-3.5 rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-between gap-3 group cursor-pointer"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white group-hover:text-amber-300">{t("orders.qrTable4")}</p>
                                    <p className="text-[10px] text-zinc-400 font-semibold">{t("orders.qrTable4Desc")}</p>
                                </div>
                                <span className="text-xs font-black text-zinc-400 uppercase font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{t("orders.btnScanCode")}</span>
                            </button>

                            <button 
                                type="button" 
                                disabled={scanLoading} 
                                onClick={() => onSimulateScan("rm3", isRtl ? "طاولة ثنائية 2" : "Double Table 2")} 
                                className="p-3.5 rounded-2xl bg-[#0d0f17] border border-white/10 hover:border-amber-500/40 text-left transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-between gap-3 group cursor-pointer"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white group-hover:text-amber-300">{t("orders.qrTable2")}</p>
                                    <p className="text-[10px] text-zinc-400 font-semibold">{t("orders.qrTable2Desc")}</p>
                                </div>
                                <span className="text-xs font-black text-zinc-400 uppercase font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{t("orders.btnScanCode")}</span>
                            </button>
                        </div>
                    </div>

                    {/* رسائل التنبيه والخطأ */}
                    {scanErrorMsg && (
                        <div className="p-4 rounded-2xl bg-[#1e0a0a] border border-red-500/25 text-red-300 text-xs font-medium leading-relaxed">
                            {scanErrorMsg}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}