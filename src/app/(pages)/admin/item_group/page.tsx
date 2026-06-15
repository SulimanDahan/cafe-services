"use client";

import { useState, useEffect } from "react";
import { type ItemGroupInput } from "@/lib/validations/item_group";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import {
    DisableIcon,
    CheckCircleIcon,
    EditIcon,
    TrashIcon,
} from "@/components/icons";
import { useItemGroup } from "@/context/item_group_context";
import ItemGroupModel from "@/models/data_models/item_group_model";
import Table, { TableColumn } from "@/components/table";
import ErrorModal from "@/components/partials/modals/error_modal";
import ItemGroupModal from "@/components/partials/modals/admin/ItemGroupModal";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";
import { ActionIconButton } from "@/components/button/action_icon_button";
import PlusIcon from "@/components/icons/PlusIcon";
import { PrimaryButton } from "@/components/button/primary_button";

/**
 * Admin Item Groups Management Page.
 * Manages menu categories. Connected to DB via ItemGroupContext.
 */
export default function ItemGroupsAdmin() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const {
        groups,
        total,
        totalPages,
        isGroupsLoading,
        fetchAllGroups,
        addGroup,
        updateGroup,
        deleteGroup,
    } = useItemGroup();

    const columns: TableColumn[] = [
        { key: "name", label: t("itemGroup.colNameAr") },
        { key: "items_count", label: t("itemGroup.columnItemsCount") },
        { key: "created", label: t("itemGroup.columnCreated") },
        { key: "status", label: t("common.status"), align: "center" },
        { key: "actions", label: t("common.actions"), align: "center" },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
    const [editingGroup, setEditingGroup] = useState<ItemGroupModel | null>(
        null,
    );
    const [currentPage, setCurrentPage] = useState(1);

    const perPage = settings.per_page || 10;

    // Server-fetch groups when page or search changes
    useEffect(() => {
        const params: Record<string, string> = {
            page: String(currentPage),
            per_page: String(perPage),
        };
        if (searchQuery) params.search = searchQuery;
        fetchAllGroups(params);
    }, [currentPage, searchQuery, perPage, fetchAllGroups]);

    const handleOpenAdd = () => {
        setEditingGroup(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (group: ItemGroupModel) => {
        setEditingGroup(group);
        setIsOpen(true);
    };

    const handleSave = async (data: ItemGroupInput): Promise<boolean> => {
        let success = false;
        if (editingGroup) {
            success = await updateGroup(editingGroup.id, { name: data.name });
        } else {
            success = await addGroup({ name: data.name });
        }

        if (!success) {
            setErrorModalMsg(t("common.errorOccurred"));
        }
        return success;
    };

    const handleToggleDisable = async (group: ItemGroupModel) => {
        await updateGroup(group.id, { is_disable: !group.is_disable });
    };

    const handleDelete = async (id: string) => {
        if (confirm(t("common.confirmDelete"))) {
            await deleteGroup(id);
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
        <div className="flex flex-col h-[calc(100vh-96px)] sm:h-[calc(100vh-128px)] space-y-6">
            {/* Header area with titles and actions */}
            <AdminHeader
                title={t("itemGroup.title")}
                subtitle={t("itemGroup.subtitle")}
            >
                <PrimaryButton onClick={handleOpenAdd} size="md">
                    <PlusIcon className="w-4 h-4" />
                    <span>{t("itemGroup.addGroup")}</span>
                </PrimaryButton>
            </AdminHeader>

            {/* Filter panel & Search */}
            <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md flex flex-col flex-1 min-h-0 gap-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
                    <SearchInput
                        value={searchQuery}
                        onChange={(v) => {
                            setSearchQuery(v);
                            setCurrentPage(1);
                        }}
                        placeholder={t("itemGroup.searchPlaceholder")}
                    />
                    <span className="text-xs text-zinc-400 font-bold">
                        {t("itemGroup.totalCategories")} {total}
                    </span>
                </div>

                <Table
                    columns={columns}
                    isLoading={isGroupsLoading}
                    dataLength={total}
                    wrapperClassName="flex-1 min-h-0"
                >
                    {groups.map((group) => (
                        <tr
                            key={group.id}
                            className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
                        >
                            <td
                                className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                            >
                                {group.name}
                            </td>
                            <td
                                className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                            >
                                {group._count?.items ?? 0}{" "}
                                {t("itemGroup.itemsLinked")}
                            </td>
                            <td
                                className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                            >
                                {formatDate(group.created_at)}
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <Badge
                                    variant={
                                        !group.is_disable ? "success" : "error"
                                    }
                                    pulse
                                >
                                    {!group.is_disable
                                        ? t("itemGroup.statusActive")
                                        : t("itemGroup.statusDisabled")}
                                </Badge>
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    <ActionIconButton
                                        variant={
                                            !group.is_disable
                                                ? "disable"
                                                : "enable"
                                        }
                                        icon={
                                            !group.is_disable ? (
                                                <DisableIcon className="w-4 h-4" />
                                            ) : (
                                                <CheckCircleIcon className="w-4 h-4" />
                                            )
                                        }
                                        onClick={() =>
                                            handleToggleDisable(group)
                                        }
                                        title={
                                            !group.is_disable
                                                ? t("itemGroup.actionDisable")
                                                : t("itemGroup.actionEnable")
                                        }
                                    />

                                    <ActionIconButton
                                        variant="edit"
                                        icon={<EditIcon className="w-4 h-4" />}
                                        onClick={() => handleOpenEdit(group)}
                                        title={t("common.edit")}
                                    />

                                    <ActionIconButton
                                        variant="delete"
                                        icon={<TrashIcon className="w-4 h-4" />}
                                        onClick={() => handleDelete(group.id)}
                                        title={t("common.delete")}
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

            <ItemGroupModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={handleSave}
                editingGroup={editingGroup}
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
