"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemGroupSchema, type ItemGroupInput } from "@/lib/validations/item_group";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import ItemGroupModel from "@/models/data_models/item_group_model";

interface ItemGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ItemGroupInput) => Promise<boolean>;
    editingGroup: ItemGroupModel | null;
}

export default function ItemGroupModal({
    isOpen,
    onClose,
    onSave,
    editingGroup,
}: ItemGroupModalProps) {
    const { t } = useLanguage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ItemGroupInput>({
        resolver: zodResolver(itemGroupSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({ name: editingGroup?.name || "" });
        }
    }, [isOpen, editingGroup, reset]);

    const handleFormSubmit = async (data: ItemGroupInput) => {
        const success = await onSave(data);
        if (success) {
            onClose();
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                editingGroup
                    ? t("itemGroup.modalEditTitle")
                    : t("itemGroup.addGroup")
            }
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <InputField
                    label={t("itemGroup.formNameAr")}
                    id="groupName"
                    type="text"
                    {...register("name")}
                    placeholder={t("itemGroup.placeholderNameAr")}
                    autoFocus
                />
                {errors.name?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.name.message))}
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
                        {editingGroup ? t("common.save") : t("common.add")}
                    </PrimaryButton>
                </div>
            </form>
        </AdminModal>
    );
}
