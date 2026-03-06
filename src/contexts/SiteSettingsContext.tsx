"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/insforge/client";

export interface SiteSettings {
    id: string;
    title: string;
    logo_url: string | null;
    favicon_url: string | null;
}

interface SiteSettingsContextType {
    settings: SiteSettings | null;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: null,
    isLoading: true,
    refreshSettings: async () => { },
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const db = createClient();
            const { data, error } = await db
                .from("site_settings")
                .select("*")
                .limit(1)
                .single();

            if (error) {
                if (error.code !== "PGRST116") {
                    console.error("Error fetching site settings:", error);
                }
            } else if (data) {
                setSettings(data);
            }
        } catch (err) {
            console.error("Unexpected error fetching site settings:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}
