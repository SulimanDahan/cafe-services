"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import { UserAddIcon, UndoCircleIcon, CheckCircleIcon, EditIcon, TrashIcon } from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useUser } from "@/context/user_context";
import UserModel from "@/models/data_models/user_model";
import Table, { TableColumn } from "@/components/table";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";

/**
 * Admin User Management Page.
 * Implements the User model representing administrative accounts (Admins and Staff).
 * Supports search, creating users, editing, enabling/disabling, and safe removals.
 */
export default function UsersAdmin() {
	const { t, isRtl } = useLanguage();
	const { settings } = useSettings();
	const { users, total, totalPages, isUsersLoading, fetchAllUsers, addUser, updateUser, deleteUser } = useUser();

	const columns: TableColumn[] = [
		{ key: "username", label: t("users.columnUsername") },
		{ key: "role", label: t("users.columnRole") },
		{ key: "created", label: t("users.columnCreated") },
		{ key: "status", label: t("common.status"), align: "center" },
		{ key: "actions", label: t("common.actions"), align: "center" },
	];

	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserModel | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	// Form input states
	const [usernameInput, setUsernameInput] = useState("");
	const [passwordInput, setPasswordInput] = useState("");
	const [isAdminInput, setIsAdminInput] = useState(false);

	const perPage = settings.per_page || 10;

	// Server-fetch users when page or search changes
	useEffect(() => {
		const params: Record<string, string> = { page: String(currentPage), per_page: String(perPage) };
		if (searchQuery) params.search = searchQuery;
		fetchAllUsers(params);
	}, [currentPage, searchQuery, perPage, fetchAllUsers]);

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
				<PrimaryButton
					onClick={handleOpenAdd}
					size="md"
				>
					<UserAddIcon className="w-4 h-4" />
					<span>{t("users.addUser")}</span>
				</PrimaryButton>
			</AdminHeader>

			{/* Filters Panel (High-contrast glassmorphism) */}
			<div className="rounded-[28px] border border-white/10 bg-[#131522] p-6 shadow-md space-y-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<SearchInput
						value={searchQuery}
						onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
						placeholder={t("users.searchPlaceholder")}
					/>

					<span className="text-xs text-zinc-400 font-bold shrink-0">
						{t("users.totalAccounts")} {total}
					</span>
				</div>

				<Table
					columns={columns}
					isLoading={isUsersLoading}
					dataLength={total}
				>
					{users.map((user) => (
						<tr
							key={user.id}
							className="group hover:bg-[#1a1c2c]/40 transition-colors duration-200"
						>
							<td className={`py-4 px-4 font-bold text-white group-hover:text-amber-300 transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
								{user.username}
							</td>
							<td className={`py-4 px-4 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
								{user.is_admin ? (
									<Badge variant="amber">
										{t("users.roleAdminBadge")}
									</Badge>
								) : (
									<Badge variant="info">
										{t("users.roleStaffBadge")}
									</Badge>
								)}
							</td>
							<td className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}>
								{formatDate(user.created_at)}
							</td>
							<td className="py-4 px-4 text-center whitespace-nowrap">
								<Badge
									variant={!user.is_disable ? "success" : "error"}
									pulse
								>
									{!user.is_disable ? t("users.statusActive") : t("users.statusDisabled")}
								</Badge>
							</td>
							<td className="py-4 px-4 text-center whitespace-nowrap">
								<div className="flex items-center justify-center gap-2">
									{/* Toggle active state */}
									<button
										onClick={() => handleToggleDisable(user)}
										className={`p-1.5 rounded-lg border transition-all duration-200 ${!user.is_disable
											? "bg-zinc-800 border-white/10 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
											: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-[#07080a]"
											}`}
										title={!user.is_disable ? t("users.actionDisable") : t("users.actionEnable")}
									>
										{!user.is_disable ? (
											<UndoCircleIcon className="w-4 h-4" />
										) : (
											<CheckCircleIcon className="w-4 h-4" />
										)}
									</button>

									{/* Edit User details */}
									<button
										onClick={() => handleOpenEdit(user)}
										className="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all duration-200"
										title={t("common.edit")}
									>
										<EditIcon className="w-4 h-4" />
									</button>

									{/* Delete User */}
									<button
										onClick={() => handleDeleteUser(user.id)}
										className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
										title={t("common.delete")}
									>
										<TrashIcon className="w-4 h-4" />
									</button>
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
				title={editingUser ? t("users.modalEditTitle") : t("users.modalAddTitle")}
			>
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
							{t("common.save")}
						</PrimaryButton>
					</div>
				</form>
			</AdminModal>
		</div>
	);
}
