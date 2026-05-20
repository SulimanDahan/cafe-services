"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema } from "@/lib/validations/item";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { PlusIcon, UndoCircleIcon, CheckCircleIcon, EditIcon, TrashIcon } from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useItem } from "@/context/item_context";
import { useItemGroup } from "@/context/item_group_context";
import ItemModel from "@/models/data_models/item_model";
import Table, { TableColumn } from "@/components/table";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";

/**
 * Admin Items / Beverages Management Page.
 * Connected to DB via ItemContext. Uses single name field per schema.
 */
export default function ItemsAdmin() {
	const { t, isRtl } = useLanguage();
	const { settings } = useSettings();
	const { items, total, totalPages, isItemsLoading, fetchAllItems, addItem, updateItem, deleteItem } = useItem();
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
	const [editingItem, setEditingItem] = useState<ItemModel | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	// React Hook Form values interface
	interface ItemFormValues {
		name: string;
		price: string;
		group_id: string;
	}

	// React Hook Form
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ItemFormValues>({
		resolver: zodResolver(itemSchema) as unknown as Resolver<ItemFormValues>,
		defaultValues: {
			name: "",
			price: "",
			group_id: "",
		},
	});

	const perPage = settings.per_page || 10;

	// Server-fetch items whenever page, search, or group filter changes
	useEffect(() => {
		const params: Record<string, string> = {
			page: String(currentPage),
			per_page: String(perPage),
		};
		if (searchQuery) params.search = searchQuery;
		if (selectedGroupFilter !== "all") params.group_id = selectedGroupFilter;
		fetchAllItems(params);
	}, [currentPage, searchQuery, selectedGroupFilter, perPage, fetchAllItems]);

	// Fetch groups once (used for dropdown, not paginated)
	useEffect(() => {
		fetchAllGroups({ fetch_all: "true" });
	}, [fetchAllGroups]);

	// Reset to page 1 when filters change
	const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
	const handleGroupFilter = (v: string) => { setSelectedGroupFilter(v); setCurrentPage(1); };

	const handleOpenAdd = () => {
		setEditingItem(null);
		reset({
			name: "",
			price: "",
			group_id: groups[0]?.id ?? "",
		});
		setIsOpen(true);
	};

	const handleOpenEdit = (item: ItemModel) => {
		setEditingItem(item);
		reset({
			name: item.name,
			price: String(item.price),
			group_id: item.group_id,
		});
		setIsOpen(true);
	};

	const handleSave = async (data: ItemFormValues) => {
		let success = false;
		if (editingItem) {
			success = await updateItem(editingItem.id, {
				name: data.name,
				price: parseFloat(data.price),
				group_id: data.group_id,
			});
		} else {
			success = await addItem({
				name: data.name,
				price: parseFloat(data.price),
				group_id: data.group_id,
			});
		}

		if (success) {
			setIsOpen(false);
		} else {
			alert(t("common.errorOccurred"));
		}
	};

	const handleToggleDisable = async (item: ItemModel) => {
		await updateItem(item.id, { is_disable: !item.is_disable });
	};

	const handleDelete = async (id: string) => {
		if (confirm(t("common.confirmDelete"))) {
			await deleteItem(id);
		}
	};

	const formatDate = (date: Date | string) => {
		const d = new Date(date);
		return d.toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
			day: "numeric", month: "long", year: "numeric",
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<AdminHeader title={t("item.title")} subtitle={t("item.subtitle")}>
				<PrimaryButton
					onClick={handleOpenAdd}
					size="md"
				>
					<PlusIcon className="w-4 h-4" />
					<span>{t("item.addItem")}</span>
				</PrimaryButton>
			</AdminHeader>

			{/* Filters Panel */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:max-w-2xl">
						{/* Search Name */}
						<SearchInput
							value={searchQuery}
							onChange={handleSearch}
							placeholder={t("item.searchPlaceholder")}
						/>

						{/* Filter Group Dropdown */}
						<select
							className="bg-[#07080a] border border-white/10 text-zinc-300 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
							value={selectedGroupFilter}
							onChange={(e) => handleGroupFilter(e.target.value)}
						>
							<option value="all">{t("item.filterAllCategories")}</option>
							{groups.map((g) => (
								<option key={g.id} value={g.id}>{g.name}</option>
							))}
						</select>
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
						const group = groups.find((g) => g.id === item.group_id);
						return (
							<tr key={item.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
								<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
									{item.name}
								</td>
								<td className={`py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
									{group?.name ?? t("item.uncategorized")}
								</td>
								<td className={`py-4 px-4 text-amber-400 font-black text-xs whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
									{Number(item.price).toLocaleString("en-US")} {t(`common.${settings.currency_name}`)}
								</td>
								<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
									{formatDate(item.created_at)}
								</td>
								<td className="py-4 px-4 text-center whitespace-nowrap">
									<Badge
										variant={!item.is_disable ? "success" : "error"}
										pulse
									>
										{!item.is_disable ? t("item.statusInStock") : t("item.statusOutOfStock")}
									</Badge>
								</td>
								<td className="py-4 px-4 text-center whitespace-nowrap">
									<div className="flex items-center justify-center gap-2">
										{/* Toggle Available state */}
										<button
											onClick={() => handleToggleDisable(item)}
											className={`p-1.5 rounded-lg border transition-all duration-200 ${!item.is_disable
												? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
												: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
												}`}
											title={!item.is_disable ? t("item.actionSetOutOfStock") : t("item.actionSetInStock")}
										>
											{!item.is_disable ? (
												<UndoCircleIcon className="w-4 h-4" />
											) : (
												<CheckCircleIcon className="w-4 h-4" />
											)}
										</button>

										{/* Edit item */}
										<button
											onClick={() => handleOpenEdit(item)}
											className="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200"
											title={t("common.edit")}
										>
											<EditIcon className="w-4 h-4" />
										</button>

										{/* Delete item */}
										<button
											onClick={() => handleDelete(item.id)}
											className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
											title={t("common.delete")}
										>
											<TrashIcon className="w-4 h-4" />
										</button>
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

			<AdminModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title={editingItem ? t("item.modalEditTitle") : t("item.addItem")}
			>
				<form onSubmit={handleSubmit(handleSave)} className="space-y-4">
					{/* Item Name */}
					<div className="space-y-1.5">
						<label htmlFor="itemName" className="text-xs font-bold text-zinc-400 block">
							{t("item.formLabelNameAr")}
						</label>
						<input
							id="itemName"
							type="text"
							{...register("name")}
							placeholder={t("item.formPlaceholderNameAr")}
							className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
							autoFocus
						/>
						{errors.name?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.name.message)}</p>
						)}
					</div>

					{/* Item Price */}
					<div className="space-y-1.5">
						<label htmlFor="itemPrice" className="text-xs font-bold text-zinc-400 block">
							{t("item.formLabelPrice")} ({t("common.YER")})
						</label>
						<input
							id="itemPrice"
							type="number"
							step="500"
							min="250"
							{...register("price")}
							placeholder="3500"
							className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
						/>
						{errors.price?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.price.message)}</p>
						)}
					</div>

					{/* Item Category Selection */}
					<div className="space-y-1.5">
						<label htmlFor="itemGroup" className="text-xs font-bold text-zinc-400 block">
							{t("item.formLabelCategory")}
						</label>
						<select
							id="itemGroup"
							{...register("group_id")}
							className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
						>
							{groups.map((g) => (
								<option key={g.id} value={g.id}>{g.name}</option>
							))}
						</select>
						{errors.group_id?.message && (
							<p className="text-[10px] text-red-400 font-medium mt-1">{String(errors.group_id.message)}</p>
						)}
					</div>

					<div className="pt-2 flex justify-end gap-2">
						<PrimaryButton
							type="button"
							onClick={() => setIsOpen(false)}
							variant="secondary"
							size="md"
						>
							{t("common.cancel")}
						</PrimaryButton>
						<PrimaryButton
							type="submit"
							size="md"
						>
							{editingItem ? t("common.save") : t("common.add")}
						</PrimaryButton>
					</div>
				</form>
			</AdminModal>
		</div>
	);
}
