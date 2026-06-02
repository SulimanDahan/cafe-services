"use client";

import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations/reservation";
import { useLanguage } from "@/config/i18n";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import { RESERVATION_USER_API_ROUTE } from "@/config/api_routes";
import ModalCloseIcon from "@/components/icons/ModalCloseIcon";

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

    const getTodayDate = () => {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${d.getFullYear()}-${month}-${day}`;
    };

    interface ReservationFormValues {
        client_name: string;
        phone: string;
        room_id: string;
        date_time: string;
    }

    const activeRooms = useMemo(() => {
        return rooms.filter((r) => !r.is_disable);
    }, [rooms]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ReservationFormValues>({
        resolver: zodResolver(
            reservationSchema,
        ) as unknown as Resolver<ReservationFormValues>,
        defaultValues: {
            client_name: "",
            phone: "",
            room_id: activeRooms.length > 0 ? activeRooms[0].id : "",
            date_time: getTodayDate(),
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                client_name: "",
                phone: "",
                room_id: activeRooms.length > 0 ? activeRooms[0].id : "",
                date_time: getTodayDate(),
            });
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, reset]);

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
                    date_time: data.date_time,
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Booking failed:", errorData);
                alert(errorData.error || errorData.details || "Booking failed");
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert(
                "Booking error: " +
                (err instanceof Error ? err.message : String(err)),
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="max-w-md w-full rounded-3xl border border-white/15 bg-surface/95 p-6 shadow-2xl relative text-start">
                    <button
                        onClick={onClose}
                        className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors`}
                    >
                        <ModalCloseIcon className="w-5 h-5" />
                    </button>

                    <h2 className="text-xl font-black text-white mb-6 pr-6">
                        {t("home.modalBookTitle")}
                    </h2>

                    <form
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className="space-y-4"
                    >
                        <div>
                            <InputField
                                label={t("home.formClientName")}
                                {...register("client_name")}
                            />
                            {errors.client_name?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">
                                    {t(String(errors.client_name.message))}
                                </p>
                            )}
                        </div>
                        <div>
                            <InputField
                                label={t("home.formPhone")}
                                type="tel"
                                {...register("phone")}
                            />
                            {errors.phone?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">
                                    {t(String(errors.phone.message))}
                                </p>
                            )}
                        </div>
                        <div>
                            <InputField
                                label={t("home.formDateTime")}
                                type="date"
                                {...register("date_time")}
                            />
                            {errors.date_time?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">
                                    {t(String(errors.date_time.message))}
                                </p>
                            )}
                        </div>
                        <div>
                            <InputField
                                label={t("home.formAssignedRoom")}
                                isSelect
                                options={activeRooms}
                                {...register("room_id")}
                            />
                            {errors.room_id?.message && (
                                <p className="text-[10px] text-red-400 font-medium mt-1">
                                    {t(String(errors.room_id.message))}
                                </p>
                            )}
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <PrimaryButton
                                type="button"
                                onClick={onClose}
                                variant="secondary"
                                size="md"
                            >
                                {t("common.cancel")}
                            </PrimaryButton>
                            <PrimaryButton type="submit" size="md">
                                {t("home.btnSubmitBooking")}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
