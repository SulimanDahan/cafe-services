"use client";

import { RefObject } from "react";
import ModalCloseIcon from "../../icons/ModalCloseIcon";
import CameraScanIcon from "../../icons/CameraScanIcon";
import CircleCheckIcon from "../../icons/CircleCheckIcon";
import CircleErrorIcon from "../../icons/CircleErrorIcon";

interface QrScannerModalProps {
 isOpen: boolean;
 onClose: () => void;
 scanLoading: boolean;
 scanStep: "idle" | "scanning" | "error" | "success";
 scanErrorMsg: string;
 cameraStream: MediaStream | null;
 videoRef: RefObject<HTMLVideoElement | null>;
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
 <div className="max-w-md w-full rounded-3xl border border-white/15 bg-surface/95 backdrop-blur-xl p-6 shadow-2xl relative space-y-6 text-start">
 {/* زر الإغلاق */}
 <button
 onClick={() => !scanLoading && onClose()}
 className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
 disabled={scanLoading}
 >
 <ModalCloseIcon className="w-5 h-5" />
 </button>

 <div className="text-center">
 <h2 className="text-base font-black text-white">
 {t("orders.scanModalTitle")}
 </h2>
 <p className="text-xs text-zinc-400 mt-1">
 {t("orders.scanModalSub")}
 </p>
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
 const val = e.target.value.replace(
 /\D/g,
 "",
 );
 onPasskeyChange(val);
 }}
 placeholder={t(
 "orders.inputPasskeyPlaceholder",
 )}
 className="w-full text-center bg-background border border-white/10 text-primary-light font-extrabold tracking-widest rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:border-primary transition-all block"
 />
 </div>
 )}

 {/* منطقة عرض الكاميرا وحالة الفحص */}
 <div className="relative mx-auto h-48 w-48 rounded-2xl border border-white/10 bg-background overflow-hidden flex flex-col items-center justify-center shadow-inner">
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
 {scanStep === "scanning" && (
 <div className="absolute left-1 right-1 h-0.5 bg-red-500 shadow-md shadow-red-500/80 animate-laser z-20" />
 )}

 {/* الحالة الافتراضية بدون كاميرا */}
 {scanStep === "idle" && !cameraStream && (
 <CameraScanIcon className="w-12 h-12 text-zinc-600 animate-pulse z-10" />
 )}

 {/* جاري فك وتفسير الكود */}
 {scanStep === "scanning" && !cameraStream && (
 <div className="text-center space-y-2 z-10">
 <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
 <p className="text-[10px] text-primary-hover font-bold">
 {t("orders.decoding")}
 </p>
 </div>
 )}

 {/* نجاح عملية التحقق */}
 {scanStep === "success" && (
 <div className="text-center space-y-1.5 z-30 text-green-400 transition- duration-300 bg-background/80 p-3 rounded-xl backdrop-blur-sm">
 <CircleCheckIcon className="w-10 h-10 mx-auto" />
 <p className="text-[10px] font-black">
 {t("orders.verified")}
 </p>
 </div>
 )}

 {/* فشل عملية التحقق */}
 {scanStep === "error" && (
 <div className="text-center space-y-1.5 z-30 text-red-400 transition- bg-background/80 p-3 rounded-xl backdrop-blur-sm">
 <CircleErrorIcon className="w-10 h-10 mx-auto" />
 <p className="text-[10px] font-black">
 {t("orders.failed")}
 </p>
 </div>
 )}
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
