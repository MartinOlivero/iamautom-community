"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ModuleWithProgress {
    id: string;
    title: string;
    description: string;
    emoji: string;
    order_index: number;
    tier_required: "member" | "inner_circle";
    is_published: boolean;
    release_date: string | null;
    created_at: string;
    lesson_count: number;
    completed_count: number;
}

export function useModules() {
    const [modules, setModules] = useState<ModuleWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchModules = useCallback(async () => {
        setIsLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Fetch modules with lesson count
        const { data: modulesData, error } = await supabase
            .from("modules")
            .select(
                `
        *,
        lessons:lessons(count)
      `
            )
            .eq("is_published", true)
            .order("order_index", { ascending: true });

        if (error || !modulesData) {
            console.error("Error fetching modules:", error);
            setIsLoading(false);
            return;
        }

        // If user is logged in, fetch their progress
        const progressMap: Record<string, number> = {};
        if (user) {
            const { data: progressData } = await supabase
                .from("lesson_progress")
                .select("lesson_id, completed")
                .eq("user_id", user.id)
                .eq("completed", true);

            if (progressData) {
                // Get progress grouped by module
                const { data: lessonToModule } = await supabase
                    .from("lessons")
                    .select("id, module_id");

                if (lessonToModule) {
                    const moduleMap: Record<string, string> = {};
                    lessonToModule.forEach((l) => {
                        moduleMap[l.id] = l.module_id;
                    });

                    progressData.forEach((p) => {
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
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    return { modules, isLoading, refresh: fetchModules };
}
