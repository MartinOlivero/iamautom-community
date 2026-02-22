"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useModules } from "@/hooks/useModules";
import ModuleCard from "@/components/courses/ModuleCard";
import Spinner from "@/components/ui/Spinner";

/**
 * Courses page — grid of available modules with progress tracking.
 */
export default function CursosPage() {
    const { modules, isLoading } = useModules();
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-display font-bold text-brand-text">Cursos</h1>
                <p className="text-sm text-brand-muted mt-1">
                    Módulos paso a paso con video, recursos y seguimiento de progreso
                </p>
            </div>

            {/* Module grid */}
            {modules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((mod) => (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            onClick={() => router.push(`/app/cursos/${mod.id}`)}
                        />
                    ))}
                </div>
            ) : isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-brand-muted text-sm">
                        Los cursos están siendo preparados. ¡Pronto habrá contenido!
                    </p>
                </div>
            )}
        </div>
    );
}
