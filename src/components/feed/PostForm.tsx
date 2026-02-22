"use client";

import { useState, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";

interface PostFormProps {
    onSubmit: (content: string, mediaUrls?: string[]) => Promise<unknown>;
    channel: string;
}

export default function PostForm({ onSubmit, channel }: PostFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { profile } = useAuth();

    function handleInput() {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        await onSubmit(content.trim());
        setContent("");
        setIsFocused(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setIsSubmitting(false);
    }

    const channelLabels: Record<string, string> = {
        general: "General",
        proyectos: "Proyectos",
        soporte: "Soporte",
        off_topic: "Off Topic",
        inner_circle_vip: "Inner Circle",
    };

    return (
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isFocused ? 'border-[#38bdf8]/40 bg-[rgba(10,16,30,0.9)] shadow-[0_0_30px_rgba(56,189,248,0.08)]' : 'border-white/[0.07] bg-[rgba(10,16,30,0.6)]'}`}>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3 p-4">
                    <Avatar
                        name={profile?.full_name || ""}
                        imageUrl={profile?.avatar_url || undefined}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onInput={handleInput}
                            onFocus={() => setIsFocused(true)}
                            placeholder={`¿Qué querés compartir en #${channelLabels[channel] || channel}?`}
                            className="w-full bg-transparent text-white/80 placeholder:text-white/25
                                text-sm resize-none outline-none min-h-[40px] max-h-[200px]
                                leading-relaxed transition-all"
                            rows={1}
                        />

                        {(isFocused || content.trim()) && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 animate-fade-in">
                                <div className="flex items-center gap-3 text-white/25 text-sm">
                                    <button type="button" className="hover:text-white/50 transition-colors" title="Imagen">📸</button>
                                    <button type="button" className="hover:text-white/50 transition-colors" title="Adjunto">📎</button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!content.trim() || isSubmitting}
                                    className="relative overflow-hidden px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-accent disabled:opacity-40 hover:scale-[1.03] transition-all duration-200 shadow-glow-accent disabled:shadow-none"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                            Publicando...
                                        </span>
                                    ) : "Publicar →"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
