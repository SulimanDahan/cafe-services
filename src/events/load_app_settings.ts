import { SETTINGS_API_ROUTE } from "@/config/api_routes";
import { SettingsModel } from "@/models/settings_model";

const loadAppSettings = async () => {
    try {
        const response = await fetch(SETTINGS_API_ROUTE);
        if (!response.ok) {
            throw new Error(`Failed to load settings: ${response.statusText}`);
        }
        const settings = await response.json();
        return settings as SettingsModel;
    } catch (error) {
        console.error("Error loading settings:", error);
        return null; // or return default settings if appropriate
    }
};

export default loadAppSettings;