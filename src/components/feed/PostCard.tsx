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
    const [showDelete, setShowDelete] = useState(false);
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
            className="group relative rounded-2xl border border-white/[0.07] bg-[rgba(10,16,30,0.6)] backdrop-blur-md p-5 transition-all duration-300 hover:border-[#38bdf8]/20 hover:bg-[rgba(10,16,30,0.8)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            {/* Pinned / Announcement indicator */}
            {(post.is_pinned || post.is_announcement) && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest mb-3 pb-3 border-b border-white/5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${post.is_announcement ? 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20' : 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'}`}>
                        {post.is_announcement ? "📢 Anuncio" : "📌 Fijado"}
                    </span>
                </div>
            )}

            {/* Left accent line for special posts */}
            {post.is_pinned && (
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#38bdf8] to-transparent rounded-r-full" />
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar
                            name={post.author.full_name}
                            imageUrl={post.author.avatar_url || undefined}
                            size="md"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#04080f]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                                {post.author.full_name}
                            </span>
                            <PlanBadge planType={post.author.plan_type} />
                        </div>
                        <span className="text-[11px] text-white/30 font-mono">
                            {timeAgo(post.created_at)}
                        </span>
                    </div>
                </div>

                {/* Delete button */}
                {(isAuthor || user?.user_metadata?.role === "admin") && onDelete && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className={`text-white/20 hover:text-red-400 text-xs transition-all duration-200 p-1.5 rounded-lg hover:bg-red-500/10 ${showDelete ? 'opacity-100' : 'opacity-0'}`}
                        title="Eliminar post"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="text-[14px] text-white/70 leading-relaxed whitespace-pre-wrap mb-5 pl-0">
                {post.content}
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
                <div className="mb-5 grid gap-2 grid-cols-2 rounded-xl overflow-hidden">
                    {post.media_urls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt=""
                            className="w-full object-cover max-h-[280px] rounded-xl"
                        />
                    ))}
                </div>
            )}

            {/* Separator */}
            <div className="border-t border-white/5 pt-4">
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
        </div>
    );
}
