"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import ProfileHoverCard from "@/components/ui/ProfileHoverCard";
import { useComments, type CommentWithAuthor } from "@/hooks/useComments";
import { useAuth } from "@/components/auth/AuthProvider";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

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
    const { comments, isLoading, addComment, updateComment, deleteComment } = useComments(postId);
    const { user } = useAuth();

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        await addComment(newComment.trim());
        setNewComment("");
        setIsSubmitting(false);
    }

    async function handleUpdate(commentId: string) {
        if (!editText.trim()) return;
        await updateComment(commentId, editText.trim());
        setEditingCommentId(null);
        setEditText("");
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
                                <ProfileHoverCard userId={comment.author_id}>
                                    <div className="cursor-pointer">
                                        <Avatar
                                            name={comment.author.full_name}
                                            imageUrl={comment.author.avatar_url || undefined}
                                            size="sm"
                                        />
                                    </div>
                                </ProfileHoverCard>
                                <div className="flex-1 bg-brand-hover-bg rounded-input px-3 py-2 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ProfileHoverCard userId={comment.author_id}>
                                                <span className="text-xs font-medium text-brand-text cursor-pointer hover:text-brand-accent transition-colors">
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
                                                    className="text-[10px] text-brand-muted hover:text-brand-accent"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCommentToDelete(comment.id);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="text-[10px] text-brand-muted hover:text-red-400"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <div className="mt-2 space-y-2">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full bg-brand-card border border-brand-border rounded-lg p-2 text-sm focus:outline-none focus:border-brand-accent/50"
                                                rows={2}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="text-xs text-brand-muted hover:text-brand-text"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(comment.id)}
                                                    className="text-xs text-brand-accent font-medium"
                                                >
                                                    Guardar
                                                </button>
                                            </div>
                                        </div>
                                    ) : comment.content.trim().startsWith('<img') && comment.content.includes('giphy.com') ? (
                                        <div
                                            className="mt-1 [&_img]:max-w-[160px] [&_img]:rounded-lg [&_img]:max-h-[120px] [&_img]:object-cover"
                                            dangerouslySetInnerHTML={{ __html: comment.content }}
                                        />
                                    ) : (
                                        <p className="text-sm text-brand-text-secondary mt-0.5 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    )}
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

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setCommentToDelete(null);
                }}
                onConfirm={() => {
                    if (commentToDelete) deleteComment(commentToDelete);
                }}
                title="¿Eliminar comentario?"
                description="Esta acción no se puede deshacer. El comentario se borrará permanentemente."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    );
}
