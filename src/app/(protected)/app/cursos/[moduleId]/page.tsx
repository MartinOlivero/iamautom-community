"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/insforge/client";
import LessonPlayer from "@/components/courses/LessonPlayer";
import ProgressBar from "@/components/ui/ProgressBar";
import Spinner from "@/components/ui/Spinner";
import { triggerXPAward } from "@/lib/xpClient";
import { Lock, ArrowLeft } from "lucide-react";

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
    available_during_trial: boolean;
}

/**
 * Module detail page with lesson sidebar and video player.
 */
const TRIAL_DAYS = 14;

export default function ModuleDetailPage() {
    const params = useParams();
    const moduleId = params.moduleId as string;
    const supabase = createClient();
    const router = useRouter();

    const [module_, setModule] = useState<ModuleDetail | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTrialLocked, setIsTrialLocked] = useState(false);
    const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

    const fetchModuleData = useCallback(async () => {
        setIsLoading(true);

        // Fetch module
        const { data: moduleData } = await supabase
            .from("modules")
            .select("id, title, description, emoji, available_during_trial")
            .eq("id", moduleId)
            .single();

        if (moduleData) setModule(moduleData);

        // Check trial lock
        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (currentUser && moduleData) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("created_at, role")
                .eq("id", currentUser.id)
                .single();

            if (profile && profile.role !== "admin") {
                const createdAt = new Date(profile.created_at);
                const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
                const now = new Date();
                const inTrial = now < trialEnd;

                if (inTrial && !moduleData.available_during_trial) {
                    setIsTrialLocked(true);
                    setTrialDaysRemaining(Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))));
                    setIsLoading(false);
                    return;
                }
            }
        }

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
                setCompletedLessonIds(new Set(progressData.map((p: { lesson_id: string }) => p.lesson_id)));
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

    if (isTrialLocked && module_) {
        return (
            <div className="max-w-md mx-auto text-center py-16 px-6">
                <div className="w-20 h-20 rounded-full bg-brand-bg-2 border border-brand-border flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} className="text-brand-muted" />
                </div>
                <h2 className="text-xl font-display font-bold text-brand-text mb-2">
                    {module_.emoji} {module_.title}
                </h2>
                <p className="text-brand-muted text-sm mb-6">
                    Este módulo se desbloqueará en{" "}
                    <span className="text-brand-accent font-semibold">
                        {trialDaysRemaining} {trialDaysRemaining === 1 ? "día" : "días"}
                    </span>.
                    <br />
                    <span className="text-xs mt-2 block">
                        Mientras tanto, explorá los módulos disponibles para tu período actual.
                    </span>
                </p>
                <button
                    onClick={() => router.push("/app/cursos")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent text-white rounded-xl font-medium text-sm hover:bg-brand-accent/90 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Volver a Cursos
                </button>
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
            <aside className="lg:w-80 flex-shrink-0">
                <div className="bg-brand-card rounded-card border border-brand-border p-5 sticky top-20">
                    {/* Module header */}
                    <div className="mb-5">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-2xl">{module_.emoji}</span>
                            <h2 className="text-base font-semibold text-brand-text">{module_.title}</h2>
                        </div>
                        <ProgressBar value={progress} size="sm" showLabel={false} />
                        <p className="text-xs text-brand-muted mt-1.5">
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
                                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-input
                             text-sm transition-all
                             ${isActive
                                            ? "bg-brand-accent/10 text-brand-accent font-medium"
                                            : "text-brand-text-secondary hover:bg-brand-hover-bg"
                                        }`}
                                >
                                    {/* Status indicator */}
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
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

                                    <span className="ml-auto text-xs text-brand-muted flex-shrink-0">
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
