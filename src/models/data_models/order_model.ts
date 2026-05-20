import ReservationModel from "./reservation_model";

/**
 * Represents a customer order for a specific item within a reservation.
 * Matches the Prisma Order model.
 */
type OrderModel = {
    id: string;
    reservation_id: string;
    item_id: string;
    item_price: number;
    quantity: number;
    created_at: Date;
    updated_at: Date;
    /** Included via Prisma relation */
    item?: { id: string; name: string; price: number };
    /** Included via Prisma relation */
    reservation?: ReservationModel;
};

export const initialOrderState: OrderModel = {
    id: "",
    item_id: "",
    quantity: 0,
    item_price: 0,
    reservation_id: "",
    created_at: new Date(),
    updated_at: new Date(),
};

export default OrderModel;
