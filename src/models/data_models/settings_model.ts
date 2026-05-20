export type SettingsModel = {
	id: string;
	currency_name: string;
	notification_threshold: number;
	app_lang: string;
	per_page: number;
	session_expiry_minutes: number;
	force_client_order_session_passKey: boolean;
	created_at: Date;
	updated_at: Date;
};

export const initialSettings: SettingsModel = {
	id: "",
	currency_name: "",
	notification_threshold: 0,
	app_lang: "ar",
	per_page: 0,
	session_expiry_minutes: 0,
	force_client_order_session_passKey: false,
	created_at: new Date(),
	updated_at: new Date(),
};
