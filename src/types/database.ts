// ============================================================
// Database type definitions matching the Supabase schema
// ============================================================

export type PlanType = "member" | "inner_circle" | "admin" | "none";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing" | "none";
export type UserLevel = "novato" | "aprendiz" | "automatizador" | "experto" | "maestro_ia";
export type Channel = "general" | "proyectos" | "soporte" | "off_topic" | "inner_circle_vip";
export type TierRequired = "member" | "inner_circle";
export type UserRole = "member" | "admin";
export type NotificationType = "new_module" | "event_reminder" | "badge_earned" | "reply" | "announcement";

// ============================================================
// Row types for each table
// ============================================================

export interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    plan_type: PlanType;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: SubscriptionStatus;
    xp_points: number;
    level: UserLevel;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Post {
    id: string;
    author_id: string;
    content: string;
    media_urls: string[] | null;
    is_pinned: boolean;
    is_announcement: boolean;
    channel: Channel;
    created_at: string;
    updated_at: string;
    // Joined fields
    author?: Profile;
    reactions?: PostReaction[];
    comments_count?: number;
}

export interface PostReaction {
    id: string;
    post_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    // Joined
    author?: Profile;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    emoji: string;
    order_index: number;
    tier_required: TierRequired;
    is_published: boolean;
    release_date: string | null;
    created_at: string;
    // Joined
    lessons?: Lesson[];
    progress_percentage?: number;
}

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    duration_minutes: number;
    order_index: number;
    attachments: LessonAttachment[] | null;
    created_at: string;
    // Joined
    progress?: LessonProgress;
}

export interface LessonAttachment {
    name: string;
    url: string;
    type: string;
}

export interface LessonProgress {
    id: string;
    user_id: string;
    lesson_id: string;
    completed: boolean;
    completed_at: string | null;
}

export interface Poll {
    id: string;
    author_id: string;
    question: string;
    options: PollOption[];
    ends_at: string;
    channel: string;
    created_at: string;
    // Joined
    votes?: PollVote[];
    user_vote?: PollVote;
}

export interface PollOption {
    id: string;
    text: string;
    emoji: string;
}

export interface PollVote {
    id: string;
    poll_id: string;
    user_id: string;
    option_id: string;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    event_date: string;
    duration_minutes: number;
    tier_required: TierRequired;
    meeting_url: string | null;
    recording_url: string | null;
    max_spots: number | null;
    created_at: string;
    // Joined
    registrations_count?: number;
    is_registered?: boolean;
}

export interface EventRegistration {
    id: string;
    event_id: string;
    user_id: string;
    created_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    emoji: string;
    condition_type: string;
    condition_value: number;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    earned_at: string;
    // Joined
    badge?: Badge;
}

export interface ChatMessage {
    id: string;
    channel: string;
    author_id: string;
    content: string;
    created_at: string;
    // Joined
    author?: Profile;
}

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    link: string | null;
    created_at: string;
}
