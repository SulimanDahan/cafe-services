"use client";

import { ITEM_GROUP_API_ROUTE } from "@/config/api_routes";
import ItemGroupModel from "@/models/data_models/item_group_model";
import { type ReactNode, useMemo } from "react";
import {
 createGenericContext,
 useGenericCrudLogic,
 type GenericContextType,
} from "./generic_context";

/** Specialized type for ItemGroup context operations. */
interface ItemGroupContextType {
 groups: ItemGroupModel[];
 total: number;
 totalPages: number;
 isGroupsLoading: boolean;
 fetchAllGroups: (queryParams?: Record<string, string>) => Promise<void>;
 addGroup: (data: Partial<ItemGroupModel>) => Promise<boolean>;
 updateGroup: (id: string, data: Partial<ItemGroupModel>) => Promise<boolean>;
 deleteGroup: (id: string) => Promise<boolean>;
}

const { Context: ItemGroupContext, useGenericContext } = createGenericContext<ItemGroupModel>();

/**
 * Provider for Item Group CRUD operations.
 * Fetches categories from the DB and exposes add/update/delete methods.
 * Auto-fetch removed — pages control fetch with pagination params.
 */
export function ItemGroupProvider({ children }: { children: ReactNode }) {
 const {
 list: groups,
 total,
 totalPages,
 isListLoading: isGroupsLoading,
 fetchAll: fetchAllGroups,
 add: addGroup,
 update: updateGroup,
 deleteItem: deleteGroup,
 } = useGenericCrudLogic<ItemGroupModel>({
 apiRoute: ITEM_GROUP_API_ROUTE,
 });

 const value = useMemo(
 () => ({
 data: null,
 list: groups,
 total,
 totalPages,
 isLoading: false,
 isListLoading: isGroupsLoading,
 setData: () => {},
 setList: () => {},
 clear: () => {},
 refresh: async () => null,
 fetchAll: fetchAllGroups,
 add: addGroup,
 update: updateGroup,
 deleteItem: deleteGroup,
 }),
 [groups, total, totalPages, isGroupsLoading, fetchAllGroups, addGroup, updateGroup, deleteGroup]
 );

 return (
 <ItemGroupContext.Provider value={value}>
 {children}
 </ItemGroupContext.Provider>
 );
}

/** Hook to access Item Group context. */
export function useItemGroup(): ItemGroupContextType {
 const ctx = useGenericContext("useItemGroup") as unknown as GenericContextType<ItemGroupModel>;
 return {
 groups: ctx.list,
 total: ctx.total,
 totalPages: ctx.totalPages,
 isGroupsLoading: ctx.isListLoading,
 fetchAllGroups: ctx.fetchAll,
 addGroup: ctx.add,
 updateGroup: ctx.update,
 deleteGroup: ctx.deleteItem,
 };
}
