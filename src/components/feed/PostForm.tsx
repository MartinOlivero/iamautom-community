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
    const { profile } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const isEmpty = !content.trim() || content === '<p></p>';
        if (isEmpty) return;
        setIsSubmitting(true);
        await onSubmit(content);
        setContent("");
        setIsSubmitting(false);
    }

    const labels: Record<string, string> = {
        general: "General", proyectos: "Proyectos",
        soporte: "Soporte", off_topic: "Off Topic", inner_circle_vip: "Inner Circle",
    };

    return (
        <div className="bg-brand-card rounded-2xl border border-brand-border transition-all duration-300 shadow-card p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex gap-3 items-center mb-1">
                    <Avatar
                        name={profile?.full_name || ""}
                        imageUrl={profile?.avatar_url || undefined}
                        size="md"
                    />
                    <div className="text-sm font-medium text-brand-text">
                        Escribiendo en <span className="text-brand-accent font-semibold">#{labels[channel] || channel}</span>
                    </div>
                </div>

                <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder={`¿Qué quieres compartir con la comunidad?`}
                />

                <div className="flex items-center justify-end mt-1">
                    <button
                        type="submit"
                        disabled={!content.trim() || content === '<p></p>' || isSubmitting}
                        className="relative overflow-hidden px-6 py-2 rounded-xl text-sm font-semibold text-white
                            bg-brand-accent hover:bg-brand-accent-hover
                            hover:scale-[1.03] hover:shadow-accent
                            active:scale-[0.97] transition-all duration-200
                            disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publicando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                Publicar <span className="text-white/70">→</span>
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
