"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";

interface ItemGroup {
	id: string;
	name: string;
	is_disable: boolean;
	createdAt: string;
	itemCount: number;
}

/**
 * Admin Item Groups Management Page.
 * Manages coffee categories (e.g. Hot Drinks, Cold Drinks, Bakery, Catering).
 * Features real-time state modification, adding, editing, search, and enabling/disabling categories.
 */
export default function ItemGroupsAdmin() {
	// Pre-seeded database matching ItemGroup schema
	const [groups, setGroups] = useState<ItemGroup[]>([
		{ id: "g1", name: "المشروبات الساخنة", is_disable: false, createdAt: "12 مايو 2026", itemCount: 12 },
		{ id: "g2", name: "المشروبات الباردة", is_disable: false, createdAt: "12 مايو 2026", itemCount: 8 },
		{ id: "g3", name: "المعجنات والمخبوزات", is_disable: false, createdAt: "11 مايو 2026", itemCount: 15 },
		{ id: "g4", name: "الحلويات الفاخرة", is_disable: false, createdAt: "10 مايو 2026", itemCount: 6 },
		{ id: "g5", name: "ركن القهوة المختصة", is_disable: false, createdAt: "09 مايو 2026", itemCount: 10 },
		{ id: "g6", name: "الباقات والمناسبات", is_disable: true, createdAt: "05 مايو 2026", itemCount: 4 },
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [editingGroup, setEditingGroup] = useState<ItemGroup | null>(null);
	const [newGroupName, setNewGroupName] = useState("");

	// Filter based on search query
	const filteredGroups = groups.filter((g) =>
		g.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleOpenAdd = () => {
		setEditingGroup(null);
		setNewGroupName("");
		setIsOpen(true);
	};

	const handleOpenEdit = (group: ItemGroup) => {
		setEditingGroup(group);
		setNewGroupName(group.name);
		setIsOpen(true);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newGroupName.trim()) return;

		if (editingGroup) {
			// Edit existing item group
			setGroups((prev) =>
				prev.map((g) => (g.id === editingGroup.id ? { ...g, name: newGroupName } : g))
			);
		} else {
			// Add new item group
			const newGroup: ItemGroup = {
				id: `g-${Date.now()}`,
				name: newGroupName,
				is_disable: false,
				createdAt: new Date().toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" }),
				itemCount: 0,
			};
			setGroups((prev) => [newGroup, ...prev]);
		}
		setIsOpen(false);
	};

	const handleToggleDisable = (id: string) => {
		setGroups((prev) =>
			prev.map((g) => (g.id === id ? { ...g, is_disable: !g.is_disable } : g))
		);
	};

	const handleDelete = (id: string) => {
		setGroups((prev) => prev.filter((g) => g.id !== id));
	};

	return (
		<div className="space-y-6">
			{/* Header area with titles and actions */}
			<AdminHeader
				title="مجموعات المواد"
				subtitle="إدارة وتصنيف أقسام المنيو والخدمات الخاصة بالمقهى."
			>
				<button
					onClick={handleOpenAdd}
					className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 w-full sm:w-auto"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
					</svg>
					<span>مجموعة جديدة</span>
				</button>
			</AdminHeader>

			{/* Filter panel & Search (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					{/* Search field */}
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder="البحث باسم المجموعة..."
					/>
					<span className="text-xs text-zinc-400 font-bold">
						إجمالي المجموعات: {groups.length}
					</span>
				</div>

				{/* Table Area with native Tailwind v4 Spacing */}
				<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
					<table className="min-w-212.5 w-full border-collapse text-right text-sm">
						<thead>
							<tr className="border-b border-white/10 text-zinc-400 text-xs font-black">
								<th className="pb-3 px-4 text-right whitespace-nowrap">اسم المجموعة</th>
								<th className="pb-3 px-4 text-right whitespace-nowrap">عدد المواد المندرجة</th>
								<th className="pb-3 px-4 text-right whitespace-nowrap">تاريخ الإنشاء</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">الحالة</th>
								<th className="pb-3 px-4 text-center whitespace-nowrap">الإجراءات</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredGroups.length > 0 ? (
								filteredGroups.map((group) => (
									<tr key={group.id} className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200">
										<td className="py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
											{group.name}
										</td>
										<td className="py-4 px-4 text-zinc-300 font-bold text-xs whitespace-nowrap">
											{group.itemCount} مواد مضافة
										</td>
										<td className="py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap">
											{group.createdAt}
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
												!group.is_disable 
													? "bg-green-500/10 text-green-400 border-green-500/20" 
													: "bg-red-500/10 text-red-400 border-red-500/20"
											}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${!group.is_disable ? "bg-green-400" : "bg-red-400"}`} />
												{!group.is_disable ? "نشطة وقابلة للطلب" : "معطلة مؤقتاً"}
											</span>
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex items-center justify-center gap-2">
												
												{/* Toggle Active state */}
												<button
													onClick={() => handleToggleDisable(group.id)}
													className={`p-1.5 rounded-lg border transition-all duration-200 ${
														!group.is_disable 
															? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400" 
															: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
													}`}
													title={!group.is_disable ? "تعطيل القسم" : "تفعيل القسم"}
												>
													{!group.is_disable ? (
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
														</svg>
													) : (
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
													)}
												</button>

												{/* Edit group */}
												<button
													onClick={() => handleOpenEdit(group)}
													className="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200"
													title="تعديل اسم المجموعة"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>

												{/* Delete group */}
												<button
													onClick={() => handleDelete(group.id)}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
													title="مسح القسم"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="py-10 text-center text-zinc-500 font-medium text-xs">
										لا توجد مجموعات مواد تطابق معايير اختيارك.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal: ADD/EDIT CATEGORY GROUP */}
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
							{editingGroup ? "تعديل اسم مجموعة المواد" : "إضافة مجموعة تصنيف جديدة"}
						</h2>

						<form onSubmit={handleSave} className="space-y-4">
							<div className="space-y-1.5">
								<label htmlFor="groupName" className="text-xs font-bold text-zinc-400">
									اسم المجموعة بالكامل
								</label>
								<input
									id="groupName"
									type="text"
									value={newGroupName}
									onChange={(e) => setNewGroupName(e.target.value)}
									placeholder="مثال: القهوة المقطرة، كعك ومخبوزات..."
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
									autoFocus
								/>
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
									{editingGroup ? "حفظ التغييرات" : "إدراج وتفعيل"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
