"use client";

import { useState } from "react";
import { useLanguage } from "@/config/i18n";
import { InputField } from "../../input";
// import { InputField } from "@/components/ui/InputField";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rooms: any[];
    onSuccess: () => void;
}

export const BookingModal = ({
    isOpen,
    onClose,
    rooms,
    onSuccess,
}: BookingModalProps) => {
    const { t, isRtl } = useLanguage();
    const [bookClientName, setBookClientName] = useState("");
    const [bookPhone, setBookPhone] = useState("");
    const [bookDateTime, setBookDateTime] = useState("");
    const [bookRoomId, setBookRoomId] = useState(rooms[0]?.id || "");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !bookClientName.trim() ||
            !bookPhone.trim() ||
            !bookDateTime ||
            !bookRoomId
        )
            return;

        const selectedRoom = rooms.find((r) => r.id === bookRoomId);

        const newRes = {
            id: `res-${Date.now()}`,
            number: `R-${Math.floor(1000 + Math.random() * 9000)}`,
            client_name: bookClientName,
            phone: bookPhone,
            datetime: new Date(bookDateTime).toLocaleString(
                isRtl ? "ar-SA" : "en-US",
            ),
            room_id: bookRoomId,
            room_name: selectedRoom?.name,
            accepted: false,
        };

        const existing = JSON.parse(
            localStorage.getItem("cafe_reservations") || "[]",
        );
        localStorage.setItem(
            "cafe_reservations",
            JSON.stringify([newRes, ...existing]),
        );

        // إشعار بقية أجزاء النظام بالتحديث
        window.dispatchEvent(new CustomEvent("reservations-updated"));

        // إعادة ضبط الحقول وإغلاق المودال
        setBookClientName("");
        setBookPhone("");
        setBookDateTime("");
        onSuccess();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors`}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <h2 className="text-xl font-black text-white mb-6 pr-6">
                    {t("home.modalBookTitle")}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label={t("home.formClientName")}
                        value={bookClientName}
                        onChange={(e) => setBookClientName(e.target.value)}
                        required
                    />
                    <InputField
                        label={t("home.formPhone")}
                        type="tel"
                        value={bookPhone}
                        onChange={(e) => setBookPhone(e.target.value)}
                        required
                    />
                    <InputField
                        label={t("home.formDateTime")}
                        type="datetime-local"
                        value={bookDateTime}
                        onChange={(e) => setBookDateTime(e.target.value)}
                        required
                    />
                    <InputField
                        label={t("home.formAssignedRoom")}
                        isSelect
                        options={rooms.filter((r) => !r.is_disable)}
                        value={bookRoomId}
                        onChange={(e) => setBookRoomId(e.target.value)}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-full text-xs font-bold text-zinc-400 hover:text-white transition-all"
                        >
                            {t("common.cancel")}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-full bg-amber-500 text-[#07080a] text-sm font-extrabold transition-all shadow-lg hover:bg-amber-400 shadow-amber-500/20"
                        >
                            {t("home.btnSubmitBooking")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
