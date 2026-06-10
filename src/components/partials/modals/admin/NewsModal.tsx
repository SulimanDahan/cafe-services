"use client";

import { useEffect } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, type NewsInput } from "@/lib/validations/news";
import { useLanguage } from "@/config/i18n";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { InputField } from "@/components/input";
import NewsModel from "@/models/data_models/news_model";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NewsInput) => Promise<boolean>;
    onError: (msg: string) => void;
    editingNews?: NewsModel | null;
}

export default function NewsModal({
    isOpen,
    onClose,
    onSave,
    onError,
    editingNews,
}: NewsModalProps) {
    const { t, isRtl } = useLanguage();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<NewsInput>({
        resolver: zodResolver(newsSchema) as unknown as Resolver<NewsInput>,
        defaultValues: {
            news_text: "",
            start_date: new Date(),
            end_date: new Date(),
            is_disable: false,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (editingNews) {
                reset({
                    news_text: editingNews.news_text,
                    start_date: new Date(editingNews.start_date),
                    end_date: new Date(editingNews.end_date),
                    is_disable: editingNews.is_disable,
                });
            } else {
                reset({
                    news_text: "",
                    start_date: new Date(),
                    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    is_disable: false,
                });
            }
        }
    }, [isOpen, editingNews, reset]);

    const handleFormSubmit = async (data: NewsInput) => {
        try {
            const success = await onSave(data);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error("Save error:", error);
            onError(t("news.msgUpdateFailed"));
        }
    };

    // Helper to format date to YYYY-MM-DD for native input date
    const formatDateForInput = (date: Date) => {
        try {
            return new Date(date).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                editingNews
                    ? t("news.editNews")
                    : t("news.addNews")
            }
        >
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
            >
                {/* News Text */}
                <div>
                    <InputField
                        label={t("news.formNewsText")}
                        id="nText"
                        type="text"
                        {...register("news_text")}
                        placeholder={t("news.formNewsText")}
                        dir={isRtl ? "rtl" : "ltr"}
                    />
                    {errors.news_text?.message && (
                        <p className="text-[10px] text-red-400 font-medium mt-1">
                            {t(String(errors.news_text.message))}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                        <Controller
                            control={control}
                            name="start_date"
                            render={({ field }) => (
                                <InputField
                                    label={t("news.formStartDate")}
                                    type="date"
                                    value={formatDateForInput(new Date(field.value))}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                            )}
                        />
                        {errors.start_date?.message && (
                            <p className="text-[10px] text-red-400 font-medium mt-1">
                                {t(String(errors.start_date.message))}
                            </p>
                        )}
                    </div>

                    {/* End Date */}
                    <div>
                        <Controller
                            control={control}
                            name="end_date"
                            render={({ field }) => (
                                <InputField
                                    label={t("news.formEndDate")}
                                    type="date"
                                    value={formatDateForInput(new Date(field.value))}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                            )}
                        />
                        {errors.end_date?.message && (
                            <p className="text-[10px] text-red-400 font-medium mt-1">
                                {t(String(errors.end_date.message))}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-2">
                    <input
                        type="checkbox"
                        id="nDisabled"
                        {...register("is_disable")}
                        className="w-5 h-5 rounded-md border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <label
                        htmlFor="nDisabled"
                        className="text-xs font-bold text-zinc-300 cursor-pointer select-none"
                    >
                        {t("news.formStatus")}
                    </label>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-white/5 mt-4">
                    <PrimaryButton
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                    >
                        {t("news.btnCancel")}
                    </PrimaryButton>
                    <PrimaryButton type="submit" size="md">
                        {t("news.btnSave")}
                    </PrimaryButton>
                </div>
            </form>
        </AdminModal>
    );
}
