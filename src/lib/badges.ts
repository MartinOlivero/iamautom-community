import { createAdminClient } from "@/lib/insforge/admin";
import type { Badge } from "@/types/database";

/**
 * Checks all badge conditions for a user and awards any newly earned badges.
 * Returns the list of newly awarded badges for toast display.
 * Uses admin client — call from server actions or API routes only.
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const db = createAdminClient();

    // Fetch all available badges
    const { data: allBadges } = await db
        .from("badges")
        .select("*");

    if (!allBadges || allBadges.length === 0) return [];

    // Fetch user's already-earned badge IDs
    const { data: earnedBadges } = await db
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const earnedIds = new Set((earnedBadges || []).map((b: any) => b.badge_id));

    // Only check badges the user hasn't earned yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unearned = allBadges.filter((b: any) => !earnedIds.has(b.id));
    if (unearned.length === 0) return [];

    // Fetch user stats in parallel
    const [postsResult, commentsResult, reactionsResult, progressResult, profileResult] =
        await Promise.all([
            db
                .from("posts")
                .select("id", { count: "exact", head: true })
                .eq("author_id", userId),
            db
                .from("comments")
                .select("id", { count: "exact", head: true })
                .eq("author_id", userId),
            db
                .from("post_reactions")
                .select("id, posts!inner(author_id)", { count: "exact", head: true })
                .eq("posts.author_id", userId),
            db
                .from("lesson_progress")
                .select("lesson_id, lessons!inner(module_id)", { count: "exact" })
                .eq("user_id", userId)
                .eq("completed", true),
            db
                .from("profiles")
                .select("xp_points, current_streak, longest_streak, plan_type")
                .eq("id", userId)
                .single(),
        ]);

    const postsCount = postsResult.count || 0;
    const commentsCount = commentsResult.count || 0;
    const reactionsReceived = reactionsResult.count || 0;
    const profile = profileResult.data;

    // Count completed modules (all lessons in module completed)
    // Simplified: count distinct module_ids from completed lessons
    const completedLessons = progressResult.data || [];
    const moduleIds = new Set<string>();
    for (const lp of completedLessons) {
        const lesson = lp as unknown as { lesson_id: string; lessons: { module_id: string } };
        if (lesson.lessons?.module_id) {
            moduleIds.add(lesson.lessons.module_id);
        }
    }
    const modulesCompleted = moduleIds.size;

    const xpTotal = profile?.xp_points || 0;
    const streakDays = Math.max(profile?.current_streak || 0, profile?.longest_streak || 0);
    const isInnerCircle = profile?.plan_type === "inner_circle" || profile?.plan_type === "admin";

    // Build stats map
    const stats: Record<string, number> = {
        posts_count: postsCount,
        comments_count: commentsCount,
        reactions_received: reactionsReceived,
        modules_completed: modulesCompleted,
        streak_days: streakDays,
        xp_total: xpTotal,
        plan_type: isInnerCircle ? 1 : 0,
    };

    // Check conditions and award
    const newlyEarned: Badge[] = [];

    for (const badge of unearned) {
        const userValue = stats[badge.condition_type] || 0;

        if (userValue >= badge.condition_value) {
            // Award the badge
            const { error } = await db.from("user_badges").insert({
                user_id: userId,
                badge_id: badge.id,
                earned_at: new Date().toISOString(),
            });

            if (!error) {
                newlyEarned.push(badge);
            }
        }
    }

    return newlyEarned;
}
