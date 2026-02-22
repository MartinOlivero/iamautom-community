"use client";

import ProgressBar from "@/components/ui/ProgressBar";
import type { ModuleWithProgress } from "@/hooks/useModules";

interface ModuleCardProps {
    module: ModuleWithProgress;
    onClick?: () => void;
}

/**
 * Card displaying a course module with emoji, title, progress, and tier indicator.
 */
export default function ModuleCard({ module, onClick }: ModuleCardProps) {
    const progress =
        module.lesson_count > 0
            ? Math.round((module.completed_count / module.lesson_count) * 100)
            : 0;

    const isCompleted = progress === 100;
    const isInnerCircle = module.tier_required === "inner_circle";

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-brand-card rounded-card border border-brand-border p-5
                 transition-all hover:shadow-md hover:border-brand-accent/20 hover:-translate-y-0.5
                 group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                    {module.emoji}
                </span>

                {isInnerCircle && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider
                          bg-gradient-gold text-brand-dark px-2 py-0.5 rounded-pill">
                        VIP
                    </span>
                )}

                {isCompleted && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider
                          bg-green-500/10 text-green-500 px-2 py-0.5 rounded-pill">
                        ✓ Completado
                    </span>
                )}
            </div>

            {/* Title & description */}
            <h3 className="text-sm font-semibold text-brand-text mb-1 group-hover:text-brand-accent transition-colors">
                {module.title}
            </h3>
            <p className="text-xs text-brand-muted line-clamp-2 mb-4">
                {module.description}
            </p>

            {/* Progress */}
            <div className="space-y-1.5">
                <ProgressBar
                    value={progress}
                    color={isCompleted ? "success" : "accent"}
                    size="sm"
                    showLabel={false}
                />
                <div className="flex items-center justify-between text-[10px] text-brand-muted">
                    <span>
                        {module.completed_count}/{module.lesson_count} lecciones
                    </span>
                    <span className="font-mono">{progress}%</span>
                </div>
            </div>
        </button>
    );
}
