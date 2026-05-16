import { Decimal } from "@prisma/client/runtime/client";

type OrderModel = {
    id: string;
    item_id: string;
    quantity: number;
    item_price: Decimal;
    reservation_id: string;
    created_at: Date;
    updated_at: Date;
};

export const initialOrderState: OrderModel = {
    id: "",
    item_id: "",
    quantity: 0,
    item_price: new Decimal(0),
    reservation_id: "",
    created_at: new Date(),
    updated_at: new Date(),
};

export default OrderModel;
