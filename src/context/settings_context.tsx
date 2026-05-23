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

	// Sync from DB on first client mount to catch any drift since SSR or load if SSR returned null
	useEffect(() => {
		fetch(SETTINGS_API_ROUTE, { cache: "no-store" })
			.then((res) => res.ok ? res.json() : null)
			.then((data) => {
				if (data) {
					if (data.success && data.data && data.data.id) {
						setSettings(data.data);
					} else if (data.id) {
						setSettings(data);
					}
				}
			})
			.catch(() => null);
	}, []);

	const updateSettingsState = useCallback(
		(newSettings: Partial<SettingsModel>) => {
			setSettings((prev) => ({ ...prev, ...newSettings }));
		},
		[],
	);

	/** Save changes to DB, then sync context with the persisted result */
	const saveSettings = useCallback(
		async (newSettings: Partial<SettingsModel>): Promise<boolean> => {
			const targetId = settings.id || "singleton";
			setIsLoading(true);
			try {
				const res = await fetch(`${SETTINGS_API_ROUTE}/${targetId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newSettings),
					cache: "no-store",
				});
				if (!res.ok) return false;
				const saved: SettingsModel = await res.json();
				if (saved && saved.id) {
					setSettings(saved); // Sync with what DB actually stored
					return true;
				}
				return false;
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
