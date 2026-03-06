"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";
import type { Profile } from "@/types/database";

export type MemberProfile = Pick<
    Profile,
    "id" | "full_name" | "avatar_url" | "plan_type" | "role" | "xp_points" | "level" | "current_streak" | "bio"
>;

export function useMembers() {
    const [members, setMembers] = useState<MemberProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const db = createClient();
            const { data, error } = await db
                .from("profiles")
                .select("id, full_name, avatar_url, plan_type, role, xp_points, level, current_streak, bio")
                .neq("plan_type", "none")
                .order("xp_points", { ascending: false });

            if (error) {
                console.error("Error fetching members:", error);
                setMembers([]);
            } else {
                setMembers((data as MemberProfile[]) || []);
            }
        } catch (err) {
            console.error("Exception fetching members:", err);
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return { members, isLoading, refresh: fetchMembers };
}
