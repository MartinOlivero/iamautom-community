/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import ProfileHoverCard from "@/components/ui/ProfileHoverCard";
import PlanBadge from "@/components/ui/Badge";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import GifPicker from "@/components/ui/GifPicker";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ReactionPicker from "./ReactionPicker";
import { getLevelInfo } from "@/lib/levels";
import { useComments, type CommentWithAuthor } from "@/hooks/useComments";
import { useAuth } from "@/components/auth/AuthProvider";
import type { PostWithDetails } from "@/hooks/usePosts";

interface PostModalViewProps {
    post: PostWithDetails;
    onToggleReaction: (postId: string, emoji: string) => void;
    onDelete: (postId: string) => void;
    onUpdate: (postId: string, content: string) => void;
    onTogglePin?: (postId: string, isPinned: boolean) => void;
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

export default function PostModalView({ post, onToggleReaction, onDelete, onTogglePin }: PostModalViewProps) {
    const { user } = useAuth();
    const { comments, isLoading, addComment, updateComment, deleteComment } = useComments(post.id);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [showCommentDeleteConfirm, setShowCommentDeleteConfirm] = useState(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isAuthor = user?.id === post.author_id;

    // Scroll to bottom when new comments arrive
    useEffect(() => {
        if (comments.length > 0) {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments.length]);

    const reactionMap = new Map<string, { count: number; hasReacted: boolean }>();
    post.reactions.forEach((r) => {
        const existing = reactionMap.get(r.emoji) || { count: 0, hasReacted: false };
        existing.count += 1;
        if (r.user_id === user?.id) existing.hasReacted = true;
        reactionMap.set(r.emoji, existing);
    });
    const aggregatedReactions = Array.from(reactionMap.entries()).map(([emoji, data]) => ({
        emoji, count: data.count, hasReacted: data.hasReacted,
    }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        await addComment(newComment.trim());
        setNewComment("");
        setIsSubmitting(false);
        inputRef.current?.focus();
    }

    function handleGifSelect(gifUrl: string) {
        const gifHtml = `<img src="${gifUrl}" alt="GIF" />`;
        addComment(gifHtml);
        setIsGifPickerOpen(false);
    }

    async function handleUpdateComment(commentId: string) {
        if (!editText.trim()) return;
        await updateComment(commentId, editText.trim());
        setEditingCommentId(null);
        setEditText("");
    }

    const isGifComment = (content: string) => {
        return content.trim().startsWith('<img') && content.includes('giphy.com');
    };

    return (
        <div className="flex flex-col -m-6">
            {/* Post Header */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                        <ProfileHoverCard userId={post.author.id}>
                            <div className="relative cursor-pointer">
                                <Avatar
                                    name={post.author.full_name}
                                    imageUrl={post.author.avatar_url || undefined}
                                    size="lg"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-brand-card" />
                            </div>
                        </ProfileHoverCard>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-bold text-brand-text">
                                    {post.author.full_name}
                                </span>
                                <PlanBadge planType={post.author.plan_type} />
                                <span className="text-[10px] bg-brand-hover-bg text-brand-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                    LVL {getLevelInfo(post.author.level).number}
                                </span>
                                <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded font-bold">
                                    {getLevelInfo(post.author.level).label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm text-brand-muted">{timeAgo(post.created_at)}</span>
                                <span className="text-brand-muted/30 text-[10px]">&#8226;</span>
                                <span className="text-sm font-bold text-brand-accent/70 uppercase tracking-wider">#{post.channel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {(isAuthor || user?.user_metadata?.role === "admin") && onTogglePin && (
                            <button
                                onClick={() => onTogglePin(post.id, post.is_pinned)}
                                className={`p-1.5 rounded-lg transition-all ${post.is_pinned ? 'text-brand-accent bg-brand-accent/10' : 'text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5'}`}
                                title={post.is_pinned ? "Desfijar" : "Fijar"}
                            >
                                <svg className="w-4 h-4" fill={post.is_pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </button>
                        )}
                        {(isAuthor || user?.user_metadata?.role === "admin") && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-500/5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <RichTextDisplay content={post.content} className="text-[15px] leading-relaxed text-brand-text" />

                {/* Reactions */}
                <div className="flex items-center gap-3 mt-4 pb-4 border-b border-brand-border">
                    <ReactionPicker
                        reactions={aggregatedReactions}
                        onToggle={(emoji) => onToggleReaction(post.id, emoji)}
                    />
                    <span className="text-xs text-brand-muted">
                        {comments.length} comentario{comments.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 max-h-[40vh]">
                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-brand-muted text-center py-6">
                        Se el primero en comentar
                    </p>
                ) : (
                    comments.map((comment: CommentWithAuthor) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <ProfileHoverCard userId={comment.author_id}>
                                <div className="cursor-pointer flex-shrink-0 mt-1">
                                    <Avatar
                                        name={comment.author.full_name}
                                        imageUrl={comment.author.avatar_url || undefined}
                                        size="md"
                                    />
                                </div>
                            </ProfileHoverCard>
                            <div className="flex-1 min-w-0">
                                <div className="bg-brand-hover-bg/60 rounded-2xl px-4 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <ProfileHoverCard userId={comment.author_id}>
                                                <span className="text-sm font-bold text-brand-text cursor-pointer hover:text-brand-accent transition-colors">
                                                    {comment.author.full_name}
                                                </span>
                                            </ProfileHoverCard>
                                            <span className="text-[10px] text-brand-muted">
                                                {timeAgo(comment.created_at)}
                                            </span>
                                        </div>
                                        {user?.id === comment.author_id && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditText(comment.content);
                                                    }}
                                                    className="text-[10px] text-brand-muted hover:text-brand-accent font-medium"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCommentToDelete(comment.id);
                                                        setShowCommentDeleteConfirm(true);
                                                    }}
                                                    className="text-[10px] text-brand-muted hover:text-red-400 font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full bg-brand-card border border-brand-border rounded-lg p-2 text-sm focus:outline-none focus:border-brand-accent/50"
                                                rows={2}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingCommentId(null)} className="text-xs text-brand-muted hover:text-brand-text">Cancelar</button>
                                                <button onClick={() => handleUpdateComment(comment.id)} className="text-xs text-brand-accent font-bold">Guardar</button>
                                            </div>
                                        </div>
                                    ) : isGifComment(comment.content) ? (
                                        <div
                                            className="mt-1 [&_img]:max-w-[200px] [&_img]:rounded-lg [&_img]:max-h-[150px] [&_img]:object-cover"
                                            dangerouslySetInnerHTML={{ __html: comment.content }}
                                        />
                                    ) : (
                                        <p className="text-sm text-brand-text-secondary whitespace-pre-wrap break-words">
                                            {comment.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Comment Input */}
            {user && (
                <div className="border-t border-brand-border p-4">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <Avatar
                            name={user.user_metadata?.full_name || ""}
                            imageUrl={user.user_metadata?.avatar_url || undefined}
                            size="sm"
                        />
                        <div className="flex-1 flex items-center gap-2 bg-brand-hover-bg/60 border border-brand-border rounded-full px-4 py-2 focus-within:border-brand-accent/50 transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribi un comentario..."
                                className="flex-1 bg-transparent text-sm text-brand-text placeholder:text-brand-muted focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setIsGifPickerOpen(!isGifPickerOpen)}
                                className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded transition-colors ${isGifPickerOpen ? 'text-brand-accent bg-brand-accent/10' : 'text-brand-muted hover:text-brand-accent'}`}
                                title="Insertar GIF"
                            >
                                GIF
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-full disabled:opacity-40 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>

                    {/* GIF Picker */}
                    {isGifPickerOpen && (
                        <div className="mt-3 flex justify-center">
                            <GifPicker
                                onSelect={handleGifSelect}
                                onClose={() => setIsGifPickerOpen(false)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Delete Post Confirmation */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => onDelete(post.id)}
                title="Eliminar publicacion?"
                description="Esta accion no se puede deshacer."
                confirmText="Eliminar"
                variant="danger"
            />

            {/* Delete Comment Confirmation */}
            <ConfirmationModal
                isOpen={showCommentDeleteConfirm}
                onClose={() => { setShowCommentDeleteConfirm(false); setCommentToDelete(null); }}
                onConfirm={() => { if (commentToDelete) deleteComment(commentToDelete); }}
                title="Eliminar comentario?"
                description="Esta accion no se puede deshacer."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    );
}
