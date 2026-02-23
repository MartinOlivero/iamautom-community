"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface LessonPlayerProps {
    lesson: {
        id: string;
        title: string;
        description: string;
        youtube_url: string;
        duration_minutes: number;
        attachments: string[];
    };
    isCompleted: boolean;
    onComplete: (lessonId: string) => Promise<void>;
}

/**
 * Extracts YouTube video ID from various URL formats.
 */
function getYouTubeId(url: string): string | null {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

/**
 * Lesson viewer with YouTube embed, description, and mark-complete button.
 */
export default function LessonPlayer({ lesson, isCompleted, onComplete }: LessonPlayerProps) {
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(isCompleted);

    const videoId = getYouTubeId(lesson.youtube_url);

    async function handleComplete() {
        setCompleting(true);
        await onComplete(lesson.id);
        setCompleted(true);
        setCompleting(false);
    }

    return (
        <div className="space-y-5">
            {/* Video embed — 16:9 responsive */}
            {videoId ? (
                <div className="relative w-full pt-[56.25%] bg-black rounded-card overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={lesson.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <div className="w-full pt-[56.25%] bg-brand-hover-bg rounded-card relative">
                    <div className="absolute inset-0 flex items-center justify-center text-brand-muted text-sm">
                        Video no disponible
                    </div>
                </div>
            )}

            {/* Lesson info */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-lg font-display font-bold text-brand-text">{lesson.title}</h2>
                    <p className="text-xs text-brand-muted mt-1">
                        ⏱ {lesson.duration_minutes} min
                    </p>
                </div>

                {/* Complete button */}
                {completed ? (
                    <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium bg-green-500/10 px-3 py-1.5 rounded-pill">
                        <span>✓</span>
                        <span>Completada</span>
                    </div>
                ) : (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleComplete}
                        isLoading={completing}
                    >
                        ✓ Marcar completa
                    </Button>
                )}
            </div>

            {/* Description (Rich Text) */}
            {lesson.description && (
                <div
                    className="tiptap prose-content text-sm text-brand-text-secondary leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: lesson.description }}
                />
            )}

            {/* Attachments */}
            {lesson.attachments && lesson.attachments.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                        Archivos adjuntos
                    </h4>
                    <div className="space-y-1">
                        {lesson.attachments.map((url, index) => (
                            <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-brand-accent hover:underline"
                            >
                                📎 Archivo {index + 1}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
