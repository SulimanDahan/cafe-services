"use client";

import { ORDER_API_ROUTE, NOTIFICATION_STREAM_API_ROUTE } from "@/config/api_routes";
import OrderModel from "@/models/data_models/order_model";
import { type ReactNode, useEffect, useMemo } from "react";
import {
 createGenericContext,
 useGenericCrudLogic,
 type GenericContextType,
} from "./generic_context";

/** Specialized type for Order context operations. */
interface OrderContextType {
 orders: OrderModel[];
 isOrdersLoading: boolean;
 fetchAllOrders: () => Promise<void>;
 addOrder: (data: Partial<OrderModel>) => Promise<boolean>;
 updateOrder: (id: string, data: Partial<OrderModel>) => Promise<boolean>;
 deleteOrder: (id: string) => Promise<boolean>;
}

const { Context: OrderContext, useGenericContext } = createGenericContext<OrderModel>();

/**
 * Provider for Order CRUD operations.
 * Orders include their item relation from the API.
 */
export function OrderProvider({ children }: { children: ReactNode }) {
 const {
 list: orders,
 total,
 totalPages,
 isListLoading: isOrdersLoading,
 fetchAll: fetchAllOrders,
 add: addOrder,
 update: updateOrder,
 deleteItem: deleteOrder,
 setList: setOrders,
 } = useGenericCrudLogic<OrderModel>({
 apiRoute: ORDER_API_ROUTE,
 });

 // Auto-fetch on mount and listen to SSE for real-time updates
 useEffect(() => {
 fetchAllOrders();

 const eventSource = new EventSource(NOTIFICATION_STREAM_API_ROUTE);
 const onNewOrder = (event: MessageEvent) => {
 try {
 const newOrder = JSON.parse(event.data);
 setOrders(prev => {
 if (prev.some(o => o.id === newOrder.id)) return prev;
 return [newOrder, ...prev];
 });
 } catch (e) {
 console.error("Error parsing new order from SSE:", e);
 }
 };

 const onOrderDeleted = (event: MessageEvent) => {
 try {
 const deletedOrderId = JSON.parse(event.data);
 setOrders((prev) => prev.filter((o) => o.id !== deletedOrderId));
 } catch (e) {
 console.error("Error parsing deleted order from SSE:", e);
 }
 };

 eventSource.addEventListener("new-order", onNewOrder);
 eventSource.addEventListener("order-deleted", onOrderDeleted);

 return () => {
 eventSource.removeEventListener("new-order", onNewOrder);
 eventSource.removeEventListener("order-deleted", onOrderDeleted);
 eventSource.close();
 };
 }, [fetchAllOrders, setOrders]);

 const value = useMemo(
 () => ({
 data: null,
 list: orders,
 total,
 totalPages,
 isLoading: false,
 isListLoading: isOrdersLoading,
 setData: () => {},
 setList: () => {},
 clear: () => {},
 refresh: async () => null,
 fetchAll: fetchAllOrders,
 add: addOrder,
 update: updateOrder,
 deleteItem: deleteOrder,
 }),
 [orders, total, totalPages, isOrdersLoading, fetchAllOrders, addOrder, updateOrder, deleteOrder]
 );

 return (
 <OrderContext.Provider value={value}>
 {children}
 </OrderContext.Provider>
 );
}

/** Hook to access Order context. */
export function useOrder(): OrderContextType {
 const ctx = useGenericContext("useOrder") as unknown as GenericContextType<OrderModel>;
 return {
 orders: ctx.list,
 isOrdersLoading: ctx.isListLoading,
 fetchAllOrders: ctx.fetchAll,
 addOrder: ctx.add,
 updateOrder: ctx.update,
 deleteOrder: ctx.deleteItem,
 };
}
