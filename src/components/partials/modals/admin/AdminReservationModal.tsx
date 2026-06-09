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
    order_passkey?: number;
}

interface AdminReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ReservationFormValues) => Promise<boolean>;
    rooms: { id: string; name: string; is_disable: boolean }[];
    initialData?: ReservationFormValues | null;
    /** Set of room IDs that currently have an active session */
    activeRoomIds?: Set<string>;
}

export default function AdminReservationModal({
    isOpen,
    onClose,
    onSave,
    rooms,
    initialData,
    activeRoomIds = new Set(),
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
                    order_passkey: initialData.order_passkey,
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

                {/* Read-only Passkey (if exists) */}
                {initialData?.order_passkey && (
                    <InputField
                        label={t("reservations.columnPasskey") || "Passkey"}
                        id="resPasskey"
                        type="text"
                        value={initialData.order_passkey.toString()}
                        readOnly
                        className="opacity-75 font-black text-amber-500 tracking-wider"
                    />
                )}

                {/* Room / Table selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                        {t("reservations.formAssignedRoom")}
                    </label>
                    <div className="relative">
                        <select
                            id="resRoom"
                            {...register("room_id")}
                            className="w-full bg-[#0d0f17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer pr-8"
                        >
                            {rooms
                                .filter((r) => !r.is_disable)
                                .map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {activeRoomIds.has(r.id) ? "🔴" : "🟢"} {r.name}
                                    </option>
                                ))}
                        </select>
                        {/* Custom dropdown arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            {t("reservations.roomAvailable") || "متاحة"}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                            {t("reservations.roomOccupied") || "مشغولة"}
                        </span>
                    </div>
                </div>
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
