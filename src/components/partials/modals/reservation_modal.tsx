"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations/reservation";
import { useLanguage } from "@/config/i18n";
import { InputField } from "../../input";
import { RESERVATION_USER_API_ROUTE } from "@/config/api_routes";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rooms: { id: string; name: string; is_disable: boolean }[];
    onSuccess: () => void;
}

export const BookingModal = ({
    isOpen,
    onClose,
    rooms,
    onSuccess,
}: BookingModalProps) => {
    const { t, isRtl } = useLanguage();

    interface ReservationFormValues {
        client_name: string;
        phone: string;
        room_id: string;
        date_time: string;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ReservationFormValues>({
        resolver: zodResolver(reservationSchema) as unknown as Resolver<ReservationFormValues>,
        defaultValues: {
            client_name: "",
            phone: "",
            room_id: rooms[0]?.id || "",
            date_time: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                client_name: "",
                phone: "",
                room_id: rooms[0]?.id || "",
                date_time: "",
            });
        }
    }, [isOpen, rooms, reset]);

    if (!isOpen) return null;

    const handleFormSubmit = async (data: ReservationFormValues) => {
        try {
            const res = await fetch(RESERVATION_USER_API_ROUTE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_name: data.client_name,
                    phone: data.phone,
                    room_id: data.room_id,
                    date_time: data.date_time
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                console.error("Booking failed");
            }
        } catch (err) {
            console.error("Booking error:", err);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 p-6 shadow-2xl relative text-start">
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

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                        <div>
                            <InputField
                                label={t("home.formClientName")}
                                {...register("client_name")}
                            />
                            {errors.client_name?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.client_name.message)}</p>
                            )}
                        </div>
                        <div>
                            <InputField
                                label={t("home.formPhone")}
                                type="tel"
                                {...register("phone")}
                            />
                            {errors.phone?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.phone.message)}</p>
                            )}
                        </div>
                        <div>
                            <InputField
                                label={t("home.formDateTime")}
                                type="datetime-local"
                                {...register("date_time")}
                            />
                            {errors.date_time?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.date_time.message)}</p>
                            )}
                        </div>
                        <div>
                            <InputField
                                label={t("home.formAssignedRoom")}
                                isSelect
                                options={rooms.filter((r) => !r.is_disable)}
                                {...register("room_id")}
                            />
                            {errors.room_id?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.room_id.message)}</p>
                            )}
                        </div>

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
        </div>
    );
};
