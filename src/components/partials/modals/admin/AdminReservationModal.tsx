"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations/reservation";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";

interface ReservationFormValues {
    client_name: string;
    phone: string;
    room_id: string;
    date_time: string;
}

interface AdminReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ReservationFormValues) => Promise<boolean>;
    rooms: { id: string; name: string; is_disable: boolean }[];
    initialData?: ReservationFormValues | null;
}

export default function AdminReservationModal({
    isOpen,
    onClose,
    onSave,
    rooms,
    initialData,
}: AdminReservationModalProps) {
    const { t } = useLanguage();

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
            room_id: "",
            date_time: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    client_name: initialData.client_name,
                    phone: initialData.phone,
                    room_id: initialData.room_id,
                    date_time: initialData.date_time.split("T")[0],
                });
            } else {
                const today = new Date().toISOString().split("T")[0];
                reset({
                    client_name: "",
                    phone: "",
                    room_id: rooms.find((r) => !r.is_disable)?.id ?? "",
                    date_time: today,
                });
            }
        }
    }, [isOpen, reset, rooms, initialData]);

    const handleFormSubmit = async (data: ReservationFormValues) => {
        const success = await onSave(data);
        if (success) {
            onClose();
        }
    };

    return (
        <AdminModal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-black text-white mb-6 pr-6">
                {initialData ? t("reservations.modalEditTitle") || t("common.edit") : t("reservations.modalAddTitle")}
            </h2>
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
            >
                {/* Client Name */}
                <InputField
                    label={t("reservations.formClientName")}
                    id="resClient"
                    type="text"
                    {...register("client_name")}
                    placeholder={t("reservations.formClientPlaceholder")}
                    autoFocus
                />
                {errors.client_name?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.client_name.message))}
                    </p>
                )}

                {/* Client Phone */}
                <InputField
                    label={t("reservations.formPhone")}
                    id="resPhone"
                    type="tel"
                    {...register("phone")}
                    placeholder="77xxxxxxxx"
                />
                {errors.phone?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.phone.message))}
                    </p>
                )}

                {/* Date and Time */}
                <InputField
                    label={t("reservations.formDateTime")}
                    id="resDate"
                    type="date"
                    {...register("date_time")}
                />
                {errors.date_time?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.date_time.message))}
                    </p>
                )}

                {/* Room / Table selector */}
                <InputField
                    isSelect
                    label={t("reservations.formAssignedRoom")}
                    id="resRoom"
                    {...register("room_id")}
                    options={rooms
                        .filter((r) => !r.is_disable)
                        .map((r) => ({ id: r.id, name: r.name }))}
                />
                {errors.room_id?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.room_id.message))}
                    </p>
                )}

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
                        {t("common.save")}
                    </PrimaryButton>
                </div>
            </form>
        </AdminModal>
    );
}
