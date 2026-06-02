"use client";

import { ITEM_API_ROUTE } from "@/config/api_routes";
import ItemModel from "@/models/data_models/item_model";
import { type ReactNode, useMemo } from "react";
import {
    createGenericContext,
    useGenericCrudLogic,
    type GenericContextType,
} from "./generic_context";

/** Specialized type for Item context operations. */
interface ItemContextType {
    items: ItemModel[];
    total: number;
    totalPages: number;
    isItemsLoading: boolean;
    fetchAllItems: (queryParams?: Record<string, string>) => Promise<void>;
    addItem: (data: Partial<ItemModel>) => Promise<boolean>;
    updateItem: (id: string, data: Partial<ItemModel>, onError?: (err: string) => void) => Promise<boolean>;
    deleteItem: (
        id: string,
        onError?: (err: string) => void,
    ) => Promise<boolean>;
}

const { Context: ItemContext, useGenericContext } =
    createGenericContext<ItemModel>();

/**
 * Provider for Item (menu) CRUD operations.
 * Items include their group relation from the API.
 * Auto-fetch removed — pages control fetch with pagination params.
 */
export function ItemProvider({ children }: { children: ReactNode }) {
    const {
        list: items,
        total,
        totalPages,
        isListLoading: isItemsLoading,
        fetchAll: fetchAllItems,
        add: addItem,
        update: updateItem,
        deleteItem,
    } = useGenericCrudLogic<ItemModel>({
        apiRoute: ITEM_API_ROUTE,
    });

    const value = useMemo(
        () => ({
            data: null,
            list: items,
            total,
            totalPages,
            isLoading: false,
            isListLoading: isItemsLoading,
            setData: () => {},
            setList: () => {},
            clear: () => {},
            refresh: async () => null,
            fetchAll: fetchAllItems,
            add: addItem,
            update: updateItem,
            deleteItem,
        }),
        [
            items,
            total,
            totalPages,
            isItemsLoading,
            fetchAllItems,
            addItem,
            updateItem,
            deleteItem,
        ],
    );

    return (
        <ItemContext.Provider value={value}>{children}</ItemContext.Provider>
    );
}

/** Hook to access Item context. */
export function useItem(): ItemContextType {
    const ctx = useGenericContext(
        "useItem",
    ) as unknown as GenericContextType<ItemModel>;
    return {
        items: ctx.list,
        total: ctx.total,
        totalPages: ctx.totalPages,
        isItemsLoading: ctx.isListLoading,
        fetchAllItems: ctx.fetchAll,
        addItem: ctx.add,
        updateItem: ctx.update,
        deleteItem: ctx.deleteItem,
    };
}
