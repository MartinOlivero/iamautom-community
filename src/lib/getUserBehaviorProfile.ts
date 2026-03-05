// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserBehaviorProfile(userId: string, client: any) {
    const [participations, badges, gamificationEvents, recentPosts] = await Promise.all([
        client
            .from('challenge_participants')
            .select(`
        challenge_id, 
        current_value, 
        completed, 
        completed_at, 
        joined_at,
        challenges(title, challenge_type, target_value, reward_coins)
      `)
            .eq('user_id', userId)
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(20),

        client
            .from('user_badges')
            .select('badge_id, earned_at')
            .eq('user_id', userId),

        client
            .from('gamification_events')
            .select('event_type, points, description, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50),

        client
            .from('posts')
            .select('id, created_at')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedWithTime = (participations.data || []).map((p: any) => ({
        ...p,
        days_to_complete: p.completed_at && p.joined_at
            ? Math.round((new Date(p.completed_at).getTime() - new Date(p.joined_at).getTime()) / (1000 * 60 * 60 * 24))
            : null
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeCount = completedWithTime.reduce((acc: Record<string, number>, p: any) => {
        const type = p.challenges?.challenge_type || 'unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {})

    return {
        completedChallenges: completedWithTime,
        badges: badges.data || [],
        gamificationEvents: gamificationEvents.data || [],
        recentPosts: recentPosts.data || [],
        typeCount,
        totalCompleted: completedWithTime.length
    }
}
