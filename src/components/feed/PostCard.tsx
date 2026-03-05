/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import ProfileHoverCard from "@/components/ui/ProfileHoverCard";
import PlanBadge from "@/components/ui/Badge";
import { getLevelInfo } from "@/lib/levels";
import ReactionPicker from "./ReactionPicker";
import CommentSection from "./CommentSection";
import type { PostWithDetails } from "@/hooks/usePosts";
import { useAuth } from "@/components/auth/AuthProvider";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useToastQueue } from "@/hooks/useToastQueue";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface PostCardProps {
    post: PostWithDetails;
    onToggleReaction: (postId: string, emoji: string) => void;
    onDelete?: (postId: string) => void;
    onUpdate?: (postId: string, content: string) => void;
    onTogglePin?: (postId: string, isPinned: boolean) => void;
    onSelect?: (post: PostWithDetails) => void;
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

function extractYoutubeId(content: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = content.match(regex);
    return match ? match[1] : null;
}

export default function PostCard({ post, onToggleReaction, onDelete, onUpdate, onTogglePin, onSelect }: PostCardProps) {
    const { user } = useAuth();
    const { addToast } = useToastQueue();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(post.content);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);
    const isAuthor = user?.id === post.author_id;

    const youtubeId = useMemo(() => extractYoutubeId(post.content), [post.content]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setShowShareDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const copyToClipboard = () => {
        const url = `${window.location.origin}/app/feed?post=${post.id}`;
        navigator.clipboard.writeText(url);
        addToast({
            type: 'success',
            title: '¡Enlace copiado!',
            message: 'El enlace se ha copiado al portapapeles'
        });
        setShowShareDropdown(false);
    };

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

    const handleUpdate = async () => {
        if (!editText.trim()) return;
        if (onUpdate) {
            await onUpdate(post.id, editText.trim());
            setIsEditing(false);
        }
    };

    // Simple "Read more" logic: if content length > 300 characters, truncate
    const shouldTruncate = post.content.length > 300 && !isExpanded && !isEditing;
    const displayedContent = shouldTruncate ? post.content.substring(0, 300) + "..." : post.content;

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger if clicking on a button, link, or the reaction picker
        const target = e.target as HTMLElement;
        if (
            target.closest('button') ||
            target.closest('a') ||
            target.closest('.reaction-picker') ||
            isEditing
        ) {
            return;
        }

        if (onSelect) {
            onSelect(post);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                group relative bg-brand-card rounded-2xl border transition-all duration-300 overflow-hidden
                ${onSelect ? 'cursor-pointer' : ''}
                ${post.is_pinned
                    ? "border-l-4 border-l-brand-accent border-brand-border"
                    : "border-brand-border"
                }
                hover:shadow-lg hover:border-brand-border/80
            `}
        >
            {/* Pinned badge in corner */}
            {post.is_pinned && (
                <div className="absolute top-4 right-5 px-2 py-0.5 bg-brand-accent/10 rounded-full flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                        📌 Fijado
                    </span>
                </div>
            )}

            <div className="p-5 lg:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3.5">
                        <ProfileHoverCard userId={post.author.id}>
                            <div className="relative cursor-pointer">
                                <Avatar
                                    name={post.author.full_name}
                                    imageUrl={post.author.avatar_url || undefined}
                                    size="lg" // lg is 48px in sizeStyles
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-brand-card" />
                            </div>
                        </ProfileHoverCard>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <ProfileHoverCard userId={post.author.id}>
                                    <span className="text-base font-bold text-brand-text hover:text-brand-accent cursor-pointer transition-colors">
                                        {post.author.full_name}
                                    </span>
                                </ProfileHoverCard>
                                <PlanBadge planType={post.author.plan_type} />
                                <span className="text-[10px] bg-brand-hover-bg text-brand-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                    LVL {getLevelInfo(post.author.level).number}
                                </span>
                                <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded font-bold">
                                    {getLevelInfo(post.author.level).label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm text-brand-muted">
                                    {timeAgo(post.created_at)}
                                </span>
                                <span className="text-brand-muted/30 text-[10px]">•</span>
                                <span className="text-sm font-bold text-brand-accent/70 hover:text-brand-accent cursor-pointer uppercase tracking-wider">
                                    #{post.channel}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        {isAuthor && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3V17.536L16.732 3.732z" />
                                </svg>
                            </button>
                        )}
                        {(isAuthor || user?.user_metadata?.role === "admin") && onDelete && (
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

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={() => onDelete?.(post.id)}
                    title="¿Eliminar publicación?"
                    description="Esta acción no se puede deshacer. La publicación y todos sus comentarios se borrarán permanentemente."
                    confirmText="Eliminar"
                    variant="danger"
                />

                {/* Content */}
                <div className="mb-5">
                    {isEditing ? (
                        <div className="space-y-3">
                            <RichTextEditor
                                content={editText}
                                onChange={setEditText}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setIsEditing(false); setEditText(post.content); }}
                                    className="px-4 py-1.5 text-xs text-brand-muted hover:text-brand-text transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-1.5 text-xs bg-brand-accent text-white rounded-lg font-bold hover:scale-[1.02] transition-all"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <RichTextDisplay content={displayedContent} className="text-[15px] leading-relaxed text-brand-text" />
                            {shouldTruncate && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="text-brand-accent text-sm font-bold hover:underline"
                                >
                                    Ver más
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Media Preview */}
                {!isEditing && (
                    <div className="space-y-4 mb-5">
                        {/* YouTube Preview */}
                        {youtubeId && (
                            <div className="aspect-video rounded-2xl overflow-hidden border border-brand-border bg-black shadow-lg">
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* Image Preview */}
                        {post.media_urls && post.media_urls.length > 0 && (
                            <div className={`grid gap-2 ${post.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {post.media_urls.slice(0, 4).map((url, index) => (
                                    <div key={index} className="relative aspect-auto rounded-2xl overflow-hidden border border-brand-border group/img">
                                        <img
                                            src={url}
                                            alt=""
                                            className="w-full h-full object-cover max-h-[400px] hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <ReactionPicker
                            reactions={aggregatedReactions}
                            onToggle={(emoji) => onToggleReaction(post.id, emoji)}
                        />
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <CommentSection postId={post.id} commentCount={post.comment_count} />

                        <div className="relative share-dropdown-container">
                            <button
                                onClick={() => setShowShareDropdown(!showShareDropdown)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${showShareDropdown ? 'text-brand-accent bg-brand-accent/10' : 'text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span className="hidden sm:inline">Compartir</span>
                            </button>

                            {showShareDropdown && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-brand-card border border-brand-border rounded-xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-text hover:bg-brand-hover-bg transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        Copiar enlace
                                    </button>
                                    <a
                                        href={`https://wa.me/?text=Mirá este post: ${window.location.origin}/app/feed?post=${post.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setShowShareDropdown(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-text hover:bg-brand-hover-bg transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.956-.5-5.705-1.448l-6.391 1.656zm6.549-4.509c1.659.983 3.626 1.502 5.623 1.503 5.452 0 9.889-4.438 9.892-9.895.002-2.644-1.029-5.129-2.903-7.005-1.874-1.875-4.359-2.907-7.004-2.908-5.453 0-9.89 4.438-9.892 9.896-.001 2.096.547 4.142 1.588 5.945l-1.011 3.684 3.77-.975zm11.082-7.514c-.318-.159-1.883-.93-2.174-1.036-.291-.106-.503-.159-.715.159-.211.318-.82 1.036-1.005 1.248-.186.212-.37.239-.688.08-.318-.159-1.343-.495-2.558-1.579-.945-.844-1.583-1.885-1.768-2.204-.186-.318-.02-.49.139-.648.144-.143.318-.371.477-.557.158-.186.212-.318.318-.53.106-.212.053-.398-.027-.557-.079-.159-.715-1.725-.979-2.362-.258-.62-.519-.536-.715-.546-.184-.009-.397-.01-.609-.01s-.556.08-.847.398c-.291.318-1.112 1.088-1.112 2.652s1.138 3.083 1.297 3.296c.159.212 2.24 3.42 5.426 4.793.758.327 1.35.521 1.812.667.76.241 1.453.207 1.999.126.61-.09 1.883-.77 2.148-1.514.265-.744.265-1.383.185-1.514-.079-.131-.291-.212-.609-.371z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=Mirá este post:&url=${window.location.origin}/app/feed?post=${post.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setShowShareDropdown(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-brand-text hover:bg-brand-hover-bg transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                        </svg>
                                        Twitter / X
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
