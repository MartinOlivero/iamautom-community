"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Badge } from "@/types/database";

export interface BadgeWithStatus extends Badge {
    earned: boolean;
    earned_at: string | null;
}

/**
 * Fetches all badges with the user's earned status.
 */
export function useBadges(userId?: string) {
    const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchBadges = useCallback(async () => {
        setIsLoading(true);

        // Fetch all badges
        const { data: allBadges } = await supabase
            .from("badges")
            .select("*")
            .order("condition_value", { ascending: true });

        if (!allBadges) {
            setIsLoading(false);
            return;
        }

        // Fetch user's earned badges
        const earnedMap: Record<string, string> = {};

        if (userId) {
            const { data: userBadges } = await supabase
                .from("user_badges")
                .select("badge_id, earned_at")
                .eq("user_id", userId);

            if (userBadges) {
                for (const ub of userBadges) {
                    earnedMap[ub.badge_id] = ub.earned_at;
                }
            }
        }

        const badgesWithStatus: BadgeWithStatus[] = allBadges.map((badge) => ({
            ...badge,
            earned: badge.id in earnedMap,
            earned_at: earnedMap[badge.id] || null,
        }));

        setBadges(badgesWithStatus);
        setIsLoading(false);
    }, [supabase, userId]);

    useEffect(() => {
        fetchBadges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return { badges, isLoading, refetch: fetchBadges };
}
