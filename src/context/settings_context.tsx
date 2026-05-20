"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	ReactNode,
} from "react";
import { SettingsModel, initialSettings } from "@/models/data_models/settings_model";
import { SETTINGS_API_ROUTE } from "@/config/api_routes";

interface SettingsContextType {
	settings: SettingsModel;
	isLoading: boolean;
	/** Update local context state only (optimistic UI) */
	updateSettingsState: (newSettings: Partial<SettingsModel>) => void;
	/** Persist updated settings to DB and sync context */
	saveSettings: (newSettings: Partial<SettingsModel>) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Provides application settings fetched from DB.
 * `initialData` is passed from the Server Component (app/layout.tsx) for zero-latency first render.
 * A background fetch on mount keeps the client in sync with any changes made since SSR.
 */
export function SettingsProvider({
	children,
	initialData,
}: {
	children: ReactNode;
	initialData: SettingsModel | null;
}) {
	const [settings, setSettings] = useState<SettingsModel>(
		initialData || initialSettings,
	);
	const [isLoading, setIsLoading] = useState(false);

	// Sync from DB on first client mount to catch any drift since SSR
	useEffect(() => {
		if (!initialData) return; // No SSR data — skip background sync
		fetch(SETTINGS_API_ROUTE)
			.then((res) => res.ok ? res.json() : null)
			.then((data) => {
				if (data) {
					const actualSettings = data.success && data.data ? data.data : data;
					setSettings(actualSettings);
				}
			})
			.catch(() => null); // Best-effort — SSR data still shown on error
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const updateSettingsState = useCallback(
		(newSettings: Partial<SettingsModel>) => {
			setSettings((prev) => ({ ...prev, ...newSettings }));
		},
		[],
	);

	/** Save changes to DB, then sync context with the persisted result */
	const saveSettings = useCallback(
		async (newSettings: Partial<SettingsModel>): Promise<boolean> => {
			if (!settings.id) return false;
			setIsLoading(true);
			try {
				const res = await fetch(`${SETTINGS_API_ROUTE}/${settings.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newSettings),
				});
				if (!res.ok) return false;
				const saved: SettingsModel = await res.json();
				setSettings(saved); // Sync with what DB actually stored
				return true;
			} catch {
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[settings.id],
	);

	return (
		<SettingsContext.Provider
			value={{ settings, isLoading, updateSettingsState, saveSettings }}
		>
			{children}
		</SettingsContext.Provider>
	);
}

/** Hook to access application settings from any client component. */
export function useSettings() {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
}
