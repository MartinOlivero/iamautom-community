"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

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
    const supabase = createClient();

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
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

        // Subscribe to real-time changes
        const channel = supabase
            .channel("site_settings_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "site_settings",
                },
                (payload) => {
                    if (payload.new) {
                        setSettings(payload.new as SiteSettings);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase]);

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}
