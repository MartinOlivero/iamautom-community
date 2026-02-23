import { createAdminClient } from "@/lib/supabase/admin";
import { SYNAPSE_REWARDS } from "@/lib/constants";

type SynapseAction = keyof typeof SYNAPSE_REWARDS;

/**
 * Awards Synapses to a user and logs the gamification event.
 * User level is automatically calculated by a DB trigger upon xp_points update.
 * Uses admin client to bypass RLS.
 * Call from server actions or API routes only.
 */
export async function awardSynapses(userId: string, action: SynapseAction, description?: string): Promise<{ newXP: number; leveledUp: boolean; newLevel: string; xpAmount: number }> {
    const supabase = createAdminClient();
    const xpAmount = SYNAPSE_REWARDS[action];

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
    const oldLevel = profile.level;

    // Update profile (Database triggers handle level updates)
    const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
            xp_points: newXP,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("level")
        .single();

    if (updateError) {
        throw new Error("Failed to award synapses: " + updateError.message);
    }

    const newLevel = updatedProfile?.level || oldLevel;
    const leveledUp = newLevel !== oldLevel;

    // Insert Gamification Event
    await supabase.from("gamification_events").insert({
        user_id: userId,
        event_type: action,
        synapse_amount: xpAmount,
        description: description || `Awarded ${xpAmount} synapses for ${action}`,
    });

    return { newXP, leveledUp, newLevel, xpAmount };
}
