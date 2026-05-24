"use client";

import { ROOM_API_ROUTE } from "@/config/api_routes";
import RoomModel from "@/models/data_models/room_model";
import { type ReactNode, useMemo } from "react";
import {
 createGenericContext,
 useGenericCrudLogic,
 type GenericContextType,
} from "./generic_context";

/** Specialized type for Room context operations. */
interface RoomContextType {
 rooms: RoomModel[];
 total: number;
 totalPages: number;
 isRoomsLoading: boolean;
 fetchAllRooms: (queryParams?: Record<string, string>) => Promise<void>;
 addRoom: (data: Partial<RoomModel>) => Promise<boolean>;
 updateRoom: (id: string, data: Partial<RoomModel>) => Promise<boolean>;
 deleteRoom: (id: string) => Promise<boolean>;
}

const { Context: RoomContext, useGenericContext } = createGenericContext<RoomModel>();

/**
 * Provider for Room (dining table) CRUD operations.
 * Manages physical rooms and their QR code tokens.
 * Auto-fetch removed — pages control fetch with pagination params.
 */
export function RoomProvider({ children }: { children: ReactNode }) {
 const {
 list: rooms,
 total,
 totalPages,
 isListLoading: isRoomsLoading,
 fetchAll: fetchAllRooms,
 add: addRoom,
 update: updateRoom,
 deleteItem: deleteRoom,
 } = useGenericCrudLogic<RoomModel>({
 apiRoute: ROOM_API_ROUTE,
 });

 const value = useMemo(
 () => ({
 data: null,
 list: rooms,
 total,
 totalPages,
 isLoading: false,
 isListLoading: isRoomsLoading,
 setData: () => {},
 setList: () => {},
 clear: () => {},
 refresh: async () => null,
 fetchAll: fetchAllRooms,
 add: addRoom,
 update: updateRoom,
 deleteItem: deleteRoom,
 }),
 [rooms, total, totalPages, isRoomsLoading, fetchAllRooms, addRoom, updateRoom, deleteRoom]
 );

 return (
 <RoomContext.Provider value={value}>
 {children}
 </RoomContext.Provider>
 );
}

/** Hook to access Room context. */
export function useRoom(): RoomContextType {
 const ctx = useGenericContext("useRoom") as unknown as GenericContextType<RoomModel>;
 return {
 rooms: ctx.list,
 total: ctx.total,
 totalPages: ctx.totalPages,
 isRoomsLoading: ctx.isListLoading,
 fetchAllRooms: ctx.fetchAll,
 addRoom: ctx.add,
 updateRoom: ctx.update,
 deleteRoom: ctx.deleteItem,
 };
}
