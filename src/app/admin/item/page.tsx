"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";

interface Item {
	id: string;
	name: string;
	price: number;
	groupId: string; // foreign key
	is_disable: boolean;
	createdAt: string;
}

interface ItemGroup {
	id: string;
	name: string;
}

/**
 * Admin Items / Beverages Management Page.
 * Implements the Item model. Offers full controls to register menu products,
 * adjust pricing, categorize them, query, edit details, and disable items with 0 emojis.
 */
export default function ItemsAdmin() {
	// Pre-seeded database matching Item schema and relations
	const [items, setItems] = useState<Item[]>([
		{ id: "i1", name: "إسبريسو مزدوج", price: 14.0, groupId: "g5", is_disable: false, createdAt: "12 مايو 2026" },
		{ id: "i2", name: "كابتشينو كلاسيك", price: 18.0, groupId: "g1", is_disable: false, createdAt: "12 مايو 2026" },
		{ id: "i3", name: "سبانش لاتيه بارد", price: 22.0, groupId: "g2", is_disable: false, createdAt: "12 مايو 2026" },
		{ id: "i4", name: "كرواسون الزبدة المقرمش", price: 16.0, groupId: "g3", is_disable: false, createdAt: "11 مايو 2026" },
		{ id: "i5", name: "كيكة العسل والزعفران", price: 28.0, groupId: "g4", is_disable: false, createdAt: "10 مايو 2026" },
		{ id: "i6", name: "سويت كولد برو", price: 24.0, groupId: "g2", is_disable: true, createdAt: "05 مايو 2026" },
	]);

	const [groups] = useState<ItemGroup[]>([
		{ id: "g1", name: "المشروبات الساخنة" },
		{ id: "g2", name: "المشروبات الباردة" },
		{ id: "g3", name: "المعجنات والمخبوزات" },
		{ id: "g4", name: "الحلويات الفاخرة" },
		{ id: "g5", name: "ركن القهوة المختصة" },
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
	const [isOpen, setIsOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Item | null>(null);

	// Form states
	const [itemName, setItemName] = useState("");
	const [itemPrice, setItemPrice] = useState("");
	const [itemGroupId, setItemGroupId] = useState("g1");

	// Filters execution
	const filteredItems = items.filter((item) => {
		const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesGroup = selectedGroupFilter === "all" || item.groupId === selectedGroupFilter;
		return matchesSearch && matchesGroup;
	});

	const handleOpenAdd = () => {
		setEditingItem(null);
		setItemName("");
		setItemPrice("");
		setItemGroupId("g1");
		setIsOpen(true);
	};

	const handleOpenEdit = (item: Item) => {
		setEditingItem(item);
		setItemName(item.name);
		setItemPrice(item.price.toString());
		setItemGroupId(item.groupId);
		setIsOpen(true);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!itemName.trim() || !itemPrice) return;

		if (editingItem) {
			// Edit existing item
			setItems((prev) =>
				prev.map((i) =>
					i.id === editingItem.id
						? { ...i, name: itemName, price: parseFloat(itemPrice), groupId: itemGroupId }
						: i
				)
			);
		} else {
			// Add new item
			const newItem: Item = {
				id: `i-${Date.now()}`,
				name: itemName,
				price: parseFloat(itemPrice),
				groupId: itemGroupId,
				is_disable: false,
				createdAt: new Date().toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" }),
			};
			setItems((prev) => [newItem, ...prev]);
		}
		setIsOpen(false);
	};

	const handleToggleDisable = (id: string) => {
		setItems((prev) =>
			prev.map((i) => (i.id === id ? { ...i, is_disable: !i.is_disable } : i))
		);
	};

	const handleDelete = (id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<AdminHeader
				title="المواد والأصناف"
				subtitle="إدارة قائمة المأكولات والمشروبات المتاحة وأسعارها والتحكم بظهورها."
			>
				<button
					onClick={handleOpenAdd}
					className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 w-full sm:w-auto"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
					</svg>
					<span>إضافة صنف جديد</span>
				</button>
			</AdminHeader>

			{/* Filters Panel (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
					
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:max-w-2xl">
						{/* Search Name */}
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="البحث باسم الصنف..."
						/>

						{/* Filter Group Dropdown */}
						<select
							value={selectedGroupFilter}
							onChange={(e) => setSelectedGroupFilter(e.target.value)}
							className="bg-[#07080a] border border-white/10 text-zinc-300 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
						>
							<option value="all">جميع المجموعات</option>
							{groups.map((g) => (
								<option key={g.id} value={g.id}>{g.name}</option>
							))}
						</select>
					</div>

					<span className="text-xs text-zinc-400 font-bold shrink-0">
						إجمالي الأصناف المعروضة: {filteredItems.length}
					</span>
				</div>

				{/* Table with proper row widths (min-w-212.5) */}
				<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
					<table className="min-w-212.5 w-full border-collapse text-right text-sm">
						<thead>
							<tr className="border-b border-white/10 text-zinc-400 text-xs font-black">
								<th className="pb-3 px-4 text-right whitespace-nowrap">اسم الصنف</th>
								<th className="pb-3 px-4 text-right whitespace-nowrap">المجموعة</th>
								<th className="pb-3 px-4 text-right whitespace-nowrap">السعر الفردي</th>
								<th className="pb-3 px-4 text-right whitespace-nowrap">تاريخ الإضافة</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">الحالة</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">الإجراءات</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredItems.length > 0 ? (
								filteredItems.map((item) => {
									const groupName = groups.find((g) => g.id === item.groupId)?.name || "غير مصنف";
									return (
										<tr key={item.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
											<td className="py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
												{item.name}
											</td>
											<td className="py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap">
												{groupName}
											</td>
											<td className="py-4 px-4 text-amber-400 font-black text-xs whitespace-nowrap">
												{item.price.toFixed(2)} ر.س
											</td>
											<td className="py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap">
												{item.createdAt}
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
													!item.is_disable 
														? "bg-green-500/10 text-green-400 border-green-500/20" 
														: "bg-red-500/10 text-red-400 border-red-500/20"
												}`}>
													<span className={`w-1.5 h-1.5 rounded-full ${!item.is_disable ? "bg-green-400" : "bg-red-400"}`} />
													{!item.is_disable ? "متوفر حالياً" : "غير متوفر"}
												</span>
											</td>
											<td className="py-4 px-4 text-center whitespace-nowrap">
												<div className="flex items-center justify-center gap-2">
													
													{/* Toggle Available state */}
													<button
														onClick={() => handleToggleDisable(item.id)}
														className={`p-1.5 rounded-lg border transition-all duration-200 ${
															!item.is_disable 
																? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400" 
																: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
														}`}
														title={!item.is_disable ? "تعيين كغير متوفر" : "تعيين كمتوفر"}
													>
														{!item.is_disable ? (
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
															</svg>
														) : (
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
														)}
													</button>

													{/* Edit item details */}
													<button
														onClick={() => handleOpenEdit(item)}
														className="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200"
														title="تعديل تفاصيل الصنف"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>

													{/* Delete item */}
													<button
														onClick={() => handleDelete(item.id)}
														className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
														title="حذف الصنف نهائياً"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={6} className="py-10 text-center text-zinc-500 font-medium text-xs">
										لا توجد أصناف أو مأكولات مطابقة لمعايير تصفيتك الحالية.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal: ADD/EDIT MENU ITEM */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsOpen(false)}
							className="absolute top-4 left-4 text-zinc-400 hover:text-white transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<h2 className="text-lg font-black text-white mb-4">
							{editingItem ? "تعديل تفاصيل الصنف" : "إضافة صنف جديد لقائمة المنيو"}
						</h2>

						<form onSubmit={handleSave} className="space-y-4">
							{/* Item Name */}
							<div className="space-y-1.5">
								<label htmlFor="itemName" className="text-xs font-bold text-zinc-400">
									اسم الصنف التجاري
								</label>
								<input
									id="itemName"
									type="text"
									value={itemName}
									onChange={(e) => setItemName(e.target.value)}
									placeholder="مثال: فلات وايت، كرواسون بالزعتر..."
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
									autoFocus
								/>
							</div>

							{/* Item Price */}
							<div className="space-y-1.5">
								<label htmlFor="itemPrice" className="text-xs font-bold text-zinc-400">
									السعر الفردي بالريال (ر.س)
								</label>
								<input
									id="itemPrice"
									type="number"
									step="0.5"
									min="1"
									value={itemPrice}
									onChange={(e) => setItemPrice(e.target.value)}
									placeholder="مثال: 18.00"
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
								/>
							</div>

							{/* Item Category Selection */}
							<div className="space-y-1.5">
								<label htmlFor="itemGroup" className="text-xs font-bold text-zinc-400">
									المجموعة التصنيفية المندرجة
								</label>
								<select
									id="itemGroup"
									value={itemGroupId}
									onChange={(e) => setItemGroupId(e.target.value)}
									className="w-full bg-[#07080a] border border-white/10 text-zinc-300 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
								>
									{groups.map((g) => (
										<option key={g.id} value={g.id}>{g.name}</option>
									))}
								</select>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
								>
									إلغاء
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all"
								>
									{editingItem ? "حفظ التحديثات" : "إدراج صنف جديد"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
