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
        const el = textareaRef.current;
        if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
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

    const labels: Record<string, string> = {
        general: "General", proyectos: "Proyectos",
        soporte: "Soporte", off_topic: "Off Topic", inner_circle_vip: "Inner Circle",
    };

    return (
        <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-card ${isFocused ? "border-indigo-300 shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_4px_16px_rgba(0,0,0,0.08)]" : "border-slate-200"
            }`}>
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
                            placeholder={`¿Qué querés compartir en #${labels[channel] || channel}?`}
                            className="w-full bg-transparent text-slate-800 placeholder:text-slate-400
                                text-sm resize-none outline-none min-h-[44px] max-h-[220px]
                                leading-relaxed pt-1"
                            rows={1}
                        />

                        {(isFocused || content.trim()) && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <button type="button" className="text-lg hover:scale-110 transition-transform" title="Imagen">📸</button>
                                    <button type="button" className="text-lg hover:scale-110 transition-transform" title="Adjunto">📎</button>
                                    <button type="button" className="text-lg hover:scale-110 transition-transform" title="GIF">🎭</button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!content.trim() || isSubmitting}
                                    className="relative overflow-hidden px-6 py-2 rounded-xl text-sm font-semibold text-white
                                        bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]
                                        hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)]
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
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
