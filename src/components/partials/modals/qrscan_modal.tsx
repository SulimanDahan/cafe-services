"use client";

import React, { RefObject, useEffect, useState } from "react";
import ModalCloseIcon from "@/components/icons/ModalCloseIcon";
// import CameraScanIcon from "@/components/icons/CameraScanIcon";
// import CircleCheckIcon from "@/components/icons/CircleCheckIcon";
// import CircleErrorIcon from "@/components/icons/CircleErrorIcon";
import { InputField } from "@/components/input";

interface Room {
    id: string;
    name: string;
}

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
    rooms: Room[];
    onRoomSelect: (roomId: string) => void;
}

/**
 * QR Scanner Modal with dual-mode tab bar:
 * - Camera tab: QR scan via device camera (disabled on insecure HTTP contexts).
 * - Room tab: manual room selection dropdown as fallback.
 * Defaults to Camera tab on HTTPS, Room tab on HTTP.
 */
export default function QrScannerModal({
    isOpen,
    onClose,
    scanLoading,
    // scanStep,
    scanErrorMsg,
    // cameraStream,
    // videoRef,
    t,
    isRtl,
    forcePasskeySetting,
    enteredPasskey,
    onPasskeyChange,
    rooms,
    onRoomSelect,
}: QrScannerModalProps) {
    // Read window.isSecureContext once synchronously — safe in "use client" components
    // because this code only runs on the browser, never on the server.
    // const isSecure =
    //     typeof window !== "undefined" ? window.isSecureContext : true;

    // Initialise tab based on security context (lazy initializer runs once)
    // const [activeTab, setActiveTab] = useState<"camera" | "room">("room"
    const [activeTab,] = useState<"camera" | "room">("room"
        // isSecure ? "camera" : "room",
    );
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [roomError, setRoomError] = useState("");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            // Reset room selection when closed so next open starts fresh
            (() => setSelectedRoomId(""))();
            (() => setRoomError(""))();
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleConfirmRoom = () => {
        if (!selectedRoomId) {
            setRoomError(t("orders.errNoRoomSelected"));
            return;
        }
        setRoomError("");
        onRoomSelect(selectedRoomId);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fade-in"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border border-white/15 bg-surface/95 backdrop-blur-xl p-6 shadow-2xl relative space-y-5 text-start">
                    {/* Close button */}
                    <button
                        onClick={() => !scanLoading && onClose()}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                        disabled={scanLoading}
                    >
                        <ModalCloseIcon className="w-5 h-5" />
                    </button>

                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-base font-black text-white">
                            {t("orders.scanModalTitle")}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">
                            {t("orders.scanModalSub")}
                        </p>
                    </div>

                    {/* ── Tab Bar ── 
                    <div className="flex rounded-2xl bg-background border border-white/10 p-1 gap-1">
                        ... camera tab button ...
                        ... room tab button ...
                    </div>
                    */}

                    {/* Passkey field (shown for both tabs when forced) */}
                    {forcePasskeySetting && (
                        <div className="px-1">
                            <InputField
                                id="modalPasskeyIn"
                                label={t("orders.inputPasskeyLabel")}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={enteredPasskey}
                                onChange={(e) => {
                                    const val = (
                                        e as React.ChangeEvent<HTMLInputElement>
                                    ).target.value.replace(/\D/g, "");
                                    onPasskeyChange(val);
                                }}
                                placeholder={t(
                                    "orders.inputPasskeyPlaceholder",
                                )}
                            />
                        </div>
                    )}

                    {/* ── Camera Tab Content ── 
                    {activeTab === "camera" && (
                        ... camera content ...
                    )}
                    */}

                    {/* ── Room Tab Content ── */}
                    {activeTab === "room" && (
                        <div className="space-y-3 px-1">
                            <InputField
                                id="roomSelectDropdown"
                                label={t("orders.selectRoomLabel")}
                                isSelect
                                options={[
                                    {
                                        id: "",
                                        name: t("orders.selectRoomPlaceholder"),
                                    },
                                    ...rooms,
                                ]}
                                value={selectedRoomId}
                                onChange={(e) => {
                                    setSelectedRoomId(
                                        (
                                            e as React.ChangeEvent<HTMLSelectElement>
                                        ).target.value,
                                    );
                                    setRoomError("");
                                }}
                                disabled={scanLoading}
                            />

                            {roomError && (
                                <p className="text-[10px] text-red-400 font-medium">
                                    {roomError}
                                </p>
                            )}

                            <button
                                onClick={handleConfirmRoom}
                                disabled={scanLoading || !selectedRoomId}
                                className="w-full py-3 rounded-2xl bg-primary text-background font-extrabold text-sm hover:bg-primary-hover transition-all duration-200 shadow-lg shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {scanLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                                        <span>{t("orders.decoding")}</span>
                                    </div>
                                ) : (
                                    t("orders.btnConfirmRoom")
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error message banner */}
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
