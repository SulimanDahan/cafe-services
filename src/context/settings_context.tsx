"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SettingsModel, initialSettings } from "@/models/data_models/settings_model";

interface SettingsContextType {
    settings: SettingsModel;
    updateSettingsState: (newSettings: Partial<SettingsModel>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ 
    children, 
    initialData 
}: { 
    children: ReactNode; 
    initialData: SettingsModel | null;
}) {
    const [settings, setSettings] = useState<SettingsModel>(initialData || initialSettings);

    const updateSettingsState = (newSettings: Partial<SettingsModel>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettingsState }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
