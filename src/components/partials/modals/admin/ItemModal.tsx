"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema } from "@/lib/validations/item";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import ItemModel from "@/models/data_models/item_model";
import Image from "next/image";
import { TrashIcon, CameraUploadIcon } from "@/components/icons";
import { compressImage } from "@/lib/imageUtils";

interface ItemFormValues {
    name: string;
    price: string;
    group_id: string;
    discount_percentage: string;
    discount_value: string;
}

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => Promise<boolean>;
    editingItem: ItemModel | null;
    groups: { id: string; name: string }[];
    currencyName: string;
    showImages: boolean;
}

export default function ItemModal({
    isOpen,
    onClose,
    onSave,
    editingItem,
    groups,
    currencyName,
    showImages,
}: ItemModalProps) {
    const { t } = useLanguage();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
        setValue,
    } = useForm<ItemFormValues>({
        resolver: zodResolver(
            itemSchema,
        ) as unknown as Resolver<ItemFormValues>,
        defaultValues: {
            name: "",
            price: "",
            group_id: "",
            discount_percentage: "0",
            discount_value: "0",
        },
    });

    useEffect(() => {
        if (isOpen) {
            (() => setImageFile(null))();
            (() => setRemoveImage(false))();
            if (editingItem) {
                reset({
                    name: editingItem.name,
                    price: String(editingItem.price),
                    group_id: editingItem.group_id,
                    discount_percentage: String(editingItem.discount_percentage || 0),
                    discount_value: String(editingItem.discount_value || 0),
                });
                (() => setImagePreview(editingItem.image || null))();
            } else {
                reset({
                    name: "",
                    price: "",
                    group_id: groups[0]?.id ?? "",
                    discount_percentage: "0",
                    discount_value: "0",
                });
                (() => setImagePreview(null))();
            }
        }
    }, [isOpen, editingItem, groups, reset]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file, 800, 800, 0.7);
                setImageFile(compressed);
                setRemoveImage(false);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(compressed);
            } catch (err) {
                console.error("Failed to compress image", err);
                // Fallback to original
                setImageFile(file);
                setRemoveImage(false);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFormSubmit = async (data: ItemFormValues) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("price", data.price);
        formData.append("group_id", data.group_id);
        formData.append("discount_percentage", data.discount_percentage);
        formData.append("discount_value", data.discount_value);

        if (imageFile) {
            formData.append("image", imageFile);
        }
        if (removeImage) {
            formData.append("remove_image", "true");
        }

        const success = await onSave(formData);
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
                {/* Image Upload */}
                {showImages && (
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-300">
                            {t("item.formLabelImage")}
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {imagePreview ? (
                            <div
                                className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-bold bg-black/50 px-4 py-2 rounded-full">تغيير الصورة</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                                    title="إزالة الصورة"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 rounded-2xl bg-surface-lighter/50 border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-surface-lighter transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <CameraUploadIcon className="w-7 h-7" />
                                </div>
                                <span className="text-zinc-400 text-sm font-bold">انقر هنا لاختيار أو رفع صورة</span>
                            </div>
                        )}
                    </div>
                )}

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
                    min="0"
                    {...register("price")}
                    placeholder="0"
                />
                {errors.price?.message && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">
                        {t(String(errors.price.message))}
                    </p>
                )}

                {/* Discount Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputField
                            label={t("item.formLabelDiscountPercentage")}
                            id="itemDiscountPercentage"
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            {...register("discount_percentage", {
                                onChange: (e) => {
                                    const pct = Number(e.target.value) || 0;
                                    const prc = Number(getValues("price")) || 0;
                                    setValue("discount_value", String((prc * pct) / 100));
                                }
                            })}
                            placeholder="0"
                        />
                        {errors.discount_percentage?.message && (
                            <p className="text-[10px] text-red-400 font-medium mt-1">
                                {t(String(errors.discount_percentage.message))}
                            </p>
                        )}
                    </div>
                    <div>
                        <InputField
                            label={t("item.formLabelDiscountValue")}
                            id="itemDiscountValue"
                            type="number"
                            step="1"
                            min="0"
                            {...register("discount_value", {
                                onChange: (e) => {
                                    const val = Number(e.target.value) || 0;
                                    const prc = Number(getValues("price")) || 0;
                                    if (prc > 0) {
                                        setValue("discount_percentage", String(Math.round((val / prc) * 100)));
                                    }
                                }
                            })}
                            placeholder="0"
                        />
                        {errors.discount_value?.message && (
                            <p className="text-[10px] text-red-400 font-medium mt-1">
                                {t(String(errors.discount_value.message))}
                            </p>
                        )}
                    </div>
                </div>

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
