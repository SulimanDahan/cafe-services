"use client";

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
        <>
            {/* Print-specific styles scoped to this modal */}
            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4 portrait;
                        padding: 0;
                    }
                    html, body {
                        background-color: #07080a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    /* Hide the main application layout and anything marked no-print */
                    #admin-layout-root, .no-print {
                        display: none !important;
                    }
                    /* Hide the modal's shell visually */
                    body * {
                        visibility: hidden !important;
                    }
                    /* Reset ALL parent paddings and flex centerings that push the sticker down */
                    .fixed.inset-0,
                    .fixed.inset-0 > div,
                    .fixed.inset-0 > div > div {
                        padding: 0 !important;
                        margin: 0 !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                    }
                    /* Make the sticker and its children visible */
                    #printable-sticker,
                    #printable-sticker * {
                        visibility: visible !important;
                    }
                    /* Center the sticker on the full page */
                    #printable-sticker {
                        top: 0 !important;
                        left: 0 !important;
                        margin: 0 !important;
                        margin-right: -0.8cm !important;
                        width: 100% !important;
                        height: 100vh !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background-color: #07080a !important;
                        border: none !important;
                        border-radius: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        overflow: hidden !important; /* Prevent generating extra pages if margin spills */
                    }
                    #printable-sticker .header-group {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        gap: 0.2cm !important;
                        margin-bottom: 0.5cm !important;
                    }
                    #printable-sticker .logo-container {
                        width: 6cm !important;
                        height: 6cm !important;
                    }
                    #printable-sticker .cafe-name {
                        font-size: 26pt !important;
                        text-align: center !important;
                        line-height: 1.2 !important;
                    }
                    #printable-sticker .cafe-subtitle {
                        display: none !important;
                    }
                    #printable-sticker .room-name {
                        font-size: 42pt !important;
                        text-align: center !important;
                        margin-top: 1cm !important;
                        margin-bottom: 1cm !important;
                    }
                    /* QR code container — white background required for scanning */
                    #printable-sticker .qr-container {
                        width: 14cm !important;
                        height: 14cm !important;
                        padding: 0.5cm !important;
                        border-radius: 0.8cm !important;
                        background: #ffffff !important;
                        border: none !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        flex-shrink: 0 !important;
                        margin-bottom: 1cm !important;
                    }
                    #printable-sticker .qr-container img {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: contain !important;
                        display: block !important;
                    }
                    #printable-sticker .footer-title {
                        font-size: 18pt !important;
                        text-align: center !important;
                        color: #fbbf24 !important;
                        margin-bottom: 0.2cm !important;
                    }
                    #printable-sticker .footer-desc {
                        font-size: 13pt !important;
                        text-align: center !important;
                        max-width: 15cm !important;
                        line-height: 1.4 !important;
                        color: #a1a1aa !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <AdminModal
                isOpen={isOpen}
                onClose={onClose}
                title={t("reservations.stickerTitle")}
            >
                <div className="space-y-6">
                    <p className="text-xs text-zinc-400 -mt-2 text-center print:hidden">
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
                                <p className="text-[10px] cafe-name print:hidden">
                                    {t("reservations.stickerCafe")}
                                </p>
                                <p className="text-[7px] text-primary-hover/90 tracking-widest uppercase mt-0.5 cafe-subtitle print:hidden">
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
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={previewQrUrl}
                                        alt={`${selectedRoom.name} QR Code`}
                                        className="h-full w-full object-contain"
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

                    <div className="pt-2 flex justify-end gap-2 text-sm no-print">
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
        </>
    );
}
