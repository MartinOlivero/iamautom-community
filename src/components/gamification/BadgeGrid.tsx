"use client";

import type { BadgeWithStatus } from "@/hooks/useBadges";

interface BadgeGridProps {
    badges: BadgeWithStatus[];
    isLoading: boolean;
}

/**
 * Grid of badges — earned ones are colorful, unearned ones are grayed out & locked.
 */
export default function BadgeGrid({ badges, isLoading }: BadgeGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-brand-hover-bg rounded-card aspect-square animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (badges.length === 0) {
        return (
            <p className="text-sm text-brand-muted text-center py-6">
                No hay badges disponibles aún
            </p>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={`relative overflow-hidden rounded-card border p-3 text-center transition-all duration-300
                     ${badge.earned
                            ? "group bg-gradient-to-br from-brand-accent/10 to-transparent backdrop-blur-xl border-brand-accent/30 shadow-[0_0_20px_rgba(255,77,0,0.1)] hover:shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:-translate-y-1 hover:border-brand-accent/70"
                            : "bg-white/5 border-white/5 opacity-50 grayscale hover:opacity-70 hover:grayscale-0"
                        }`}
                    title={
                        badge.earned
                            ? `${badge.name} — Ganado`
                            : `${badge.name} — ${badge.description}`
                    }
                >
                    {/* Emoji */}
                    <span className={`text-3xl block mb-1.5 ${badge.earned ? "" : "opacity-40"}`}>
                        {badge.emoji}
                    </span>

                    {/* Name */}
                    <p
                        className={`text-[10px] font-semibold leading-tight
                       ${badge.earned ? "text-brand-text" : "text-brand-muted"}`}
                    >
                        {badge.name}
                    </p>

                    {/* Lock icon for unearned */}
                    {!badge.earned && (
                        <span className="absolute top-1.5 right-1.5 text-[10px] text-brand-muted">
                            🔒
                        </span>
                    )}

                    {/* Earned date */}
                    {badge.earned && badge.earned_at && (
                        <p className="text-[8px] text-brand-muted mt-1">
                            {new Date(badge.earned_at).toLocaleDateString("es-AR", {
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
