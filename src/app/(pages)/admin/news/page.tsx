"use client";

import { useState, useEffect } from "react";
import { type NewsInput } from "@/lib/validations/news";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import {
    DisableIcon,
    CheckIcon,
    TrashIcon,
    EditIcon,
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useNews } from "@/context/news_context";
import { useSettings } from "@/context/settings_context";
import NewsModel from "@/models/data_models/news_model";
import Table, { TableColumn } from "@/components/table";
import ErrorModal from "@/components/partials/modals/error_modal";
import NewsModal from "@/components/partials/modals/admin/NewsModal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";
import { ActionIconButton } from "@/components/button/action_icon_button";
import PlusIcon from "@/components/icons/PlusIcon";

/**
 * Admin News Page.
 * Connected to DB via NewsContext.
 */
export default function AdminNewsPage() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const {
        newsList,
        total,
        totalPages,
        isNewsLoading,
        fetchAllNews,
        addNews,
        updateNews,
        deleteNews,
    } = useNews();

    const columns: TableColumn[] = [
        { key: "news_text", label: t("news.colNewsText") },
        { key: "start_date", label: t("news.colStartDate"), align: "center" },
        { key: "end_date", label: t("news.colEndDate"), align: "center" },
        {
            key: "status",
            label: t("news.colStatus"),
            align: "center",
        },
        {
            key: "actions",
            label: t("news.colActions"),
            align: "center",
        },
    ];

    const [searchQuery, setSearchQuery] = useState("");

    // Modals toggles
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsModel | null>(null);
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const perPage = settings.per_page || 10;

    // Server-fetch news when page or search changes
    useEffect(() => {
        const params: Record<string, string> = {
            page: String(currentPage),
            per_page: String(perPage),
        };
        if (searchQuery) params.search = searchQuery;
        fetchAllNews(params);
    }, [currentPage, searchQuery, perPage, fetchAllNews]);

    // Open news add modal
    const handleOpenAddModal = () => {
        setEditingNews(null);
        setIsAddOpen(true);
    };

    const handleOpenEditModal = (newsItem: NewsModel) => {
        setEditingNews(newsItem);
        setIsAddOpen(true);
    };

    const handleSaveNewsSubmit = async (
        data: NewsInput,
    ): Promise<boolean> => {
        let success = false;
        if (editingNews) {
            success = await updateNews(editingNews.id, data);
        } else {
            success = await addNews(data);
        }

        if (!success) {
            setErrorModalMsg(t("common.errorOccurred"));
        }
        return success;
    };

    // Toggle news operational availability
    const handleToggleDisable = async (newsItem: NewsModel) => {
        await updateNews(newsItem.id, { is_disable: !newsItem.is_disable });
    };

    // Delete news
    const handleDeleteNews = async (newsItem: NewsModel) => {
        if (confirm(t("news.confirmDelete"))) {
            await deleteNews(newsItem.id, (errKey) => {
                setErrorModalMsg(t(errKey));
            });
        }
    };

    const formatDate = (date: string | Date) => {
        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return "-";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <AdminHeader
                title={t("news.title")}
                subtitle={t("news.subtitle")}
            >
                <PrimaryButton onClick={handleOpenAddModal} size="md">
                    <PlusIcon className="w-4 h-4" />
                    <span>{t("news.btnAddNews")}</span>
                </PrimaryButton>
            </AdminHeader>

            {/* News Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-card border border-white/10 bg-surface p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-primary/20 transition-colors">
                    <div className="absolute right-0 top-0 h-16 w-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
                        {t("news.title")}
                    </span>
                    <span className="text-4xl font-black text-white">
                        {newsList.length}
                    </span>
                </div>
                <div className="rounded-card border border-white/10 bg-surface p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-green-500/20 transition-colors">
                    <div className="absolute right-0 top-0 h-16 w-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-colors" />
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
                        {t("news.statusActive")}
                    </span>
                    <span className="text-4xl font-black text-green-400">
                        {newsList.filter((n) => !n.is_disable).length}
                    </span>
                </div>
                <div className="rounded-card border border-white/10 bg-surface p-6 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden group hover:border-red-500/20 transition-colors">
                    <div className="absolute right-0 top-0 h-16 w-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-colors" />
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">
                        {t("news.statusInactive")}
                    </span>
                    <span className="text-4xl font-black text-red-400">
                        {newsList.filter((n) => n.is_disable).length}
                    </span>
                </div>
            </div>

            {/* Main Table */}
            <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <SearchInput
                        value={searchQuery}
                        onChange={(v) => {
                            setSearchQuery(v);
                            setCurrentPage(1);
                        }}
                        placeholder={t("news.searchPlaceholder")}
                    />
                </div>

                <Table
                    columns={columns}
                    isLoading={isNewsLoading}
                    dataLength={total}
                    noDataText={t("news.noNewsRegistered")}
                >
                    {newsList.map((newsItem, index) => (
                        <tr
                            key={index}
                            className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
                        >
                            <td
                                className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-xs ${isRtl ? "text-right" : "text-left"}`}
                            >
                                {newsItem.news_text}
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <span className="text-zinc-300 font-medium text-sm">
                                    {formatDate(newsItem.start_date)}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <span className="text-zinc-300 font-medium text-sm">
                                    {formatDate(newsItem.end_date)}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <Badge
                                    variant={
                                        !newsItem.is_disable ? "success" : "error"
                                    }
                                    pulse={!newsItem.is_disable}
                                >
                                    {!newsItem.is_disable
                                        ? t("news.statusActive")
                                        : t("news.statusInactive")}
                                </Badge>
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    <ActionIconButton
                                        variant={
                                            !newsItem.is_disable
                                                ? "disable"
                                                : "enable"
                                        }
                                        icon={
                                            !newsItem.is_disable ? (
                                                <DisableIcon className="w-4 h-4" />
                                            ) : (
                                                <CheckIcon className="w-4 h-4" />
                                            )
                                        }
                                        onClick={() =>
                                            handleToggleDisable(newsItem)
                                        }
                                        title={
                                            !newsItem.is_disable
                                                ? t("news.actionDeactivate")
                                                : t("news.actionActivate")
                                        }
                                    />

                                    <ActionIconButton
                                        variant="edit"
                                        icon={<EditIcon className="w-4 h-4" />}
                                        onClick={() =>
                                            handleOpenEditModal(newsItem)
                                        }
                                        title={t("news.editNews")}
                                    />

                                    <ActionIconButton
                                        variant="delete"
                                        icon={<TrashIcon className="w-4 h-4" />}
                                        onClick={() => handleDeleteNews(newsItem)}
                                        title={t("news.actionDelete")}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={perPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            <NewsModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleSaveNewsSubmit}
                onError={setErrorModalMsg}
                editingNews={editingNews}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={!!errorModalMsg}
                onClose={() => setErrorModalMsg(null)}
                message={errorModalMsg}
            />
        </div>
    );
}
