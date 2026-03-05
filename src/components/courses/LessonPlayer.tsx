"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/insforge/client";
import { AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { YouTubePlayerWithTracking } from "@/components/lessons/YouTubePlayerWithTracking";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { useQuiz } from "@/hooks/useQuiz";

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
 * Lesson viewer with YouTube embed, description, and mark-complete button.
 */
export default function LessonPlayer({ lesson, isCompleted, onComplete }: LessonPlayerProps) {
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(isCompleted);

    // Sync internal state with props when navigation occurs
    useEffect(() => {
        setCompleted(isCompleted);
    }, [isCompleted, lesson.id]);

    const [canComplete, setCanComplete] = useState(false);
    const { state: quizState, generateAndOpen, closeQuiz } = useQuiz();

    const { user } = useAuth();
    const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
    const [checkingProgress, setCheckingProgress] = useState(true);

    useEffect(() => {
        if (!user?.id || !lesson?.id) return;

        // Reset state for new lesson
        setIsAlreadyCompleted(false);
        setCheckingProgress(true);

        const fetchProgress = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('lesson_progress')
                    .select('completed')
                    .eq('user_id', user.id)
                    .eq('lesson_id', lesson.id)
                    .single();

                if (data?.completed === true) {
                    setIsAlreadyCompleted(true);
                }
            } catch {
                // If single() fails (no data), it's not completed
                setIsAlreadyCompleted(false);
            } finally {
                setCheckingProgress(false);
            }
        };

        fetchProgress();
    }, [user?.id, lesson?.id]);

    const handleCanCompleteChange = useCallback((value: boolean) => {
        setCanComplete(value);
    }, []);

    async function handleComplete() {
        setCompleting(true);
        await onComplete(lesson.id);
        setCompleted(true);
        setCompleting(false);
    }

    return (
        <div className="space-y-5">
            {/* Video embed with tracking */}
            <YouTubePlayerWithTracking
                videoUrl={lesson.youtube_url}
                durationMinutes={lesson.duration_minutes}
                onCanCompleteChange={handleCanCompleteChange}
            />

            {/* Lesson info */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-xl font-display font-bold text-brand-text">{lesson.title}</h2>
                    <p className="text-sm text-brand-muted mt-1">
                        ⏱ {lesson.duration_minutes} min
                    </p>
                </div>

                {/* Complete button with tracking logic */}
                {checkingProgress ? (
                    <Button
                        disabled
                        variant="outline"
                        size="sm"
                        className="opacity-50 cursor-not-allowed border-white/10 text-brand-muted"
                    >
                        ...
                    </Button>
                ) : isAlreadyCompleted || completed ? (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium bg-green-500/10 px-4 py-2 rounded-pill border border-green-500/20">
                            <span>✓</span>
                            <span>Lección completada</span>
                        </div>
                        <p className="text-[10px] text-brand-muted text-center italic">
                            Ya sumaste XP por esta lección
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 flex flex-col items-end">
                        <Button
                            variant={canComplete ? "primary" : "outline"}
                            size="sm"
                            onClick={() => generateAndOpen(lesson.title, lesson.description)}
                            isLoading={completing || quizState.isLoading}
                            disabled={!canComplete || quizState.isLoading}
                            className={!canComplete ? "opacity-50 cursor-not-allowed border-white/10 text-brand-muted" : "shadow-glow-blue"}
                        >
                            {quizState.isLoading
                                ? '⏳ Generando quiz...'
                                : canComplete ? '✓ Marcar completa' : '🔒 Completá el video primero'}
                        </Button>

                        {quizState.error && (
                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1">
                                {quizState.error}
                            </p>
                        )}

                        {!canComplete && (
                            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                                Mirá el 80% para habilitar
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Description (Rich Text) */}
            {lesson.description && (
                <div
                    className="tiptap prose-content text-brand-text-secondary leading-relaxed overflow-hidden"
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

            {/* AI Generated Quiz Modal */}
            <AnimatePresence>
                {quizState.isOpen && (
                    <LessonQuiz
                        questions={quizState.questions}
                        lessonTitle={lesson.title}
                        onPass={() => {
                            closeQuiz();
                            handleComplete();
                            setIsAlreadyCompleted(true);
                        }}
                        onClose={closeQuiz}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
