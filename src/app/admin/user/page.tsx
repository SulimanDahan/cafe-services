"use client";

import { useState } from "react";

interface User {
	id: string;
	username: string;
	is_admin: boolean;
	is_disable: boolean;
	createdAt: string;
}

/**
 * Admin User Management Page.
 * Implements the User model representing administrative accounts (Admins and Staff).
 * Supports search, creating users, editing, enabling/disabling, and safe removals with 0 emojis.
 */
export default function UsersAdmin() {
	// Pre-seeded database matching User schema
	const [users, setUsers] = useState<User[]>([
		{
			id: "u1",
			username: "admin",
			is_admin: true,
			is_disable: false,
			createdAt: "12 مايو 2026",
		},
		{
			id: "u2",
			username: "suliman_dahan",
			is_admin: true,
			is_disable: false,
			createdAt: "12 مايو 2026",
		},
		{
			id: "u3",
			username: "barista_ahmed",
			is_admin: false,
			is_disable: false,
			createdAt: "12 مايو 2026",
		},
		{
			id: "u4",
			username: "cashier_sara",
			is_admin: false,
			is_disable: false,
			createdAt: "11 مايو 2026",
		},
		{
			id: "u5",
			username: "temp_user",
			is_admin: false,
			is_disable: true,
			createdAt: "05 مايو 2026",
		},
	]);

	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	// Form input states
	const [usernameInput, setUsernameInput] = useState("");
	const [passwordInput, setPasswordInput] = useState("");
	const [isAdminInput, setIsAdminInput] = useState(false);

	// Filter search logic
	const filteredUsers = users.filter((u) =>
		u.username.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleOpenAdd = () => {
		setEditingUser(null);
		setUsernameInput("");
		setPasswordInput("");
		setIsAdminInput(false);
		setIsOpen(true);
	};

	const handleOpenEdit = (user: User) => {
		setEditingUser(user);
		setUsernameInput(user.username);
		setPasswordInput(""); // Leave password blank on edit unless modifying
		setIsAdminInput(user.is_admin);
		setIsOpen(true);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!usernameInput.trim()) return;

		if (editingUser) {
			// Edit existing user
			setUsers((prev) =>
				prev.map((u) =>
					u.id === editingUser.id
						? {
								...u,
								username: usernameInput,
								is_admin: isAdminInput,
							}
						: u,
				),
			);
		} else {
			// Add new user
			const newUser: User = {
				id: `u-${Date.now()}`,
				username: usernameInput,
				is_admin: isAdminInput,
				is_disable: false,
				createdAt: new Date().toLocaleDateString("ar-SA", {
					day: "numeric",
					month: "long",
					year: "numeric",
				}),
			};
			setUsers((prev) => [newUser, ...prev]);
		}
		setIsOpen(false);
	};

	const handleToggleDisable = (id: string) => {
		setUsers((prev) =>
			prev.map((u) =>
				u.id === id ? { ...u, is_disable: !u.is_disable } : u,
			),
		);
	};

	const handleDelete = (id: string) => {
		// Prevent deleting 'admin' default account
		const target = users.find((u) => u.id === id);
		if (target?.username === "admin") {
			alert(
				"لا يمكن حذف حساب المسؤول الافتراضي (admin) لسلامة دخول النظام!",
			);
			return;
		}
		setUsers((prev) => prev.filter((u) => u.id !== id));
	};

	return (
		<div className="space-y-6">
			{/* Top header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-black text-white tracking-wide">
						إدارة الحسابات والمستخدمين
					</h1>
					<p className="text-xs text-zinc-400 mt-1">
						إضافة وتعديل حسابات الموظفين والمسؤولين المخولين بإدارة
						المقهى ولائحة المواد.
					</p>
				</div>
				<button
					onClick={handleOpenAdd}
					className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center gap-2"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2.5"
							d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
						/>
					</svg>
					<span>إضافة مستخدم جديد</span>
				</button>
			</div>

			{/* Filters Panel (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					{/* Search field */}
					<div className="relative w-full sm:max-w-xs">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="البحث باسم المستخدم..."
							className="w-full bg-[#07080a] border border-white/10 text-white rounded-full pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200"
						/>
						<div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</div>

					<span className="text-xs text-zinc-400 font-bold">
						إجمالي الحسابات: {users.length}
					</span>
				</div>

				{/* Table area (min-w-212.5 safety width) */}
				<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
					<table className="min-w-212.5 w-full border-collapse text-right text-sm">
						<thead>
							<tr className="border-b border-white/10 text-zinc-400 text-xs font-black">
								<th className="pb-3 px-4 text-right">
									اسم مستخدم الحساب
								</th>
								<th className="pb-3 px-4 text-right">
									مستوى الصلاحية
								</th>
								<th className="pb-3 px-4 text-right">
									تاريخ إنشاء الحساب
								</th>
								<th className="pb-3 px-4 text-center">
									حالة الحساب
								</th>
								<th className="pb-3 px-4 text-center">
									التحكم
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<tr
										key={user.id}
										className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
									>
										<td className="py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
											{user.username}
										</td>
										<td className="py-4 px-4 whitespace-nowrap">
											{user.is_admin ? (
												<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border bg-amber-500/10 text-amber-300 border-amber-500/25">
													مدير النظام (Admin)
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border bg-blue-500/10 text-blue-400 border-blue-500/20">
													كاشير / باريستا (Staff)
												</span>
											)}
										</td>
										<td className="py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap">
											{user.createdAt}
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<span
												className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
													!user.is_disable
														? "bg-green-500/10 text-green-400 border-green-500/20"
														: "bg-red-500/10 text-red-400 border-red-500/20"
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full ${!user.is_disable ? "bg-green-400" : "bg-red-400"}`}
												/>
												{!user.is_disable
													? "نشط ومفعل"
													: "معطل مؤقتاً"}
											</span>
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex items-center justify-center gap-2">
												{/* Toggle active state */}
												<button
													onClick={() =>
														handleToggleDisable(
															user.id,
														)
													}
													className={`p-1.5 rounded-lg border transition-all duration-200 ${
														!user.is_disable
															? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
															: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
													}`}
													title={
														!user.is_disable
															? "تعطيل الحساب"
															: "تفعيل الحساب"
													}
												>
													{!user.is_disable ? (
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
															/>
														</svg>
													) : (
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													)}
												</button>

												{/* Edit User details */}
												<button
													onClick={() =>
														handleOpenEdit(user)
													}
													className="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200"
													title="تعديل الحساب"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</button>

												{/* Delete User */}
												<button
													onClick={() =>
														handleDelete(user.id)
													}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
													title="حذف الحساب نهائياً"
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={5}
										className="py-10 text-center text-zinc-500 font-medium text-xs"
									>
										لا توجد حسابات مستخدمين مطابقة للبحث
										حالياً.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal add / edit user (Glassmorphic Container) */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsOpen(false)}
							className="absolute top-4 left-4 text-zinc-400 hover:text-white transition-colors"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						<h2 className="text-lg font-black text-white mb-4">
							{editingUser
								? "تعديل صلاحيات حساب مستخدم"
								: "إنشاء حساب مستخدم جديد"}
						</h2>

						<form onSubmit={handleSave} className="space-y-4">
							{/* Username */}
							<div className="space-y-1.5">
								<label
									htmlFor="usernameIn"
									className="text-xs font-bold text-zinc-400"
								>
									اسم المستخدم (الدخول)
								</label>
								<input
									id="usernameIn"
									type="text"
									value={usernameInput}
									onChange={(e) =>
										setUsernameInput(e.target.value)
									}
									placeholder="مثال: ahmad_barista..."
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required
									autoFocus
								/>
							</div>

							{/* Password (Safe representation) */}
							<div className="space-y-1.5">
								<label
									htmlFor="passwordIn"
									className="text-xs font-bold text-zinc-400"
								>
									كلمة المرور السريـة
								</label>
								<input
									id="passwordIn"
									type="password"
									value={passwordInput}
									onChange={(e) =>
										setPasswordInput(e.target.value)
									}
									placeholder={
										editingUser
											? "اتركه فارغاً للإبقاء على الحالية"
											: "مثال: ••••••••"
									}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200"
									required={!editingUser}
								/>
							</div>

							{/* Role toggle (Admin vs Staff) */}
							<div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-[#07080a]/40">
								<div className="flex flex-col">
									<span className="text-xs font-black text-white">
										ترقية لحساب مدير نظام
									</span>
									<span className="text-[10px] text-zinc-500 font-bold mt-0.5">
										يمنح الحساب كامل صلاحيات التعديل والحذف.
									</span>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={isAdminInput}
										onChange={(e) =>
											setIsAdminInput(e.target.checked)
										}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:content-[''] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
								</label>
							</div>

							<div className="pt-2 flex justify-end gap-2">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
								>
									إلغاء
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all duration-200"
								>
									حفظ الحساب
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
