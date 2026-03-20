"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";
import { useRefreshOnTabReturn } from "@/hooks/useVisibilityRefresh";

export interface CommunityMember {
    id: string;
    full_name: string;
    avatar_url: string | null;
    level?: string;
    xp_points?: number;
}

export interface CommunityStats {
    totalMembers: number;
    postsThisWeek: number;
    onlineNow: number;
}

export function useCommunityStats() {
    const [onlineMembers, setOnlineMembers] = useState<CommunityMember[]>([]);
    const [topContributors, setTopContributors] = useState<CommunityMember[]>([]);
    const [stats, setStats] = useState<CommunityStats>({
        totalMembers: 0,
        postsThisWeek: 0,
        onlineNow: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const db = createClient();

            // 1. Get online members (active today)
            const today = new Date().toISOString().split("T")[0];
            const { data: onlineData } = await db
                .from("profiles")
                .select("id, full_name, avatar_url, level")
                .gte("last_active_date", today)
                .order("last_active_date", { ascending: false })
                .limit(8);

            // 2. Get top contributors (all time for now, or this month if gamification_events exists)
            const { data: topData } = await db
                .from("profiles")
                .select("id, full_name, avatar_url, level, xp_points")
                .order("xp_points", { ascending: false })
                .limit(3);

            // 3. Get generic stats
            const { count: totalMembers } = await db
                .from("profiles")
                .select("*", { count: 'exact', head: true });

            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: postsThisWeek } = await db
                .from("posts")
                .select("*", { count: 'exact', head: true })
                .gte("created_at", weekAgo);

            setOnlineMembers(onlineData || []);
            setTopContributors(topData || []);
            setStats({
                totalMembers: totalMembers || 0,
                postsThisWeek: postsThisWeek || 0,
                onlineNow: onlineData?.length || 0,
            });

        } catch (err) {
            console.error("Error fetching community stats:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateLastSeen = useCallback(async (userId: string) => {
        const db = createClient();
        await db
            .from("profiles")
            .update({ last_active_date: new Date().toISOString().split("T")[0] })
            .eq("id", userId);
    }, []);

    useRefreshOnTabReturn(fetchStats);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { onlineMembers, topContributors, stats, isLoading, refresh: fetchStats, updateLastSeen };
}
