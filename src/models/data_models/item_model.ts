import { Decimal } from "@prisma/client/runtime/client";

type ItemModel = {
    name: string;
    id: string;
    created_at: Date;
    price: Decimal;
    is_disable: boolean;
    group_id: string;
};

export const initialItemState: ItemModel = {
    name: "",
    id: "",
    created_at: new Date(),
    price: new Decimal(0),
    is_disable: false,
    group_id: "",
};

export default ItemModel;