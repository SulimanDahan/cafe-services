"use client";

import { RESERVATION_API_ROUTE, NOTIFICATION_STREAM_API_ROUTE } from "@/config/api_routes";
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
    fetchAllReservations: (queryParams?: Record<string, string>) => Promise<void>;
    addReservation: (data: Partial<ReservationModel>) => Promise<boolean>;
    updateReservation: (id: string, data: Partial<ReservationModel>) => Promise<boolean>;
    deleteReservation: (id: string) => Promise<boolean>;
    /** Shortcut to accept a reservation */
    acceptReservation: (id: string) => Promise<boolean>;
    /** Checkout: marks reservation as completed and deletes it */
    checkoutReservation: (id: string) => Promise<boolean>;
}

const { Context: ReservationContext, useGenericContext } = createGenericContext<ReservationModel>();

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
        const eventSource = new EventSource(NOTIFICATION_STREAM_API_ROUTE);
        const onNewReservation = (event: MessageEvent) => {
            try {
                const newRes = JSON.parse(event.data);
                setReservations(prev => {
                    if (prev.some(r => r.id === newRes.id)) return prev;
                    return [newRes, ...prev];
                });
            } catch (e) {
                console.error("Error parsing new reservation from SSE:", e);
            }
        };

        eventSource.addEventListener("new-reservation", onNewReservation);

        return () => {
            eventSource.removeEventListener("new-reservation", onNewReservation);
            eventSource.close();
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
            setList: () => {},
            clear: () => {},
            refresh: async () => null,
            fetchAll: fetchAllReservations,
            add: addReservation,
            update: updateReservation,
            deleteItem: deleteReservation,
        }),
        [reservations, total, totalPages, isReservationsLoading, fetchAllReservations, addReservation, updateReservation, deleteReservation]
    );

    return (
        <ReservationContext.Provider value={value}>
            {children}
        </ReservationContext.Provider>
    );
}

/** Hook to access Reservation context. */
export function useReservation(): ReservationContextType {
    const ctx = useGenericContext("useReservation") as unknown as GenericContextType<ReservationModel>;

    const acceptReservation = (id: string) => ctx.update(id, { accepted: true });
    const checkoutReservation = (id: string) => ctx.deleteItem(id);

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
        checkoutReservation,
    };
}
