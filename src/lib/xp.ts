import { createAdminClient } from "@/lib/insforge/admin";
import { SYNAPSE_REWARDS } from "@/lib/constants";

type SynapseAction = keyof typeof SYNAPSE_REWARDS;

/**
 * Awards Synapses to a user and logs the gamification event.
 * Uses atomic RPC to prevent race conditions (concurrent requests losing XP).
 * User level is automatically calculated by a DB trigger upon xp_points update.
 * Uses admin client to bypass RLS.
 * Call from server actions or API routes only.
 */
export async function awardSynapses(userId: string, action: SynapseAction, description?: string): Promise<{ newXP: number; leveledUp: boolean; newLevel: string; xpAmount: number }> {
    const db = createAdminClient();
    const xpAmount = SYNAPSE_REWARDS[action];

    // Get current level before update (for level-up detection)
    const { data: profileBefore } = await db
        .from("profiles")
        .select("level")
        .eq("id", userId)
        .single();

    if (!profileBefore) {
        throw new Error("Profile not found");
    }

    const oldLevel = profileBefore.level;

    // Atomic update: increment xp_points and coins in a single SQL operation
    // This prevents race conditions where two concurrent requests read the same value
    const { data: updatedProfile, error: updateError } = await db.rpc("award_synapses_atomic", {
        p_user_id: userId,
        p_xp_amount: xpAmount,
    });

    if (updateError) {
        throw new Error("Failed to award synapses: " + updateError.message);
    }

    const newXP = updatedProfile?.new_xp ?? 0;
    const newLevel = updatedProfile?.new_level ?? oldLevel;
    const leveledUp = newLevel !== oldLevel;

    // Insert Gamification Event
    await db.from("gamification_events").insert({
        user_id: userId,
        event_type: action,
        points: xpAmount,
        description: description || `Awarded ${xpAmount} synapses for ${action}`,
    });

    return { newXP, leveledUp, newLevel, xpAmount };
}
