"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/insforge/client";

export function AdminChallenges() {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [challenges, setChallenges] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        emoji: "🏆",
        challenge_type: "xp_gained",
        target_value: 100,
        reward_coins: 50,
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    async function fetchChallenges() {
        const { data } = await supabase
            .from("challenges")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setChallenges(data);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsCreating(true);

        const { error } = await supabase.from("challenges").insert([
            {
                ...formData,
                target_value: Number(formData.target_value),
                reward_coins: Number(formData.reward_coins),
                starts_at: new Date(formData.starts_at).toISOString(),
                ends_at: new Date(formData.ends_at).toISOString(),
            },
        ]);

        if (!error) {
            setFormData({
                title: "",
                description: "",
                emoji: "🏆",
                challenge_type: "xp_gained",
                target_value: 100,
                reward_coins: 50,
                starts_at: new Date().toISOString().split('T')[0],
                ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
            fetchChallenges();
        }
        setIsCreating(false);
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-brand-text">Gestión de Desafíos</h2>
                    <p className="text-sm text-brand-muted">Crea y administra los desafíos mensuales.</p>
                </div>
            </div>

            {/* Create Form */}
            <form onSubmit={handleSubmit} className="bg-brand-card rounded-card border border-brand-border p-6 space-y-4">
                <h3 className="font-bold text-brand-text mb-2 flex items-center gap-2">
                    <span>🆕</span> Crear Nuevo Desafío
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Título</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Maratón de Código"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Emoji</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.emoji}
                            onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Descripción</label>
                    <textarea
                        required
                        className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Define el objetivo del desafío..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Tipo de Objetivo</label>
                        <select
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.challenge_type}
                            onChange={e => setFormData({ ...formData, challenge_type: e.target.value })}
                        >
                            <option value="xp_gained">XP Acumulado</option>
                            <option value="lessons_completed">Lecciones Completadas</option>
                            <option value="posts_published">Posts Publicados</option>
                            <option value="streak_days">Días de Racha</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Valor Meta</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.target_value}
                            onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Recompensa (Sinapsis)</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.reward_coins}
                            onChange={e => setFormData({ ...formData, reward_coins: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Fecha Inicio</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.starts_at}
                            onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Fecha Fin</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                            value={formData.ends_at}
                            onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 rounded-xl transition-all shadow-glow-neon active:scale-95 disabled:opacity-50"
                >
                    {isCreating ? "Guardando..." : "CREAR DESAFÍO"}
                </button>
            </form>

            {/* List */}
            <div className="space-y-4">
                <h3 className="font-bold text-brand-text flex items-center gap-2">
                    <span>📋</span> Desafíos Existentes
                </h3>
                <div className="grid gap-3">
                    {challenges.map(c => (
                        <div key={c.id} className="bg-brand-card border border-brand-border p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{c.emoji}</span>
                                <div>
                                    <h4 className="font-bold text-brand-text">{c.title}</h4>
                                    <p className="text-xs text-brand-muted">{c.challenge_type} - Meta: {c.target_value}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-brand-accent">💎 {c.reward_coins}</div>
                                <div className={`text-[10px] uppercase font-bold ${c.is_active ? 'text-brand-success' : 'text-brand-muted'}`}>
                                    {c.is_active ? 'Activo' : 'Inactivo'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {challenges.length === 0 && <p className="text-center py-8 text-brand-muted">No hay desafíos creados.</p>}
                </div>
            </div>
        </div>
    );
}
