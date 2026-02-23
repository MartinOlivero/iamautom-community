import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardSynapses } from "@/lib/xp";
import { updateStreak } from "@/lib/streaks";
import { checkAndAwardBadges } from "@/lib/badges";

export const dynamic = "force-dynamic";

/**
 * POST /api/xp/award
 * Awards Synapses, updates streak, and checks badge conditions.
 * Body: { action: "create_post" | "create_comment" | "complete_lesson" | ... }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json({ error: "Missing action" }, { status: 400 });
        }

        // 1. Update streak (Uptime) FIRST
        const streakResult = await updateStreak(user.id);

        let xpResult = null;

        // 2. Award Daily Ping if it's a new day
        if (streakResult.isNewDay) {
            xpResult = await awardSynapses(user.id, "daily_ping", "Daily System Uptime Ping");
        }

        // 3. Award action-specific Synapses if Action is not just a Ping
        if (action !== "ping") {
            const actionResult = await awardSynapses(user.id, action as any);
            // If we also got daily ping XP, combine them conceptually or just return the latest action
            xpResult = {
                newXP: actionResult.newXP,
                leveledUp: (xpResult?.leveledUp || actionResult.leveledUp),
                newLevel: actionResult.newLevel,
                xpAmount: (xpResult?.xpAmount || 0) + actionResult.xpAmount,
            };
        }

        // 3. Check and award new badges
        const newBadges = await checkAndAwardBadges(user.id);

        return NextResponse.json({
            xp: xpResult,
            earnedXp: xpResult?.xpAmount || 0,
            streak: streakResult,
            newBadges: newBadges.map((b) => ({
                name: b.name,
                emoji: b.emoji,
                description: b.description,
            })),
        });
    } catch (error) {
        console.error("XP award error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
