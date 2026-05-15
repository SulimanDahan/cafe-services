export type SettingsModel = {
    id: string;
    currency_name: string;
    notification_threshold: number;
    app_lang: string;
    per_page: number; // Number of items to display per page
    session_expiry_minutes: number;
    createdAt: string;
    updatedAt: string;
};

export const initialSettings: SettingsModel = {
    id: "",
    currency_name: "",
    notification_threshold: 0,
    app_lang: "ar",
    per_page: 0,
    session_expiry_minutes: 0,
    createdAt: "",
    updatedAt: ""
}
