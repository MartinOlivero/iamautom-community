"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Card from "@/components/ui/Card";
import PlanBadge from "@/components/ui/Badge";

/**
 * Feed page — placeholder for Phase 2 implementation.
 * Confirms the full auth + subscription flow works end-to-end.
 */
export default function FeedPage() {
    const { profile } = useAuth();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome card */}
            <Card padding="lg">
                <div className="flex items-start gap-4">
                    <span className="text-4xl">🎉</span>
                    <div>
                        <h1 className="text-2xl font-display font-semibold text-brand-text mb-1">
                            ¡Bienvenido{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
                        </h1>
                        <p className="text-brand-text-secondary">
                            Tu cuenta está activa y lista para usar.
                        </p>
                        {profile && (
                            <div className="mt-3 flex items-center gap-3">
                                <PlanBadge planType={profile.plan_type} />
                                <span className="text-xs text-brand-muted font-mono">
                                    {profile.xp_points} XP · 🔥 {profile.current_streak} streak
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Placeholder feed */}
            <div className="text-center py-16">
                <span className="text-5xl block mb-4">📣</span>
                <h2 className="text-lg font-medium text-brand-text mb-2">
                    El feed está en camino
                </h2>
                <p className="text-sm text-brand-muted max-w-sm mx-auto">
                    Aquí verás posts de la comunidad, encuestas y anuncios.
                    Estamos construyendo algo increíble. 🚀
                </p>
            </div>
        </div>
    );
}
