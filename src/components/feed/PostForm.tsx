"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";

interface PostFormProps {
    onSubmit: (content: string, mediaUrls?: string[]) => Promise<unknown>;
    channel: string;
}

/**
 * Post creation form with auto-expanding textarea.
 */
export default function PostForm({ onSubmit, channel }: PostFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { profile } = useAuth();

    // Auto-expand textarea
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

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        setIsSubmitting(false);
    }

    const channelLabels: Record<string, string> = {
        general: "General",
        proyectos: "Proyectos",
        soporte: "Soporte",
        off_topic: "Off Topic",
        inner_circle_vip: "Inner Circle VIP",
    };

    return (
        <div className="bg-brand-card rounded-card border border-brand-border p-4">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-3">
                    <Avatar
                        name={profile?.full_name || ""}
                        imageUrl={profile?.avatar_url || undefined}
                        size="sm"
                    />
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onInput={handleInput}
                            onFocus={() => setIsFocused(true)}
                            placeholder={`¿Qué querés compartir en #${channelLabels[channel] || channel}?`}
                            className="w-full bg-transparent text-brand-text placeholder:text-brand-muted
                         text-sm resize-none outline-none min-h-[40px] max-h-[200px]
                         transition-all"
                            rows={1}
                        />

                        {/* Action bar — shown when focused */}
                        {(isFocused || content.trim()) && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border animate-fade-in">
                                <div className="flex items-center gap-2 text-brand-muted text-xs">
                                    <span>📸</span>
                                    <span>📎</span>
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    isLoading={isSubmitting}
                                    disabled={!content.trim()}
                                >
                                    Publicar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
