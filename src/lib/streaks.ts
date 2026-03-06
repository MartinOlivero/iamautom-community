import { createAdminClient } from "@/lib/insforge/admin";

/**
 * Updates the user's streak based on their last active date.
 * Should be called once per qualifying action per day.
 * Uses admin client — call from server actions or API routes only.
 */
export async function updateStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    isNewDay: boolean;
}> {
    const db = createAdminClient();

    const { data: profile } = await db
        .from("profiles")
        .select("current_streak, longest_streak, last_active_date")
        .eq("id", userId)
        .single();

    if (!profile) {
        throw new Error("Profile not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = profile.last_active_date
        ? new Date(profile.last_active_date)
        : null;

    if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
    }

    // Already active today — no update needed
    if (lastActive && lastActive.getTime() === today.getTime()) {
        return {
            currentStreak: profile.current_streak,
            longestStreak: profile.longest_streak,
            isNewDay: false,
        };
    }

    let newStreak = 1;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If last active was yesterday, continue the streak
    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        newStreak = profile.current_streak + 1;
    }

    const newLongest = Math.max(newStreak, profile.longest_streak);

    await db
        .from("profiles")
        .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_active_date: today.toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    return {
        currentStreak: newStreak,
        longestStreak: newLongest,
        isNewDay: true,
    };
}
