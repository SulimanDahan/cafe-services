import ItemGroupModel from "./item_group_model";

/**
 * Represents a menu item (beverage, food, etc.).
 * Matches the Prisma Item model.
 */
type ItemModel = {
	id: string;
	name: string;
	price: number;
	group_id: string;
	is_disable: boolean;
	image?: string | null;
	created_at: Date;
	updated_at: Date;
	/** Included via Prisma relation */
	group?: ItemGroupModel;
};

export const initialItemState: ItemModel = {
	id: "",
	name: "",
	price: 0,
	group_id: "",
	image: null,
	is_disable: false,
	created_at: new Date(),
	updated_at: new Date(),
};

export default ItemModel;
