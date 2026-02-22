"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export type MemberProfile = Pick<
    Profile,
    "id" | "full_name" | "avatar_url" | "plan_type" | "role" | "xp_points" | "level" | "current_streak" | "bio"
>;

export function useMembers() {
    const [members, setMembers] = useState<MemberProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, plan_type, role, xp_points, level, current_streak, bio")
            .neq("plan_type", "none")
            .order("xp_points", { ascending: false });

        if (!error && data) {
            setMembers(data as MemberProfile[]);
        }
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return { members, isLoading, refresh: fetchMembers };
}
