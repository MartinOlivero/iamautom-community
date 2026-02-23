/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
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

export default function PostCard({ post, onToggleReaction, onDelete }: PostCardProps) {
    const { user } = useAuth();
    const [hovered, setHovered] = useState(false);
    const isAuthor = user?.id === post.author_id;

    const reactionMap = new Map<string, { count: number; hasReacted: boolean }>();
    post.reactions.forEach((r) => {
        const existing = reactionMap.get(r.emoji) || { count: 0, hasReacted: false };
        existing.count += 1;
        if (r.user_id === user?.id) existing.hasReacted = true;
        reactionMap.set(r.emoji, existing);
    });

    const aggregatedReactions = Array.from(reactionMap.entries()).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        hasReacted: data.hasReacted,
    }));

    return (
        <div
            className={`bg-brand-card rounded-2xl border transition-all duration-300 overflow-hidden ${hovered
                ? "border-brand-border shadow-card-hover -translate-y-0.5"
                : "border-brand-border/80 shadow-card"
                }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Pinned / Announcement tag */}
            {(post.is_pinned || post.is_announcement) && (
                <div className={`px-5 py-2.5 flex items-center gap-2 border-b ${post.is_announcement
                    ? "bg-orange-50 border-orange-100"
                    : "bg-indigo-50 border-indigo-100"
                    }`}>
                    <span className="text-xs font-semibold">
                        {post.is_announcement ? "📢" : "📌"}
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${post.is_announcement ? "text-orange-600" : "text-indigo-600"
                        }`}>
                        {post.is_announcement ? "Anuncio" : "Fijado"}
                    </span>
                </div>
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar
                                name={post.author.full_name}
                                imageUrl={post.author.avatar_url || undefined}
                                size="md"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-brand-text">
                                    {post.author.full_name}
                                </span>
                                <PlanBadge planType={post.author.plan_type} />
                            </div>
                            <span className="text-[11px] text-brand-muted">
                                {timeAgo(post.created_at)}
                            </span>
                        </div>
                    </div>

                    {(isAuthor || user?.user_metadata?.role === "admin") && onDelete && (
                        <button
                            onClick={() => onDelete(post.id)}
                            className={`p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-50 text-xs transition-all duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="text-[14px] text-brand-text-secondary leading-relaxed whitespace-pre-wrap mb-4">
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
                                className="rounded-xl w-full object-cover max-h-[260px]"
                            />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-brand-border space-y-3">
                    <ReactionPicker
                        reactions={aggregatedReactions}
                        onToggle={(emoji) => onToggleReaction(post.id, emoji)}
                    />
                    <CommentSection postId={post.id} commentCount={post.comment_count} />
                </div>
            </div>
        </div>
    );
}
