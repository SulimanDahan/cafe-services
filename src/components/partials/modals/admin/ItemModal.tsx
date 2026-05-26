"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema } from "@/lib/validations/item";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import ItemModel from "@/models/data_models/item_model";

interface ItemFormValues {
    name: string;
    price: string;
    group_id: string;
}

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ItemFormValues) => Promise<boolean>;
    editingItem: ItemModel | null;
    groups: { id: string; name: string }[];
    currencyName: string;
}

export default function ItemModal({
    isOpen,
    onClose,
    onSave,
    editingItem,
    groups,
    currencyName,
}: ItemModalProps) {
    const { t } = useLanguage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ItemFormValues>({
        resolver: zodResolver(
            itemSchema,
        ) as unknown as Resolver<ItemFormValues>,
        defaultValues: {
            name: "",
            price: "",
            group_id: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                reset({
                    name: editingItem.name,
                    price: String(editingItem.price),
                    group_id: editingItem.group_id,
                });
            } else {
                reset({
                    name: "",
                    price: "",
                    group_id: groups[0]?.id ?? "",
                });
            }
        }
    }, [isOpen, editingItem, groups, reset]);

    const handleFormSubmit = async (data: ItemFormValues) => {
        const success = await onSave(data);
        if (success) {
            onClose();
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingItem ? t("item.modalEditTitle") : t("item.addItem")}
        >
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
            >
                {/* Item Name */}
                <InputField
                    label={t("item.formLabelNameAr")}
                    id="itemName"
                    type="text"
                    {...register("name")}
                    placeholder={t("item.formPlaceholderNameAr")}
                    autoFocus
                />
                {errors.name?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.name.message))}
                    </p>
                )}

                {/* Item Price */}
                <InputField
                    label={`${t("item.formLabelPrice")} (${t(`common.${currencyName}`) || currencyName || t("common.YER")})`}
                    id="itemPrice"
                    type="number"
                    step="1"
                    min="1"
                    {...register("price")}
                    placeholder="3500"
                />
                {errors.price?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.price.message))}
                    </p>
                )}

                {/* Item Category Selection */}
                <InputField
                    isSelect
                    label={t("item.formLabelCategory")}
                    id="itemGroup"
                    {...register("group_id")}
                    options={groups}
                />
                {errors.group_id?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.group_id.message))}
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
                        {editingItem ? t("common.save") : t("common.add")}
                    </PrimaryButton>
                </div>
            </form>
        </AdminModal>
    );
}
