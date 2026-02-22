import { showXPToast } from "@/components/gamification/XPToast";

/**
 * Helper to call the XP award API and dispatch the toast notification.
 * Call this from client components or hooks after a user action.
 */
export async function triggerXPAward(action: string) {
    try {
        const res = await fetch("/api/xp/award", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action }),
        });

        if (!res.ok) {
            console.error("XP API returned status", res.status);
            return null;
        }

        const data = await res.json();

        // Dispara el toast si hubo ganancia de experiencia, nivel o badges
        if (data.earnedXp > 0 || data.xp?.leveledUp || (data.newBadges && data.newBadges.length > 0)) {
            showXPToast({
                xpAmount: data.earnedXp || 0,
                leveledUp: data.xp?.leveledUp || false,
                newLevel: data.xp?.newLevel || "",
                badges: data.newBadges || [],
            });
        }

        return data;
    } catch (err) {
        console.error("Failed to trigger XP award:", err);
        return null;
    }
}
