import { createAdminClient } from "@/lib/supabase/admin";
import { XP_REWARDS, LEVEL_THRESHOLDS } from "@/lib/constants";

type XPAction = keyof typeof XP_REWARDS;

/**
 * Awards XP to a user and checks for level-up.
 * Uses admin client to bypass RLS.
 * Call from server actions or API routes only.
 */
export async function awardXP(userId: string, action: XPAction): Promise<{ newXP: number; leveledUp: boolean; newLevel: string; xpAmount: number }> {
    const supabase = createAdminClient();
    const xpAmount = XP_REWARDS[action];

    // Get current profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("xp_points, level")
        .eq("id", userId)
        .single();

    if (!profile) {
        throw new Error("Profile not found");
    }

    const newXP = profile.xp_points + xpAmount;

    // Determine new level — LEVEL_THRESHOLDS is { level: minXP }
    let newLevel = profile.level;
    for (const [level, minXP] of Object.entries(LEVEL_THRESHOLDS)) {
        if (newXP >= (minXP as number)) {
            newLevel = level;
        }
    }

    const leveledUp = newLevel !== profile.level;

    // Update profile
    await supabase
        .from("profiles")
        .update({
            xp_points: newXP,
            level: newLevel,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    return { newXP, leveledUp, newLevel, xpAmount };
}
