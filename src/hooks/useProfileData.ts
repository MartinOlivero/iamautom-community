"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/insforge/client";
import type { Profile } from "@/types/database";

export interface ProfileData extends Profile {
    total_xp: number;
    level_name: string;
    level_number: number;
    is_online: boolean;
}

// In-memory cache for profiles
const profileCache: Record<string, ProfileData> = {};

export function useProfileData(userId: string | undefined) {
    const [data, setData] = useState<ProfileData | null>(userId ? (profileCache[userId] || null) : null);
    const [isLoading, setIsLoading] = useState(!data && !!userId);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setData(null);
            setIsLoading(false);
            return;
        }

        if (profileCache[userId]) {
            setData(profileCache[userId]);
            setIsLoading(false);
            return;
        }

        async function fetchProfileData() {
            setIsLoading(true);
            const supabase = createClient();

            try {
                // 1. Fetch Profile & Level Info
                // We join with level_config if possible, but level in profiles is an enum.
                // Looking at database.ts, profile.level is UserLevel (enum).
                // Let's find the level_number from the enum or query level_config.

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("*, level")
                    .eq("id", userId)
                    .single();

                if (profileError) throw profileError;

                // 4. Online status
                // If updated_at is within 5 minutes
                const lastSeen = new Date(profile.updated_at).getTime();
                const now = Date.now();
                const isOnline = (now - lastSeen) < (5 * 60 * 1000);

                const profileData: ProfileData = {
                    ...profile,
                    total_xp: profile.xp_points || 0,
                    level_name: profile.level as string,
                    level_number: 1, // Fallback, now handled by UI via utility
                    is_online: isOnline,
                };

                profileCache[userId!] = profileData;
                setData(profileData);
            } catch (err: unknown) {
                console.error("Error fetching profile data:", err);
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfileData();
    }, [userId]);

    return { data, isLoading, error };
}
