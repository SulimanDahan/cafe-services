import { SETTINGS_API_ROUTE } from "@/config/api_routes";
import { SettingsModel } from "@/models/data_models/settings_model";

const loadAppSettings = async () => {
	try {
		const response = await fetch(SETTINGS_API_ROUTE);
		if (!response.ok) {
			throw new Error(`Failed to load settings: ${response.statusText}`);
		}
		const result = await response.json();
		return result.success ? (result.data as SettingsModel) : null;
	} catch (error) {
		console.error("Error loading settings:", error);
		return null;
	}
};

export default loadAppSettings;
