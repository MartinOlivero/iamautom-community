"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { LEVEL_THRESHOLDS } from "@/lib/constants";

/**
 * User profile page with stats and edit form.
 */
export default function PerfilPage() {
    const { user, profile } = useAuth();
    const supabase = createClient();

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    if (!user || !profile) return null;

    // Calculate level progress — LEVEL_THRESHOLDS is an object { level: minXP }
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

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: fullName.trim(),
                bio: bio.trim(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", user!.id);

        if (error) {
            setSaveMessage("Error al guardar");
        } else {
            setSaveMessage("✓ Guardado");
            setIsEditing(false);
        }
        setIsSaving(false);
        setTimeout(() => setSaveMessage(""), 3000);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-display font-bold text-brand-text">Mi Perfil</h1>
            </div>

            {/* Profile card */}
            <div className="bg-brand-card rounded-card border border-brand-border p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Avatar */}
                    <Avatar
                        name={profile.full_name}
                        imageUrl={profile.avatar_url || undefined}
                        size="lg"
                    />

                    {/* Info */}
                    <div className="flex-1 w-full">
                        {isEditing ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-brand-muted mb-1 block">Nombre</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-brand-hover-bg border border-brand-border rounded-input
                              px-3 py-2 text-sm text-brand-text
                              focus:outline-none focus:border-brand-accent/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-brand-muted mb-1 block">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full bg-brand-hover-bg border border-brand-border rounded-input
                              px-3 py-2 text-sm text-brand-text resize-none
                              focus:outline-none focus:border-brand-accent/50"
                                        placeholder="Contá algo sobre vos..."
                                    />
                                    <p className="text-[10px] text-brand-muted mt-0.5 text-right">
                                        {bio.length}/160
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
                                        Guardar
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-lg font-semibold text-brand-text">
                                        {profile.full_name}
                                    </h2>
                                    <PlanBadge planType={profile.plan_type} />
                                </div>
                                {profile.bio && (
                                    <p className="text-sm text-brand-text-secondary mb-2">{profile.bio}</p>
                                )}
                                <p className="text-xs text-brand-muted mb-3">{user.email}</p>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                                        ✏️ Editar perfil
                                    </Button>
                                    {saveMessage && (
                                        <span className="text-xs text-green-500">{saveMessage}</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "XP Total", value: profile.xp_points.toLocaleString(), emoji: "⚡" },
                    { label: "Nivel", value: profile.level, emoji: "📊" },
                    { label: "Racha", value: `${profile.current_streak}d`, emoji: "🔥" },
                    { label: "Mejor Racha", value: `${profile.longest_streak}d`, emoji: "🏆" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-brand-card rounded-card border border-brand-border p-4 text-center"
                    >
                        <span className="text-2xl block mb-1">{stat.emoji}</span>
                        <p className="text-lg font-semibold font-mono text-brand-text">{stat.value}</p>
                        <p className="text-[10px] text-brand-muted uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Level progress */}
            <div className="bg-brand-card rounded-card border border-brand-border p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-brand-text">
                        Progreso al siguiente nivel
                    </h3>
                    {nextLevel && (
                        <span className="text-xs text-brand-muted">
                            {nextLevel.level} ({nextMin.toLocaleString()} XP)
                        </span>
                    )}
                </div>
                <ProgressBar value={Math.min(levelProgress, 100)} color="accent" />
                <p className="text-[10px] text-brand-muted mt-2">
                    {profile.xp_points.toLocaleString()} / {nextMin.toLocaleString()} XP
                </p>
            </div>
        </div>
    );
}
