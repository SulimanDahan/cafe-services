"use client";

import { LOGOUT_API_ROUTE, ME_API_ROUTE, USER_API_ROUTE } from "@/config/api_routes";
import UserModel from "../models/data_models/user_model";
import {
    type ReactNode,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { createGenericContext, useGenericCrudLogic, type GenericContextType } from "./generic_context";

/**
 * Specialized Type for User Context.
 * Extends the generic pattern with auth-specific derived values.
 */
interface UserContextType {
    user: UserModel | null;
    users: UserModel[];
    total: number;
    totalPages: number;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    isUsersLoading: boolean;
    clearUser: () => void;
    refreshUser: () => Promise<UserModel | null>;
    logout: () => Promise<void>;
    fetchAllUsers: (queryParams?: Record<string, string>) => Promise<void>;
    addUser: (userData: Partial<UserModel>) => Promise<boolean>;
    updateUser: (id: string, userData: Partial<UserModel>) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
}

// Create the generic context instance for Users
const { Context: UserContext, useGenericContext } = createGenericContext<UserModel>();

/**
 * User Provider implementation using Generic CRUD logic.
 */
export function UserProvider({ children }: { children: ReactNode }) {
    const {
        data: user,
        list: users,
        total,
        totalPages,
        isLoading,
        isListLoading: isUsersLoading,
        clear: clearUser,
        refresh: refreshUser,
        fetchAll: fetchAllUsers,
        add: addUser,
        update: updateUser,
        deleteItem: deleteUser,
    } = useGenericCrudLogic<UserModel>({
        apiRoute: USER_API_ROUTE,
        refreshRoute: ME_API_ROUTE,
        dataMapper: (res) => {
            const result = res as { success: boolean; data?: { user: UserModel } };
            return result.success && result.data?.user ? result.data.user : null;
        },
    });

    /**
     * Specialized logout logic.
     */
    const logout = useCallback(async () => {
        try {
            await fetch(LOGOUT_API_ROUTE, {
                method: "POST",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            clearUser();
        }
    }, [clearUser]);

    // Initialize user session on mount
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Construct the context value with derived properties
    const value = useMemo(
        () => ({
            user,
            users,
            total,
            totalPages,
            isAuthenticated: !!user,
            isAdmin: user?.is_admin ?? false,
            isLoading,
            isUsersLoading,
            clearUser,
            refreshUser,
            logout,
            fetchAllUsers,
            addUser,
            updateUser,
            deleteUser,
        }),
        [
            user,
            users,
            total,
            totalPages,
            isLoading,
            isUsersLoading,
            clearUser,
            refreshUser,
            logout,
            fetchAllUsers,
            addUser,
            updateUser,
            deleteUser,
        ]
    );

    return (
        <UserContext.Provider value={value as unknown as GenericContextType<UserModel>}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook to access the User Context.
 */
export function useUser() {
    return useGenericContext("useUser") as unknown as UserContextType;
}
