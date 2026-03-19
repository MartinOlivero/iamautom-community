import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/insforge/server";
import { awardSynapses } from "@/lib/xp";
import { checkAndAwardBadges } from "@/lib/badges";
import { SYNAPSE_REWARDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Valid actions: keys from SYNAPSE_REWARDS + "ping"
const VALID_ACTIONS = new Set([...Object.keys(SYNAPSE_REWARDS), "ping"]);

/**
 * POST /api/xp/award
 * Awards Synapses, updates streak, and checks badge conditions.
 * Body: { action: "create_post" | "create_comment" | "complete_lesson" | ... }
 */
export async function POST(request: NextRequest) {
    try {
        const db = await createClient();
        const {
            data: { user },
        } = await db.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (!action || typeof action !== "string") {
            return NextResponse.json({ error: "Missing action" }, { status: 400 });
        }

        // Validate action against allowlist
        if (!VALID_ACTIONS.has(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // 1. Update streak (Uptime) in Database via RPC
        // This handles "daily_ping" XP automatically inside SQL if it's a new day
        await db.rpc("update_daily_streak", { p_user_id: user.id });

        let xpResult = null;

        // 2. Award action-specific Synapses if Action is not just a Ping
        if (action !== "ping") {
            xpResult = await awardSynapses(user.id, action as keyof typeof SYNAPSE_REWARDS);
        }

        // 3. Check and award new badges
        const newBadges = await checkAndAwardBadges(user.id);

        return NextResponse.json({
            xp: xpResult,
            earnedXp: xpResult?.xpAmount || 0,
            streak: { success: true }, // Streak details are now internal to DB
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
