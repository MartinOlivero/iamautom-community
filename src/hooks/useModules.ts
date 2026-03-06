"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";

export interface ModuleWithProgress {
    id: string;
    title: string;
    description: string;
    emoji: string;
    cover_image_url: string | null;
    order_index: number;
    tier_required: "member" | "inner_circle";
    is_published: boolean;
    available_during_trial: boolean;
    release_date: string | null;
    created_at: string;
    lesson_count: number;
    completed_count: number;
}

const TRIAL_DAYS = 14;

export function useModules() {
    const [modules, setModules] = useState<ModuleWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInTrialPeriod, setIsInTrialPeriod] = useState(false);
    const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);

    const fetchModules = useCallback(async () => {
        setIsLoading(true);

        try {
            const db = createClient();

            const {
                data: { user },
            } = await db.auth.getUser();

            // Fetch modules with lesson count
            const { data: modulesData, error } = await db
                .from("modules")
                .select("*, lessons(count)")
                .eq("is_published", true)
                .order("order_index", { ascending: true });

            if (error) {
                console.error("Error fetching modules:", error);
                setModules([]);
                setIsLoading(false);
                return;
            }

            if (!modulesData) {
                setModules([]);
                setIsLoading(false);
                return;
            }

            // Check if user is in trial period (first 14 days)
            if (user) {
                const { data: profile } = await db
                    .from("profiles")
                    .select("created_at, role")
                    .eq("id", user.id)
                    .single();

                if (profile && profile.role !== "admin") {
                    const createdAt = new Date(profile.created_at);
                    const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
                    const now = new Date();
                    setIsInTrialPeriod(now < trialEnd);
                    setTrialEndsAt(trialEnd);
                } else {
                    setIsInTrialPeriod(false);
                    setTrialEndsAt(null);
                }
            }

            // If user is logged in, fetch their progress
            const progressMap: Record<string, number> = {};
            if (user) {
                const { data: progressData } = await db
                    .from("lesson_progress")
                    .select("lesson_id, completed")
                    .eq("user_id", user.id)
                    .eq("completed", true);

                if (progressData) {
                    // Get progress grouped by module
                    const { data: lessonToModule } = await db
                        .from("lessons")
                        .select("id, module_id");

                    if (lessonToModule) {
                        const moduleMap: Record<string, string> = {};
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        lessonToModule.forEach((l: any) => {
                            moduleMap[l.id] = l.module_id;
                        });

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        progressData.forEach((p: any) => {
                            const moduleId = moduleMap[p.lesson_id];
                            if (moduleId) {
                                progressMap[moduleId] = (progressMap[moduleId] || 0) + 1;
                            }
                        });
                    }
                }
            }

            const formatted: ModuleWithProgress[] = modulesData.map(
                (m: Record<string, unknown>) => ({
                    ...m,
                    lesson_count:
                        Array.isArray(m.lessons) && m.lessons[0]
                            ? (m.lessons[0] as { count: number }).count
                            : 0,
                    completed_count: progressMap[m.id as string] || 0,
                })
            ) as ModuleWithProgress[];

            setModules(formatted);
        } catch (err) {
            console.error("Exception fetching modules:", err);
            setModules([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    return { modules, isLoading, isInTrialPeriod, trialEndsAt, refresh: fetchModules };
}
