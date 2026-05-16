"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import SearchInput from "@/components/SearchInput";
import { useLanguage } from "@/config/i18n";
import { useUser } from "@/context/user_context";
import UserModel from "@/models/data_models/user_model";

/**
 * Admin User Management Page.
 * Implements the User model representing administrative accounts (Admins and Staff).
 * Supports search, creating users, editing, enabling/disabling, and safe removals.
 */
export default function UsersAdmin() {
	const { t, isRtl } = useLanguage();
	const { users, isUsersLoading, fetchAllUsers, addUser, updateUser, deleteUser } = useUser();

	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserModel | null>(null);

	// Form input states
	const [usernameInput, setUsernameInput] = useState("");
	const [passwordInput, setPasswordInput] = useState("");
	const [isAdminInput, setIsAdminInput] = useState(false);

	// Fetch users on mount
	useEffect(() => {
		fetchAllUsers();
	}, [fetchAllUsers]);

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

	const handleOpenEdit = (user: UserModel) => {
		setEditingUser(user);
		setUsernameInput(user.username);
		setPasswordInput(""); // Leave password blank on edit unless modifying
		setIsAdminInput(user.is_admin);
		setIsOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!usernameInput.trim()) return;

		let success = false;
		if (editingUser) {
			// Edit existing user
			success = await updateUser(editingUser.id, {
				username: usernameInput,
				password: passwordInput || undefined,
				is_admin: isAdminInput,
			});
		} else {
			// Add new user
			success = await addUser({
				username: usernameInput,
				password: passwordInput,
				is_admin: isAdminInput,
			});
		}

		if (success) {
			setIsOpen(false);
		} else {
			alert(t("common.errorOccurred"));
		}
	};

	const handleToggleDisable = async (user: UserModel) => {
		await updateUser(user.id, {
			is_disable: !user.is_disable,
		});
	};

	const handleDeleteUser = async (id: string) => {
		// Prevent deleting 'admin' default account
		const target = users.find((u) => u.id === id);
		if (target?.username === "admin") {
			const alertMsg = t("users.errDeleteAdmin");
			alert(alertMsg);
			return;
		}
		
		if (confirm(t("common.confirmDelete"))) {
			await deleteUser(id);
		}
	};

	// Helper for date formatting
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
			{/* Top header */}
			<AdminHeader
				title={t("users.title")}
				subtitle={t("users.subtitle")}
			>
				<button
					onClick={handleOpenAdd}
					className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] font-extrabold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 w-full sm:w-auto"
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
					<span>{t("users.addUser")}</span>
				</button>
			</AdminHeader>

			{/* Filters Panel (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					{/* Search field */}
					<SearchInput
						value={searchQuery}
						onChange={setSearchQuery}
						placeholder={t("users.searchPlaceholder")}
					/>

					<span className="text-xs text-zinc-400 font-bold shrink-0">
						{t("users.totalAccounts")} {users.length}
					</span>
				</div>

				{/* Table area (min-w-212.5 safety width) */}
				<div className="overflow-x-auto overflow-y-auto max-h-100 lg:max-h-[calc(100vh-340px)]">
					<table className="min-w-212.5 w-full border-collapse text-sm">
						<thead>
							<tr className={`border-b border-white/10 text-zinc-400 text-xs font-black ${isRtl ? "text-right" : "text-left"}`}>
								<th className="pb-3 px-4">{t("users.columnUsername")}</th>
								<th className="pb-3 px-4">{t("users.columnRole")}</th>
								<th className="pb-3 px-4">{t("users.columnCreated")}</th>
								<th className="pb-3 px-4 text-center">{t("common.status")}</th>
								<th className="pb-3 px-4 text-center">{t("common.actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{isUsersLoading ? (
								<tr>
									<td colSpan={5} className="py-10 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
											<span className="text-xs text-zinc-500 font-bold">{t("common.loading")}</span>
										</div>
									</td>
								</tr>
							) : filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<tr
										key={user.id}
										className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
									>
										<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{user.username}
										</td>
										<td className={`py-4 px-4 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{user.is_admin ? (
												<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border bg-amber-500/10 text-amber-300 border-amber-500/25">
													{t("users.roleAdminBadge")}
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border bg-blue-500/10 text-blue-400 border-blue-500/20">
													{t("users.roleStaffBadge")}
												</span>
											)}
										</td>
										<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
											{formatDate(user.created_at)}
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
												{!user.is_disable ? t("users.statusActive") : t("users.statusDisabled")}
											</span>
										</td>
										<td className="py-4 px-4 text-center whitespace-nowrap">
											<div className="flex items-center justify-center gap-2">
												{/* Toggle active state */}
												<button
													onClick={() => handleToggleDisable(user)}
													className={`p-1.5 rounded-lg border transition-all duration-200 ${
														!user.is_disable
															? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
															: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
													}`}
													title={!user.is_disable ? t("users.actionDisable") : t("users.actionEnable")}
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
													onClick={() => handleOpenEdit(user)}
													className="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200"
													title={t("common.edit")}
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
													onClick={() => handleDeleteUser(user.id)}
													className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
													title={t("common.delete")}
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
										{t("common.noData")}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal add / edit user (Glassmorphic Container) */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
					<div className="max-w-md w-full rounded-3xl border border-white/15 bg-[#131522]/95 backdrop-blur-xl p-6 shadow-2xl relative">
						<button
							onClick={() => setIsOpen(false)}
							className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-zinc-400 hover:text-white transition-colors`}
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
								? t("users.modalEditTitle")
								: t("users.modalAddTitle")}
						</h2>

						<form onSubmit={handleSave} className="space-y-4">
							{/* Username */}
							<div className="space-y-1.5">
								<label
									htmlFor="usernameIn"
									className="text-xs font-bold text-zinc-400 block"
								>
									{t("users.formUsernameLabel")}
								</label>
								<input
									id="usernameIn"
									type="text"
									value={usernameInput}
									onChange={(e) => setUsernameInput(e.target.value)}
									placeholder={t("users.formUsernamePlaceholder")}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200 block"
									required
									autoFocus
								/>
							</div>

							{/* Password (Safe representation) */}
							<div className="space-y-1.5">
								<label
									htmlFor="passwordIn"
									className="text-xs font-bold text-zinc-400 block"
								>
									{t("users.formPasswordLabel")}
								</label>
								<input
									id="passwordIn"
									type="password"
									value={passwordInput}
									onChange={(e) => setPasswordInput(e.target.value)}
									placeholder={
										editingUser
											? t("users.formPasswordLeaveBlank")
											: "••••••••"
									}
									className="w-full bg-[#07080a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-all duration-200 block"
									required={!editingUser}
								/>
							</div>

							{/* Role toggle (Admin vs Staff) */}
							<div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-[#07080a]/40">
								<div className="flex flex-col">
									<span className="text-xs font-black text-white">
										{t("users.formPromoteAdmin")}
									</span>
									<span className="text-[10px] text-zinc-500 font-bold mt-0.5">
										{t("users.formPromoteAdminDesc")}
									</span>
								</div>
								<label className="relative inline-flex items-center cursor-pointer shrink-0">
									<input
										type="checkbox"
										checked={isAdminInput}
										onChange={(e) => setIsAdminInput(e.target.checked)}
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
									{t("common.cancel")}
								</button>
								<button
									type="submit"
									className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#07080a] text-xs font-extrabold transition-all duration-200"
								>
									{t("common.save")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
