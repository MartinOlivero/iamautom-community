"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRefreshOnTabReturn } from "@/hooks/useVisibilityRefresh";
import { createClient } from "@/lib/insforge/client";
import Avatar from "@/components/ui/Avatar";
import AvatarUpload from "@/components/profile/AvatarUpload";
import PlanBadge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { LEVEL_THRESHOLDS } from "@/lib/constants";
import { useBadges } from "@/hooks/useBadges";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import { useTheme } from "@/components/theme/ThemeProvider";
import { RewardsStore } from "@/components/gamification/RewardsStore";
import { GamificationTooltip } from "@/components/ui/GamificationTooltip";

export default function PerfilPage() {
    const { user, profile, refreshProfile } = useAuth();
    useRefreshOnTabReturn(refreshProfile);
    const db = createClient();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (theme !== "dark") {
            setTheme("dark");
        }
    }, [theme, setTheme]);

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    if (!user || !profile) return null;

    // Calculate level progress
    const thresholdEntries = Object.entries(LEVEL_THRESHOLDS).map(([level, minXP]) => ({ level, minXP: minXP as number }));
    const currentLevelIndex = thresholdEntries.findIndex((t) => t.level === profile.level);
    const nextLevel = thresholdEntries[currentLevelIndex + 1];
    const currentMin = thresholdEntries[currentLevelIndex]?.minXP || 0;
    const nextMin = nextLevel?.minXP || currentMin + 1000;
    const levelProgress = Math.round(
        ((profile.xp_points - currentMin) / (nextMin - currentMin)) * 100
    );

    async function handleSave() {
        setIsSaving(true);
        setSaveMessage("");

        const { error } = await db
            .from("profiles")
            .update({
                full_name: fullName.trim(),
                bio: bio.trim(),
                theme: theme, // Save theme to db for consistency across devices
                updated_at: new Date().toISOString(),
            })
            .eq("id", user!.id);

        if (error) {
            setSaveMessage("Error al guardar");
        } else {
            setSaveMessage("✓ Guardado");
            setIsEditing(false);
            refreshProfile();
        }
        setIsSaving(false);
        setTimeout(() => setSaveMessage(""), 3000);
    }

    function handleAvatarUploaded() {
        refreshProfile();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-brand-text mb-2">Mi Perfil</h1>
                {!isEditing && (
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                        ✏️ Editar
                    </Button>
                )}
            </div>

            {/* Profile Header Card */}
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 sm:p-8 shadow-card overflow-hidden relative">
                {/* Decorative background gradient */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-aurora rounded-full blur-[80px] opacity-20 pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">

                    {/* AVATAR SECTION */}
                    <div className="shrink-0 flex flex-col items-center">
                        {isEditing ? (
                            <AvatarUpload
                                userId={user.id}
                                fullName={profile.full_name}
                                avatarUrl={profile.avatar_url}
                                onUploadComplete={handleAvatarUploaded}
                            />
                        ) : (
                            <div className="p-1 rounded-full bg-gradient-to-tr from-brand-electric to-brand-accent">
                                <Avatar
                                    name={profile.full_name}
                                    imageUrl={profile.avatar_url || undefined}
                                    size="xl"
                                    className="border-[3px] border-brand-card"
                                />
                            </div>
                        )}

                        {!isEditing && (
                            <div className="mt-3">
                                <PlanBadge planType={profile.plan_type} />
                            </div>
                        )}
                    </div>

                    {/* INFO SECTION */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        {isEditing ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted mb-1 block uppercase tracking-wide">Nombre y Apellido</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-white border border-brand-border rounded-input px-4 py-2.5 text-sm text-black focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted mb-1 block uppercase tracking-wide">Sobre Mí (Bio)</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full bg-white border border-brand-border rounded-input px-4 py-2.5 text-sm text-black resize-none focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
                                        placeholder="Cuenta a la comunidad en qué te especializas, cuáles son tus metas..."
                                    />
                                    <p className="text-[10px] text-brand-muted mt-1 text-right font-mono">
                                        {bio.length}/160
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-2 border-t border-brand-border/50">
                                    <Button
                                        variant="primary"
                                        size="default"
                                        className="shadow-xl shadow-orange-500/30 hover:shadow-orange-500/45"
                                        onClick={handleSave}
                                        isLoading={isSaving}
                                    >
                                        Guardar Cambios
                                    </Button>
                                    <Button variant="ghost" size="default" onClick={() => {
                                        setFullName(profile.full_name);
                                        setBio(profile.bio || "");
                                        setIsEditing(false);
                                    }}>
                                        Cancelar
                                    </Button>
                                    {saveMessage && <span className="text-xs text-brand-success ml-auto font-medium">{saveMessage}</span>}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in flex flex-col justify-center h-full pt-1">
                                <h2 className="text-2xl font-bold text-brand-text mb-1 flex items-center justify-center sm:justify-start gap-2">
                                    {profile.full_name}
                                </h2>
                                <p className="text-sm font-mono text-brand-muted mb-3">{user.email}</p>

                                {profile.bio ? (
                                    <p className="text-sm text-brand-text-secondary leading-relaxed max-w-lg mb-4">
                                        &quot;{profile.bio}&quot;
                                    </p>
                                ) : (
                                    <p className="text-sm text-brand-muted italic mb-4">
                                        Aún no has agregado una biografía.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: "Puntos XP", value: profile.xp_points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'), emoji: "⚡" },
                    { label: "Nivel Actual", value: profile.level, emoji: "📊" },
                    { label: "Racha Activa", value: `${profile.current_streak} d`, emoji: "🔥" },
                    { label: "Racha Máx", value: `${profile.longest_streak} d`, emoji: "🏆" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-brand-card rounded-2xl border border-brand-border p-5 text-center shadow-card-sm hover:shadow-card transition-shadow flex flex-col items-center justify-center gap-1"
                    >
                        <span className="text-3xl block mb-1 drop-shadow-sm">{stat.emoji}</span>
                        <p className="text-xl font-bold font-mono text-brand-text">{stat.value}</p>
                        <div className="flex items-center justify-center">
                            <p className="text-[10px] text-brand-muted font-semibold uppercase tracking-widest">{stat.label}</p>
                            {(stat.label === "Racha Activa" || stat.label === "Racha Máx") && (
                                <GamificationTooltip content="Días consecutivos activo en la plataforma. Si un día no entrás, la racha vuelve a 0." />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Level progress */}
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-card-sm">
                <div className="flex items-end justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-bold text-brand-text uppercase tracking-wide">
                            Progreso de Nivel
                        </h3>
                        {nextLevel && (
                            <p className="text-xs text-brand-muted mt-1">
                                Faltan {(nextMin - profile.xp_points).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} XP para nivel {nextLevel.level}
                            </p>
                        )}
                    </div>
                    {nextLevel && (
                        <div className="text-right">
                            <span className="text-lg font-mono font-bold text-brand-accent">
                                {levelProgress}%
                            </span>
                        </div>
                    )}
                </div>
                <ProgressBar value={Math.min(levelProgress, 100)} color="accent" />
            </div>

            {/* Badges */}
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-card-sm">
                <div className="flex items-center gap-2 mb-5">
                    <span className="text-xl">🧠</span>
                    <h3 className="text-lg font-bold text-brand-text">Nodos Neurales</h3>
                    <GamificationTooltip content="Logros que se desbloquean automáticamente al cumplir ciertos hitos. Los grises todavía no los alcanzaste." />
                </div>
                <BadgeGridSection userId={user.id} />
            </div>

            {/* Store */}
            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-card-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-electric-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-xl">🏪</span>
                    <h3 className="text-lg font-bold text-brand-text">Tienda de Sinapsis</h3>
                </div>
                <RewardsStore />
            </div>
        </div>
    );
}

function BadgeGridSection({ userId }: { userId: string }) {
    const { badges, isLoading } = useBadges(userId);
    const earned = badges.filter((b) => b.earned).length;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Red Activada
                </p>
                <div className="px-2 py-0.5 rounded-full bg-brand-hover-bg border border-brand-border">
                    <span className="text-[10px] font-mono text-brand-text font-bold">
                        {earned} / {badges.length}
                    </span>
                </div>
            </div>
            <BadgeGrid badges={badges} isLoading={isLoading} />
        </div>
    );
}
