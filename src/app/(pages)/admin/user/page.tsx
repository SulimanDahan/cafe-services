"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/headers/admin_header";
import SearchInput from "@/components/SearchInput";
import {
    UserAddIcon,
    DisableIcon,
    CheckCircleIcon,
    EditIcon,
    TrashIcon,
} from "@/components/icons";
import { useLanguage } from "@/config/i18n";
import { useSettings } from "@/context/settings_context";
import { useUser } from "@/context/user_context";
import UserModel from "@/models/data_models/user_model";
import Table, { TableColumn } from "@/components/table";
import ErrorModal from "@/components/partials/modals/error_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import { Badge } from "@/components/badge";
import Pagination from "@/components/Pagination";
import { ActionIconButton } from "@/components/button/action_icon_button";
import UserModal from "@/components/partials/modals/admin/UserModal";

/**
 * Admin User Management Page.
 * Implements the User model representing administrative accounts (Admins and Staff).
 * Supports search, creating users, editing, enabling/disabling, and safe removals.
 */
export default function UsersAdmin() {
    const { t, isRtl } = useLanguage();
    const { settings } = useSettings();
    const {
        users,
        total,
        totalPages,
        isUsersLoading,
        fetchAllUsers,
        addUser,
        updateUser,
        deleteUser,
    } = useUser();
    const [isAdminState, setIsAdminState] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UserModel | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const perPage = settings.per_page || 10;

    // Verify if current user is admin
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data?.user?.is_admin) {
                        setIsAdminState(true);
                        return;
                    }
                }
                setIsAdminState(false);
            } catch {
                setIsAdminState(false);
            }
        };
        checkAdmin();
    }, []);

    // Server-fetch users when page or search changes
    useEffect(() => {
        if (isAdminState !== true) return; // Skip fetching if not authenticated/admin
        const params: Record<string, string> = {
            page: String(currentPage),
            per_page: String(perPage),
        };
        if (searchQuery) params.search = searchQuery;
        fetchAllUsers(params);
    }, [currentPage, searchQuery, perPage, fetchAllUsers, isAdminState]);

    // Redirect or block rendering if user is not admin
    if (isAdminState === false) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-surface p-8 space-y-4">
                    <span className="text-4xl block">⚠️</span>
                    <h2 className="text-lg font-black text-white">
                        {t("common.unauthorizedTitle")}
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        {t("common.unauthorizedDesc")}
                    </p>
                </div>
            </div>
        );
    }

    if (isAdminState === null) {
        return (
            <div className="flex items-center justify-center p-12 text-zinc-400 text-xs font-bold">
                {t("common.loading")}
            </div>
        );
    }

    const columns: TableColumn[] = [
        { key: "username", label: t("users.columnUsername") },
        { key: "role", label: t("users.columnRole") },
        { key: "created", label: t("users.columnCreated") },
        { key: "status", label: t("common.status"), align: "center" },
        { key: "actions", label: t("common.actions"), align: "center" },
    ];

    const handleOpenAdd = () => {
        setEditingUser(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (user: UserModel) => {
        setEditingUser(user);
        setIsOpen(true);
    };

    const handleSave = async (
        usernameInput: string,
        passwordInput?: string,
        isAdminInput?: boolean,
    ) => {
        let success = false;
        if (editingUser) {
            // Edit existing user
            success = await updateUser(editingUser.id, {
                username: usernameInput,
                password: passwordInput || undefined,
                is_admin: isAdminInput || false,
            });
        } else {
            // Add new user
            success = await addUser({
                username: usernameInput,
                password: passwordInput || "",
                is_admin: isAdminInput || false,
            });
        }

        if (!success) {
            setErrorModalMsg(t("common.errorOccurred"));
        }
        return success;
    };

    const handleToggleDisable = async (user: UserModel) => {
        if (user.is_admin) {
            setErrorModalMsg(t("users.errDeleteAdmin"));
            return;
        }
        await updateUser(user.id, {
            is_disable: !user.is_disable,
        });
    };

    const handleDeleteUser = async (id: string) => {
        // Prevent deleting admin accounts
        const target = users.find((u) => u.id === id);
        if (target?.is_admin || target?.username === "admin") {
            const alertMsg = t("users.errDeleteAdmin");
            setErrorModalMsg(alertMsg);
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
                <PrimaryButton onClick={handleOpenAdd} size="md">
                    <UserAddIcon className="w-4 h-4" />
                    <span>{t("users.addUser")}</span>
                </PrimaryButton>
            </AdminHeader>

            {/* Filters Panel (High-contrast glassmorphism) */}
            <div className="rounded-card border border-white/10 bg-surface p-6 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <SearchInput
                        value={searchQuery}
                        onChange={(v) => {
                            setSearchQuery(v);
                            setCurrentPage(1);
                        }}
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
                            <td
                                className={`py-4 px-4 font-bold text-white group-hover:text-primary-light transition-colors whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                            >
                                {user.username}
                            </td>
                            <td
                                className={`py-4 px-4 whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                            >
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
                            <td
                                className={`py-4 px-4 text-zinc-400 text-xs font-medium whitespace-nowrap ${isRtl ? "text-right" : "text-left"}`}
                            >
                                {formatDate(user.created_at)}
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <Badge
                                    variant={
                                        !user.is_disable ? "success" : "error"
                                    }
                                    pulse
                                >
                                    {!user.is_disable
                                        ? t("users.statusActive")
                                        : t("users.statusDisabled")}
                                </Badge>
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                    {/* Toggle active state */}
                                    <ActionIconButton
                                        variant={
                                            !user.is_disable
                                                ? "disable"
                                                : "enable"
                                        }
                                        icon={
                                            !user.is_disable ? (
                                                <DisableIcon className="w-4 h-4" />
                                            ) : (
                                                <CheckCircleIcon className="w-4 h-4" />
                                            )
                                        }
                                        title={
                                            !user.is_disable
                                                ? t("users.actionDisable")
                                                : t("users.actionEnable")
                                        }
                                        onClick={() =>
                                            handleToggleDisable(user)
                                        }
                                        disabled={user.is_admin}
                                        className={
                                            user.is_admin
                                                ? "opacity-30 cursor-not-allowed pointer-events-none"
                                                : ""
                                        }
                                    />

                                    {/* Edit User details */}
                                    <ActionIconButton
                                        variant="edit"
                                        icon={<EditIcon className="w-4 h-4" />}
                                        onClick={() => handleOpenEdit(user)}
                                        title={t("common.edit")}
                                    />

                                    {/* Delete User */}
                                    <ActionIconButton
                                        variant="delete"
                                        icon={<TrashIcon className="w-4 h-4" />}
                                        onClick={() =>
                                            handleDeleteUser(user.id)
                                        }
                                        title={t("common.delete")}
                                        disabled={user.is_admin}
                                        className={
                                            user.is_admin
                                                ? "opacity-30 cursor-not-allowed pointer-events-none"
                                                : ""
                                        }
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

            <UserModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                editingUser={editingUser}
                onSave={handleSave}
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
