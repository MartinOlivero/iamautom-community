"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface PostFormProps {
    onSubmit: (content: string, mediaUrls?: string[]) => Promise<unknown>;
    channel: string;
}

export default function PostForm({ onSubmit, channel }: PostFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { profile } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const isEmpty = !content.trim() || content === '<p></p>';
        if (isEmpty) return;
        setIsSubmitting(true);
        await onSubmit(content);
        setContent("");
        setIsSubmitting(false);
        setIsExpanded(false);
    }

    const labels: Record<string, string> = {
        general: "General", proyectos: "Proyectos",
        soporte: "Soporte", off_topic: "Off Topic", inner_circle_vip: "Inner Circle",
    };

    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className="bg-brand-card rounded-2xl border border-brand-border p-4 shadow-card-sm flex items-center gap-4 cursor-pointer hover:border-brand-accent/30 hover:shadow-md transition-all group"
            >
                <Avatar
                    name={profile?.full_name || ""}
                    imageUrl={profile?.avatar_url || undefined}
                    size="md"
                />
                <div className="flex-1 bg-brand-hover-bg/50 rounded-xl px-4 py-2.5 text-brand-muted text-sm font-medium group-hover:bg-brand-hover-bg transition-colors">
                    ¿Qué querés compartir con la comunidad?
                </div>
                <div className="p-2 text-brand-accent">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-card rounded-2xl border border-brand-border transition-all duration-300 shadow-card p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center">
                        <Avatar
                            name={profile?.full_name || ""}
                            imageUrl={profile?.avatar_url || undefined}
                            size="md"
                        />
                        <div className="text-sm font-medium text-brand-text">
                            Escribiendo en <span className="text-brand-accent font-bold">#{labels[channel] || channel}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="text-brand-muted hover:text-brand-text p-1"
                    >
                        ✕
                    </button>
                </div>

                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder={`¿Qué quieres compartir con la comunidad?`}
                    autoFocus
                />

                <div className="flex items-center justify-end gap-3 mt-1">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="text-sm font-medium text-brand-muted hover:text-brand-text px-4 py-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!content.trim() || content === '<p></p>' || isSubmitting}
                        className="relative overflow-hidden px-6 py-2.5 rounded-xl text-sm font-bold text-white
                            bg-brand-accent hover:bg-brand-accent-hover
                            hover:scale-[1.02] hover:shadow-accent
                            active:scale-[0.98] transition-all duration-200
                            disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publicando...
                            </span>
                        ) : (
                            <span>Publicar</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
