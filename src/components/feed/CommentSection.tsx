"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { useComments, type CommentWithAuthor } from "@/hooks/useComments";
import { useAuth } from "@/components/auth/AuthProvider";

interface CommentSectionProps {
    postId: string;
    commentCount: number;
}

/** Time ago in Spanish */
function timeAgo(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "ahora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    return new Date(dateString).toLocaleDateString("es-AR", { month: "short", day: "numeric" });
}

/**
 * Collapsible comment section for a post.
 */
export default function CommentSection({ postId, commentCount }: CommentSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { comments, isLoading, addComment } = useComments(postId);
    const { user } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        await addComment(newComment.trim());
        setNewComment("");
        setIsSubmitting(false);
    }

    return (
        <div>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-brand-muted hover:text-brand-text-secondary transition-colors"
            >
                💬 {commentCount > 0 ? `${commentCount} comentario${commentCount !== 1 ? "s" : ""}` : "Comentar"}
            </button>

            {/* Comment list */}
            {isOpen && (
                <div className="mt-3 space-y-3 animate-fade-in">
                    {isLoading ? (
                        <p className="text-xs text-brand-muted">Cargando comentarios...</p>
                    ) : (
                        comments.map((comment: CommentWithAuthor) => (
                            <div key={comment.id} className="flex gap-2">
                                <Avatar
                                    name={comment.author.full_name}
                                    imageUrl={comment.author.avatar_url || undefined}
                                    size="sm"
                                />
                                <div className="flex-1 bg-brand-hover-bg rounded-input px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-brand-text">
                                            {comment.author.full_name}
                                        </span>
                                        <span className="text-[10px] text-brand-muted">
                                            {timeAgo(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-brand-text-secondary mt-0.5">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* New comment form */}
                    {user && (
                        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribí un comentario..."
                                className="flex-1 bg-brand-hover-bg border border-brand-border rounded-input
                           px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-muted
                           focus:outline-none focus:border-brand-accent/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="text-xs font-medium text-brand-accent hover:text-brand-accent-hover
                           disabled:opacity-50 transition-colors px-2"
                            >
                                {isSubmitting ? "..." : "Enviar"}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
