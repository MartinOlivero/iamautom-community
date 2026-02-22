/* eslint-disable @next/next/no-img-element */
"use client";

import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import ReactionPicker from "./ReactionPicker";
import CommentSection from "./CommentSection";
import type { PostWithDetails } from "@/hooks/usePosts";
import { useAuth } from "@/components/auth/AuthProvider";

interface PostCardProps {
    post: PostWithDetails;
    onToggleReaction: (postId: string, emoji: string) => void;
    onDelete?: (postId: string) => void;
}

/** Time ago in Spanish */
function timeAgo(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "ahora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days}d`;
    return new Date(dateString).toLocaleDateString("es-AR", { month: "short", day: "numeric" });
}

/**
 * Single post card displaying author, content, reactions, and comments.
 */
export default function PostCard({ post, onToggleReaction, onDelete }: PostCardProps) {
    const { user } = useAuth();
    const isAuthor = user?.id === post.author_id;

    // Aggregate reactions for the picker
    const reactionMap = new Map<string, { count: number; hasReacted: boolean }>();
    post.reactions.forEach((r) => {
        const existing = reactionMap.get(r.emoji) || { count: 0, hasReacted: false };
        existing.count += 1;
        if (r.user_id === user?.id) existing.hasReacted = true;
        reactionMap.set(r.emoji, existing);
    });

    const aggregatedReactions = Array.from(reactionMap.entries()).map(
        ([emoji, data]) => ({
            emoji,
            count: data.count,
            hasReacted: data.hasReacted,
        })
    );

    return (
        <div className="bg-brand-card rounded-card border border-brand-border p-5 transition-all hover:shadow-sm">
            {/* Pinned / Announcement indicator */}
            {(post.is_pinned || post.is_announcement) && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-accent mb-3">
                    <span>{post.is_announcement ? "📢" : "📌"}</span>
                    <span>{post.is_announcement ? "Anuncio" : "Fijado"}</span>
                </div>
            )}

            {/* Header: author info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={post.author.full_name}
                        imageUrl={post.author.avatar_url || undefined}
                        size="sm"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-text">
                                {post.author.full_name}
                            </span>
                            <PlanBadge planType={post.author.plan_type} />
                        </div>
                        <span className="text-[11px] text-brand-muted">
                            {timeAgo(post.created_at)}
                        </span>
                    </div>
                </div>

                {/* Delete button for author/admin */}
                {(isAuthor || user?.user_metadata?.role === "admin") && onDelete && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className="text-brand-muted hover:text-red-500 text-xs transition-colors"
                        title="Eliminar post"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="text-sm text-brand-text-secondary leading-relaxed whitespace-pre-wrap mb-4">
                {post.content}
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
                <div className="mb-4 grid gap-2 grid-cols-2">
                    {post.media_urls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt=""
                            className="rounded-input w-full object-cover max-h-[300px]"
                        />
                    ))}
                </div>
            )}

            {/* Reactions */}
            <div className="mb-3">
                <ReactionPicker
                    reactions={aggregatedReactions}
                    onToggle={(emoji) => onToggleReaction(post.id, emoji)}
                />
            </div>

            {/* Comments */}
            <CommentSection postId={post.id} commentCount={post.comment_count} />
        </div>
    );
}
