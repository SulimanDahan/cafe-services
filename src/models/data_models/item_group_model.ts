type ItemGroupModel = {
    name: string;
    id: string;
    created_at: Date;
}

export const initialItemGroupState: ItemGroupModel = {
    name: "",
    id: "",
    created_at: new Date(),
}

export default ItemGroupModel