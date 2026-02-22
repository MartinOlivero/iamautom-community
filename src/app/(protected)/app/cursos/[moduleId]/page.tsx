"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LessonPlayer from "@/components/courses/LessonPlayer";
import ProgressBar from "@/components/ui/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import { triggerXPAward } from "@/lib/xpClient";

interface Lesson {
    id: string;
    title: string;
    description: string;
    youtube_url: string;
    duration_minutes: number;
    order_index: number;
    attachments: string[];
}

interface ModuleDetail {
    id: string;
    title: string;
    description: string;
    emoji: string;
}

/**
 * Module detail page with lesson sidebar and video player.
 */
export default function ModuleDetailPage() {
    const params = useParams();
    const moduleId = params.moduleId as string;
    const supabase = createClient();

    const [module_, setModule] = useState<ModuleDetail | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchModuleData = useCallback(async () => {
        setIsLoading(true);

        // Fetch module
        const { data: moduleData } = await supabase
            .from("modules")
            .select("id, title, description, emoji")
            .eq("id", moduleId)
            .single();

        if (moduleData) setModule(moduleData);

        // Fetch lessons
        const { data: lessonsData } = await supabase
            .from("lessons")
            .select("*")
            .eq("module_id", moduleId)
            .order("order_index", { ascending: true });

        if (lessonsData) {
            setLessons(lessonsData as Lesson[]);
            if (lessonsData.length > 0 && !activeLessonId) {
                setActiveLessonId(lessonsData[0].id);
            }
        }

        // Fetch user progress
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            const { data: progressData } = await supabase
                .from("lesson_progress")
                .select("lesson_id")
                .eq("user_id", user.id)
                .eq("completed", true);

            if (progressData) {
                setCompletedLessonIds(new Set(progressData.map((p) => p.lesson_id)));
            }
        }

        setIsLoading(false);
    }, [supabase, moduleId, activeLessonId]);

    useEffect(() => {
        fetchModuleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId]);

    /** Mark a lesson as complete */
    async function handleComplete(lessonId: string) {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("lesson_progress").upsert(
            {
                user_id: user.id,
                lesson_id: lessonId,
                completed: true,
                completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,lesson_id" }
        );

        setCompletedLessonIds((prev) => new Set([...Array.from(prev), lessonId]));

        // Award XP for completing a lesson
        triggerXPAward("complete_lesson");
    }

    const activeLesson = lessons.find((l) => l.id === activeLessonId);
    const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!module_) {
        return (
            <div className="text-center py-12">
                <p className="text-brand-muted">Módulo no encontrado</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
            {/* Sidebar — Lesson list */}
            <aside className="lg:w-72 flex-shrink-0">
                <div className="bg-brand-card rounded-card border border-brand-border p-4 sticky top-20">
                    {/* Module header */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{module_.emoji}</span>
                            <h2 className="text-sm font-semibold text-brand-text">{module_.title}</h2>
                        </div>
                        <ProgressBar value={progress} size="sm" showLabel={false} />
                        <p className="text-[10px] text-brand-muted mt-1">
                            {completedCount}/{lessons.length} completadas · {progress}%
                        </p>
                    </div>

                    {/* Lesson list */}
                    <nav className="space-y-1">
                        {lessons.map((lesson, index) => {
                            const isActive = lesson.id === activeLessonId;
                            const isDone = completedLessonIds.has(lesson.id);

                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => setActiveLessonId(lesson.id)}
                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-input
                             text-xs transition-all
                             ${isActive
                                            ? "bg-brand-accent/10 text-brand-accent font-medium"
                                            : "text-brand-text-secondary hover:bg-brand-hover-bg"
                                        }`}
                                >
                                    {/* Status indicator */}
                                    <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px]
                               flex-shrink-0 border
                               ${isDone
                                                ? "bg-green-500 border-green-500 text-white"
                                                : isActive
                                                    ? "border-brand-accent text-brand-accent"
                                                    : "border-brand-border text-brand-muted"
                                            }`}
                                    >
                                        {isDone ? "✓" : index + 1}
                                    </span>

                                    <span className="truncate">{lesson.title}</span>

                                    <span className="ml-auto text-[10px] text-brand-muted flex-shrink-0">
                                        {lesson.duration_minutes}m
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main — Lesson player */}
            <main className="flex-1 min-w-0">
                {activeLesson ? (
                    <LessonPlayer
                        lesson={activeLesson}
                        isCompleted={completedLessonIds.has(activeLesson.id)}
                        onComplete={handleComplete}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-4xl mb-3">📖</p>
                        <p className="text-brand-muted text-sm">Seleccioná una lección para empezar</p>
                    </div>
                )}
            </main>
        </div>
    );
}
