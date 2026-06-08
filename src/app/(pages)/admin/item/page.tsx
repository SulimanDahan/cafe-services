"use client";

import { useState, useEffect } from "react";

import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import {
    DisableIcon,
    CheckCircleIcon,
    EditIcon,
    TrashIcon,
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useItem } from "@/context/item_context";
import { useItemGroup } from "@/context/item_group_context";
import ItemModel from "@/models/data_models/item_model";
import Table, { TableColumn } from "@/components/table";
import ErrorModal from "@/components/partials/modals/error_modal";
import ItemModal from "@/components/partials/modals/admin/ItemModal";
import { ActionIconButton } from "@/components/button/action_icon_button";
import Pagination from "@/components/Pagination";
import PlusIcon from "@/components/icons/PlusIcon";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import { InputField } from "@/components/input";

/**
 * Admin Items / Beverages Management Page.
 * Connected to DB via ItemContext. Uses single name field per schema.
 */
export default function ItemsAdmin() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const {
        items,
        total,
        totalPages,
        isItemsLoading,
        fetchAllItems,
        addItem,
        updateItem,
        deleteItem,
    } = useItem();
    const { groups, fetchAllGroups } = useItemGroup();

    const columns: TableColumn[] = [
        { key: "name", label: t("item.colNameAr") },
        { key: "category", label: t("item.colCategory") },
        { key: "price", label: t("item.columnPrice") },
        { key: "created", label: t("item.columnCreated") },
        { key: "status", label: t("common.status"), align: "center" },
        { key: "actions", label: t("common.actions"), align: "center" },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
    const [isOpen, setIsOpen] = useState(false);
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<ItemModel | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Form submission data structure
    interface ItemFormValues {
        name: string;
        price: string;
        group_id: string;
    }

    const perPage = settings.per_page || 10;

    // Server-fetch items whenever page, search, or group filter changes
    useEffect(() => {
        const params: Record<string, string> = {
            page: String(currentPage),
            per_page: String(perPage),
        };
        if (searchQuery) params.search = searchQuery;
        if (selectedGroupFilter !== "all")
            params.group_id = selectedGroupFilter;
        fetchAllItems(params);
    }, [currentPage, searchQuery, selectedGroupFilter, perPage, fetchAllItems]);

    // Fetch groups once (used for dropdown, not paginated)
    useEffect(() => {
        fetchAllGroups({ fetch_all: "true" });
    }, [fetchAllGroups]);

    // Reset to page 1 when filters change
    const handleSearch = (v: string) => {
        setSearchQuery(v);
        setCurrentPage(1);
    };
    const handleGroupFilter = (v: string) => {
        setSelectedGroupFilter(v);
        setCurrentPage(1);
    };

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (item: ItemModel) => {
        setEditingItem(item);
        setIsOpen(true);
    };

    const handleSave = async (data: ItemFormValues): Promise<boolean> => {
        let success = false;
        let apiErrorKey: string | null = null;
        if (editingItem) {
            success = await updateItem(
                editingItem.id,
                {
                    name: data.name,
                    price: parseFloat(data.price),
                    group_id: data.group_id,
                },
                (errKey) => {
                    apiErrorKey = errKey;
                }
            );
        } else {
            success = await addItem({
                name: data.name,
                price: parseFloat(data.price),
                group_id: data.group_id,
            });
        }

        if (!success) {
            setErrorModalMsg(t(apiErrorKey || "common.errorOccurred"));
        }
        return success;
    };

    const handleToggleDisable = async (item: ItemModel) => {
        await updateItem(item.id, { is_disable: !item.is_disable }, (errKey) => {
            setErrorModalMsg(t(errKey));
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm(t("common.confirmDelete"))) {
            await deleteItem(id, (errKey) => {
                setErrorModalMsg(t(errKey));
            });
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <AdminHeader title={t("item.title")} subtitle={t("item.subtitle")}>
                <PrimaryButton onClick={handleOpenAdd} size="md">
                    <PlusIcon className="w-4 h-4" />
                    <span>{t("item.addItem")}</span>
                </PrimaryButton>
            </AdminHeader>

            {/* Filters Panel */}
            <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:max-w-2xl">
                        {/* Search Name */}
                        <SearchInput
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder={t("item.searchPlaceholder")}
                        />

                        {/* Filter Group Dropdown */}
                        <div className="w-full sm:w-64 shrink-0">
                            <InputField
                                isSelect
                                value={selectedGroupFilter}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>,
                                ) => handleGroupFilter(e.target.value)}
                                options={[
                                    {
                                        id: "all",
                                        name: t("item.filterAllCategories"),
                                    },
                                    ...groups
                                        .filter((g) => g.is_disable !== true)
                                        .map((g) => ({
                                            id: g.id,
                                            name: g.name,
                                        })),
                                ]}
                            />
                        </div>
                    </div>

                    <span className="text-xs text-zinc-400 font-bold shrink-0">
                        {t("item.totalDisplayedItems")} {total}
                    </span>
                </div>

                <Table
                    columns={columns}
                    isLoading={isItemsLoading}
                    dataLength={total}
                >
                    {items.map((item) => {
                        const group = groups.find(
                            (g) => g.id === item.group_id,
                        );
                        return (
                            <tr
                                key={item.id}
                                className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
                            >
                                <td
                                    className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {item.name}
                                </td>
                                <td
                                    className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {group?.name ?? t("item.uncategorized")}
                                </td>
                                <td
                                    className={`py-4 px-4 text-primary-hover font-black text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {Number(item.price).toLocaleString("en-US")}{" "}
                                    {t(`common.${settings.currency_name}`)}
                                </td>
                                <td
                                    className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                                >
                                    {formatDate(item.created_at)}
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                    <Badge
                                        variant={
                                            !item.is_disable
                                                ? "success"
                                                : "error"
                                        }
                                        pulse
                                    >
                                        {!item.is_disable
                                            ? t("item.statusInStock")
                                            : t("item.statusOutOfStock")}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Toggle Available state */}
                                        <ActionIconButton
                                            variant={
                                                !item.is_disable
                                                    ? "disable"
                                                    : "enable"
                                            }
                                            icon={
                                                !item.is_disable ? (
                                                    <DisableIcon className="w-4 h-4" />
                                                ) : (
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                )
                                            }
                                            onClick={() =>
                                                handleToggleDisable(item)
                                            }
                                            title={
                                                !item.is_disable
                                                    ? t(
                                                          "item.actionSetOutOfStock",
                                                      )
                                                    : t("item.actionSetInStock")
                                            }
                                        />

                                        {/* Edit item */}
                                        <ActionIconButton
                                            variant="edit"
                                            icon={
                                                <EditIcon className="w-4 h-4" />
                                            }
                                            onClick={() => handleOpenEdit(item)}
                                            title={t("common.edit")}
                                        />

                                        {/* Delete item */}
                                        <ActionIconButton
                                            variant="delete"
                                            icon={
                                                <TrashIcon className="w-4 h-4" />
                                            }
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                            title={t("common.delete")}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </Table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={perPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            <ItemModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={handleSave}
                editingItem={editingItem}
                groups={groups
                    .filter((g) => g.is_disable !== true)
                    .map((g) => ({ id: g.id, name: g.name }))}
                currencyName={settings.currency_name || "YER"}
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
