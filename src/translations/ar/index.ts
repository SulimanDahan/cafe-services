import { common } from "./common";
import { sidebar } from "./sidebar";
import { login } from "./login";
import { dashboard } from "./dashboard";
import { reservations } from "./reservations";
import { orders } from "./orders";
import { itemGroup } from "./itemGroup";
import { item } from "./item";
import { notifications } from "./notifications";
import { users } from "./users";
import { settings } from "./settings";
import { home } from "./home";

const ar = {
	common,
	sidebar,
	login,
	dashboard,
	reservations,
	orders,
	itemGroup,
	item,
	notifications,
	users,
	settings,
	home,
};

export default ar;
export type TranslationSchema = typeof ar;
