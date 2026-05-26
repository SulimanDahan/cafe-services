"use client";

import Image from "next/image";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { LogoIcon, PrintIcon } from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import RoomModel from "@/models/data_models/room_model";

interface PrintQrModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRoom: RoomModel | null;
    isGeneratingQr: boolean;
    previewQrUrl: string;
}

export default function PrintQrModal({
    isOpen,
    onClose,
    selectedRoom,
    isGeneratingQr,
    previewQrUrl,
}: PrintQrModalProps) {
    const { t } = useLanguage();

    if (!selectedRoom) return null;

    const handlePrintLabel = () => {
        window.print();
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("reservations.stickerTitle")}
        >
            <div className="space-y-6">
                <p className="text-xs text-zinc-400 -mt-2 text-center">
                    {t("reservations.stickerSub")}
                </p>

                <div
                    id="printable-sticker"
                    className="mx-auto w-72 rounded-3xl border border-primary/30 bg-background p-6 text-center space-y-5 shadow-xl relative overflow-hidden flex flex-col items-center justify-center"
                >
                    <div className="flex items-center justify-center gap-2 header-group">
                        <div className="h-10 w-10 flex items-center justify-center logo-container">
                            <LogoIcon className="w-full h-full sticker-logo drop-shadow-md text-primary" />
                        </div>
                        <div className="text-left font-black tracking-wide leading-none text-white cafe-text-group">
                            <p className="text-[10px] cafe-name">
                                {t("reservations.stickerCafe")}
                            </p>
                            <p className="text-[7px] text-primary-hover/90 tracking-widest uppercase mt-0.5 cafe-subtitle">
                                SERVICES
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <h3 className="text-base font-black text-white leading-tight room-name drop-shadow-sm">
                            {selectedRoom.name}
                        </h3>
                    </div>

                    <div className="relative h-44 w-44 bg-white rounded-2xl p-2 shadow-inner flex items-center justify-center border border-white/10 qr-container">
                        {isGeneratingQr ? (
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                            previewQrUrl && (
                                <Image
                                    src={previewQrUrl}
                                    alt={`${selectedRoom.name} QR Code`}
                                    width={500}
                                    height={500}
                                    className="h-full w-full object-contain"
                                    unoptimized
                                />
                            )
                        )}
                    </div>

                    <div className="space-y-1 mt-1">
                        <p className="text-[10px] font-black text-primary-hover uppercase tracking-wide footer-title">
                            {t("reservations.stickerScan")}
                        </p>
                        <p className="text-[8px] text-zinc-500 leading-normal max-w-50 mx-auto footer-desc">
                            {t("reservations.stickerScanDesc")}
                        </p>
                    </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 text-sm">
                    <PrimaryButton
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                    >
                        {t("reservations.btnDismissPreview")}
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={handlePrintLabel}
                        disabled={isGeneratingQr || !previewQrUrl}
                        size="md"
                    >
                        <PrintIcon className="w-4 h-4" />
                        <span>{t("reservations.btnPrintLabel")}</span>
                    </PrimaryButton>
                </div>
            </div>
        </AdminModal>
    );
}
