"use client";

import { useState, useEffect } from "react";
import AdminModal from "@/components/partials/modals/admin_modal";
import { PrimaryButton } from "@/components/button/primary_button";
import FormToggle from "@/components/FormToggle";
import { InputField } from "@/components/input";
import { useLanguage } from "@/config/i18n";
import UserModel from "@/models/data_models/user_model";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: UserModel | null;
    onSave: (
        username: string,
        password?: string,
        isAdmin?: boolean,
    ) => Promise<boolean>;
}

export default function UserModal({
    isOpen,
    onClose,
    editingUser,
    onSave,
}: UserModalProps) {
    const { t } = useLanguage();
    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isAdminInput, setIsAdminInput] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingUser) {
                (() => setUsernameInput(editingUser.username))();
                (() => setPasswordInput(""))();
                (() => setIsAdminInput(editingUser.is_admin))();
            } else {
                (() => setUsernameInput(""))();
                (() => setPasswordInput(""))();
                (() => setIsAdminInput(false))();
            }
        }
    }, [isOpen, editingUser]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameInput.trim()) return;

        const success = await onSave(
            usernameInput,
            passwordInput || undefined,
            isAdminInput,
        );

        if (success) {
            onClose();
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                editingUser
                    ? t("users.modalEditTitle")
                    : t("users.modalAddTitle")
            }
        >
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <InputField
                    label={t("users.formUsernameLabel")}
                    id="usernameIn"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder={t("users.formUsernamePlaceholder")}
                    required
                    autoFocus
                />

                <InputField
                    label={t("users.formPasswordLabel")}
                    id="passwordIn"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={
                        editingUser
                            ? t("users.formPasswordLeaveBlank")
                            : "••••••••"
                    }
                    required={!editingUser}
                />

                <FormToggle
                    checked={isAdminInput}
                    onChange={setIsAdminInput}
                    label={t("users.formPromoteAdmin")}
                    description={t("users.formPromoteAdminDesc")}
                />

                <div className="pt-2 flex justify-end gap-2">
                    <PrimaryButton
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        size="md"
                    >
                        {t("common.cancel")}
                    </PrimaryButton>
                    <PrimaryButton type="submit" size="md">
                        {t("common.save")}
                    </PrimaryButton>
                </div>
            </form>
        </AdminModal>
    );
}
