"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";
import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import StreakFlame from "@/components/gamification/StreakFlame";
import Spinner from "@/components/ui/Spinner";
import { LEVEL_THRESHOLDS } from "@/lib/constants";
import { GamificationTooltip } from "@/components/ui/GamificationTooltip";

interface LeaderboardMember {
    id: string;
    full_name: string;
    avatar_url: string | null;
    plan_type: string;
    xp_points: number;
    level: string;
    current_streak: number;
    badge_count: number;
}

/**
 * Enhanced leaderboard page with XP, levels, badges earned, and streaks.
 */
export default function LeaderboardPage() {
    const [members, setMembers] = useState<LeaderboardMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);

        // Fetch top 50 members by XP
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, plan_type, xp_points, level, current_streak")
            .neq("plan_type", "none")
            .order("xp_points", { ascending: false })
            .limit(50);

        if (!profiles) {
            setIsLoading(false);
            return;
        }

        // Fetch badge counts for each user
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userIds = profiles.map((p: any) => p.id);
        const { data: badgeCounts } = await supabase
            .from("user_badges")
            .select("user_id")
            .in("user_id", userIds);

        const badgeCountMap: Record<string, number> = {};
        if (badgeCounts) {
            for (const ub of badgeCounts) {
                badgeCountMap[ub.user_id] = (badgeCountMap[ub.user_id] || 0) + 1;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaderboard: LeaderboardMember[] = profiles.map((p: any) => ({
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            plan_type: p.plan_type,
            xp_points: p.xp_points,
            level: p.level,
            current_streak: p.current_streak,
            badge_count: badgeCountMap[p.id] || 0,
        }));

        setMembers(leaderboard);
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchLeaderboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Level thresholds for XP bar calculation
    const thresholdEntries = Object.entries(LEVEL_THRESHOLDS).map(([level, minXP]) => ({
        level,
        minXP: minXP as number,
    }));
    const maxXP = thresholdEntries[thresholdEntries.length - 1]?.minXP || 7000;

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-xl font-display font-bold text-brand-text">💻 El Mainframe</h1>
                    <GamificationTooltip content="Ranking de los miembros con más Sinapsis acumuladas. Se actualiza en tiempo real." position="right" />
                </div>
                <p className="text-sm text-brand-muted mt-1">
                    Los nodos con mayor ancho de banda en la red de IamAutom.
                </p>
            </div>

            {/* Leaderboard */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">🖥️</p>
                    <p className="text-brand-muted text-sm">El Mainframe está iniciando datos...</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {members.map((member, index) => {
                        const rank = index + 1;
                        const xpPercent = Math.min(100, Math.round((member.xp_points / maxXP) * 100));

                        return (
                            <div
                                key={member.id}
                                className={`bg-brand-card rounded-card border p-4
                           transition-all hover:shadow-md
                           ${rank <= 3
                                        ? "border-brand-accent/50 shadow-[0_0_15px_rgba(255,77,0,0.15)] bg-gradient-to-r from-brand-accent/5 to-transparent relative overflow-hidden"
                                        : "border-brand-border"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Rank */}
                                    <div className="flex-shrink-0 w-8 text-center">
                                        {rank <= 3 ? (
                                            <span className="text-xl">
                                                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-mono text-brand-muted">
                                                #{rank}
                                            </span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <Avatar
                                        name={member.full_name}
                                        imageUrl={member.avatar_url || undefined}
                                        size="sm"
                                    />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-brand-text truncate">
                                                {member.full_name}
                                            </span>
                                            <PlanBadge planType={member.plan_type as "member" | "inner_circle" | "admin" | "none"} />
                                        </div>

                                        {/* XP bar */}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex-1">
                                                <ProgressBar value={xpPercent} size="sm" showLabel={false} />
                                            </div>
                                            <span className="text-[10px] font-mono text-brand-muted flex-shrink-0">
                                                {member.xp_points.toLocaleString()} Sinapsis
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                                        {/* Level */}
                                        <div className="text-center">
                                            <p className="text-[10px] text-brand-muted uppercase">Proceso</p>
                                            <p className="text-xs font-semibold text-brand-text capitalize">
                                                {member.level.replace("_", " ")}
                                            </p>
                                        </div>

                                        {/* Badges */}
                                        <div className="text-center">
                                            <p className="text-[10px] text-brand-muted uppercase">Nodos</p>
                                            <p className="text-xs font-semibold text-brand-text">
                                                {member.badge_count} 🧠
                                            </p>
                                        </div>

                                        {/* Streak */}
                                        <StreakFlame streak={member.current_streak} size="sm" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
