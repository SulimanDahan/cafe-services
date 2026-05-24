/**
 * Represents a menu item category (e.g. Hot Drinks, Cold Drinks).
 * Matches the Prisma ItemGroup model.
 */
type ItemGroupModel = {
 id: string;
 name: string;
 is_disable: boolean;
 created_at: Date;
 updated_at: Date;
 /** Included via Prisma _count aggregation */
 _count?: { items: number };
};

export const initialItemGroupState: ItemGroupModel = {
 id: "",
 name: "",
 is_disable: false,
 created_at: new Date(),
 updated_at: new Date(),
};

export default ItemGroupModel;