"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
 itemGroupSchema,
 type ItemGroupInput,
} from "@/lib/validations/item_group";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import {
 PlusIcon,
 UndoCircleIcon,
 CheckCircleIcon,
 EditIcon,
 TrashIcon,
} from "@/components/icons";
import { useItemGroup } from "@/context/item_group_context";
import ItemGroupModel from "@/models/data_models/item_group_model";
import Table, { TableColumn } from "@/components/table";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import { InputField } from "@/components/input";
import Pagination from "@/components/pagination";
import { ActionIconButton } from "@/components/button/action_icon_button";

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
 const [editingGroup, setEditingGroup] = useState<ItemGroupModel | null>(
 null,
 );
 const [currentPage, setCurrentPage] = useState(1);

 // React Hook Form
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
 reset({ name: "" });
 setIsOpen(true);
 };

 const handleOpenEdit = (group: ItemGroupModel) => {
 setEditingGroup(group);
 reset({ name: group.name });
 setIsOpen(true);
 };

 const handleSave = async (data: ItemGroupInput) => {
 let success = false;
 if (editingGroup) {
 success = await updateGroup(editingGroup.id, { name: data.name });
 } else {
 success = await addGroup({ name: data.name });
 }

 if (success) {
 setIsOpen(false);
 } else {
 alert(t("common.errorOccurred"));
 }
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
 <div className="space-y-6">
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
 <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md space-y-6">
 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
 <UndoCircleIcon className="w-4 h-4" />
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

 <AdminModal
 isOpen={isOpen}
 onClose={() => setIsOpen(false)}
 title={
 editingGroup
 ? t("itemGroup.modalEditTitle")
 : t("itemGroup.addGroup")
 }
 >
 <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
 {/* Group Name */}
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
 onClick={() => setIsOpen(false)}
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
 </div>
 );
}
