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
                Red Neuronal inactiva (Aún no hay nodos disponibles)
            </p>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 pb-8 relative">
            {/* Background connecting line (aesthetic only) */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-brand-border -z-10 hidden sm:block"></div>

            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className="relative group flex flex-col items-center gap-3 w-24"
                    title={
                        badge.earned
                            ? `${badge.name} — Nodo Activado`
                            : `${badge.name} — ${badge.description}`
                    }
                >
                    {/* The Node */}
                    <div
                        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center relative transition-all duration-500
                         ${badge.earned
                                ? "bg-gradient-to-br from-brand-accent/20 to-brand-electric/10 border-2 border-brand-accent shadow-[0_0_20px_rgba(255,77,0,0.3)] group-hover:shadow-[0_0_35px_rgba(255,77,0,0.6)] group-hover:-translate-y-2 group-hover:scale-110"
                                : "bg-brand-bg-2 border-2 border-brand-border opacity-50 grayscale hover:opacity-70 hover:grayscale-0"
                            }`}
                    >
                        {/* Glow inside */}
                        {badge.earned && (
                            <div className="absolute inset-0 bg-brand-accent/10 rounded-full blur-md animate-pulse"></div>
                        )}

                        <span className={`text-2xl z-10 ${badge.earned ? "scale-110" : "opacity-40"}`}>
                            {badge.emoji}
                        </span>

                        {/* Lock icon for unearned */}
                        {!badge.earned && (
                            <span className="absolute -top-1 -right-1 text-[10px] text-brand-muted bg-brand-card rounded-full w-4 h-4 flex items-center justify-center border border-brand-border">
                                🔒
                            </span>
                        )}
                    </div>

                    {/* Node Info */}
                    <div className="text-center w-full">
                        <p
                            className={`text-[10px] font-bold leading-tight uppercase tracking-wider
                           ${badge.earned ? "text-brand-text drop-shadow-sm" : "text-brand-muted"}`}
                        >
                            {badge.name}
                        </p>
                        {badge.earned && badge.earned_at ? (
                            <p className="text-[9px] text-brand-accent/80 font-mono mt-1">
                                [ACTIVADO]
                            </p>
                        ) : (
                            <p className="text-[9px] text-brand-muted font-mono mt-1">
                                [OFLINE]
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
