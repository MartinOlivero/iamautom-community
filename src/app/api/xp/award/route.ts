import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/xp";
import { updateStreak } from "@/lib/streaks";
import { checkAndAwardBadges } from "@/lib/badges";

export const dynamic = "force-dynamic";

/**
 * POST /api/xp/award
 * Awards XP, updates streak, and checks badge conditions.
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

        // 1. Award XP
        const xpResult = await awardXP(user.id, action);

        // 2. Update streak
        const streakResult = await updateStreak(user.id);

        // 3. Check and award new badges
        const newBadges = await checkAndAwardBadges(user.id);

        return NextResponse.json({
            xp: xpResult,
            earnedXp: xpResult.xpAmount,
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
