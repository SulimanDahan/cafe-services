"use client";

import {
    RESERVATION_API_ROUTE,
} from "@/config/api_routes";
import { sharedSSE } from "@/lib/sse_client";
import ReservationModel from "@/models/data_models/reservation_model";
import { type ReactNode, useEffect, useMemo } from "react";
import {
    createGenericContext,
    useGenericCrudLogic,
    type GenericContextType,
} from "./generic_context";

/** Specialized type for Reservation context operations. */
interface ReservationContextType {
    reservations: ReservationModel[];
    total: number;
    totalPages: number;
    isReservationsLoading: boolean;
    fetchAllReservations: (
        queryParams?: Record<string, string>,
    ) => Promise<void>;
    addReservation: (data: Partial<ReservationModel>) => Promise<boolean>;
    updateReservation: (
        id: string,
        data: Partial<ReservationModel>,
    ) => Promise<boolean>;
    deleteReservation: (id: string) => Promise<boolean>;
    /** Shortcut to accept a reservation */
    acceptReservation: (id: string) => Promise<boolean>;
    /** Activate: marks reservation as physically occupied */
    activateReservation: (id: string) => Promise<boolean>;
    /** Checkout: marks reservation as completed */
    checkoutReservation: (id: string) => Promise<boolean>;
    /** Reject: marks reservation as rejected */
    rejectReservation: (id: string) => Promise<boolean>;
    /** Undo a specific action */
    undoReservationAction: (
        id: string,
        action: "accept" | "activate" | "complete" | "reject",
    ) => Promise<{ success: boolean; error?: string }>;
}

const { Context: ReservationContext, useGenericContext } =
    createGenericContext<ReservationModel>();

/**
 * Provider for Reservation CRUD operations.
 * Reservations include their room relation from the API.
 */
export function ReservationProvider({ children }: { children: ReactNode }) {
    const {
        list: reservations,
        total,
        totalPages,
        isListLoading: isReservationsLoading,
        fetchAll: fetchAllReservations,
        add: addReservation,
        update: updateReservation,
        deleteItem: deleteReservation,
        setList: setReservations,
    } = useGenericCrudLogic<ReservationModel>({
        apiRoute: RESERVATION_API_ROUTE,
    });

    // Listen to SSE for real-time updates
    useEffect(() => {
        sharedSSE.connect();
        const onNewReservation = (event: MessageEvent) => {
            try {
                const newRes = JSON.parse(event.data);
                setReservations((prev) => {
                    if (prev.some((r) => r.id === newRes.id)) return prev;
                    return [newRes, ...prev];
                });
            } catch (e) {
                console.error("Error parsing new reservation from SSE:", e);
            }
        };

        sharedSSE.addEventListener("new-reservation", onNewReservation);

        return () => {
            sharedSSE.removeEventListener(
                "new-reservation",
                onNewReservation,
            );
            sharedSSE.disconnect();
        };
    }, [setReservations]);

    const value = useMemo(
        () => ({
            data: null,
            list: reservations,
            total,
            totalPages,
            isLoading: false,
            isListLoading: isReservationsLoading,
            setData: () => {},
            setList: setReservations,
            clear: () => {},
            refresh: async () => null,
            fetchAll: fetchAllReservations,
            add: addReservation,
            update: updateReservation,
            deleteItem: deleteReservation,
        }),
        [
            reservations,
            total,
            totalPages,
            isReservationsLoading,
            fetchAllReservations,
            addReservation,
            updateReservation,
            deleteReservation,
            setReservations,
        ],
    );

    return (
        <ReservationContext.Provider value={value}>
            {children}
        </ReservationContext.Provider>
    );
}

/** Hook to access Reservation context. */
export function useReservation(): ReservationContextType {
    const ctx = useGenericContext(
        "useReservation",
    ) as unknown as GenericContextType<ReservationModel>;

    const acceptReservation = (id: string) =>
        ctx.update(id, { accepted: true });
    const activateReservation = (id: string) =>
        ctx.update(id, { activated: true });
    const checkoutReservation = (id: string) =>
        ctx.update(id, { completed: true });
    const rejectReservation = (id: string) =>
        ctx.update(id, { rejected: true });

    const undoReservationAction = async (
        id: string,
        action: "accept" | "activate" | "complete" | "reject",
    ): Promise<{ success: boolean; error?: string }> => {
        const payload = {
            accept: { accepted: false },
            activate: { activated: false },
            complete: { completed: false },
            reject: { rejected: false },
        }[action];

        try {
            const response = await fetch(`${RESERVATION_API_ROUTE}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                const result = await response.json();
                const updatedItem = result.data || result;
                ctx.setList(
                    ctx.list.map((item) =>
                        item.id === id ? { ...item, ...updatedItem } : item,
                    ),
                );
                return { success: true };
            }
            const errorData = await response.json().catch(() => null);
            return {
                success: false,
                error: errorData?.error || "common.errorOccurred",
            };
        } catch {
            return { success: false, error: "common.errorOccurred" };
        }
    };

    return {
        reservations: ctx.list,
        total: ctx.total,
        totalPages: ctx.totalPages,
        isReservationsLoading: ctx.isListLoading,
        fetchAllReservations: ctx.fetchAll,
        addReservation: ctx.add,
        updateReservation: ctx.update,
        deleteReservation: ctx.deleteItem,
        acceptReservation,
        activateReservation,
        checkoutReservation,
        rejectReservation,
        undoReservationAction,
    };
}
