"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomSchema, type RoomInput } from "@/lib/validations/room";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import { RefreshIcon } from "@/components/icons";

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: RoomInput) => Promise<boolean>;
    rooms: { id: string; qr_code: string }[];
    onError: (msg: string) => void;
    editingRoom?: { id: string; name: string; qr_code: string } | null;
}

export default function RoomModal({
    isOpen,
    onClose,
    onSave,
    rooms,
    onError,
    editingRoom,
}: RoomModalProps) {
    const { t } = useLanguage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<RoomInput>({
        resolver: zodResolver(roomSchema) as unknown as Resolver<RoomInput>,
        defaultValues: {
            name: "",
            qr_code: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (editingRoom) {
                reset({
                    name: editingRoom.name,
                    qr_code: editingRoom.qr_code,
                });
            } else {
                reset({
                    name: "",
                    qr_code: `room-${Math.floor(100 + Math.random() * 900)}`,
                });
            }
        }
    }, [isOpen, editingRoom, reset]);

    const handleGenerateNewQr = () => {
        setValue("qr_code", `room-${Math.floor(100 + Math.random() * 900)}`, {
            shouldValidate: true,
        });
    };

    const handleFormSubmit = async (data: RoomInput) => {
        const lowerToken = data.qr_code.trim().toLowerCase();

        // Validate QR code uniqueness client-side
        const isTokenDuplicate = rooms.some(
            (r) =>
                r.qr_code.toLowerCase() === lowerToken &&
                (!editingRoom || r.id !== editingRoom.id),
        );
        if (isTokenDuplicate) {
            onError(t("reservations.errDuplicateQr"));
            return;
        }

        const success = await onSave({ ...data, qr_code: lowerToken });

        if (success) {
            onClose();
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                editingRoom
                    ? t("common.edit") + " - " + editingRoom.name
                    : t("reservations.modalAddPhysTitle")
            }
        >
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
            >
                {/* Room Name */}
                <InputField
                    label={t("reservations.formRoomName")}
                    id="rName"
                    type="text"
                    {...register("name")}
                    placeholder={t("reservations.formRoomPlaceholder")}
                    autoFocus
                />
                {errors.name?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.name.message))}
                    </p>
                )}

                {/* QR Token */}
                <div className="space-y-1">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <InputField
                                label={t("reservations.formQrToken")}
                                id="rToken"
                                type="text"
                                {...register("qr_code")}
                                placeholder="e.g. table7"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateNewQr}
                            className="h-11.5 w-11.5 flex items-center justify-center shrink-0 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title={
                                t("reservations.btnGenerateNewQr") ||
                                "Generate New QR"
                            }
                        >
                            <RefreshIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {errors.qr_code?.message ? (
                        <p className="text-[10px] text-red-400 font-medium mt-1">
                            {t(String(errors.qr_code.message))}
                        </p>
                    ) : (
                        <p className="text-[10px] text-zinc-500 leading-normal font-medium mt-1">
                            {t("reservations.formQrTokenDesc")}
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
                        {editingRoom
                            ? t("common.save")
                            : t("reservations.btnSaveTable")}
                    </PrimaryButton>
                </div>
            </form>
        </AdminModal>
    );
}
