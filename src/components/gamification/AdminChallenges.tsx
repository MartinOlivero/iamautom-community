"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/insforge/client";
import { Pencil, Trash2, X, Check } from "lucide-react";

const emptyForm = {
    title: "",
    description: "",
    emoji: "🏆",
    challenge_type: "xp_gained",
    target_value: 100,
    reward_coins: 50,
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export function AdminChallenges() {
    const db = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [challenges, setChallenges] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({ ...emptyForm });

    // Edit form state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editData, setEditData] = useState<any>(null);

    useEffect(() => {
        fetchChallenges();
    }, []);

    async function fetchChallenges() {
        const { data } = await db
            .from("challenges")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setChallenges(data);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsCreating(true);

        const { error } = await db.from("challenges").insert([
            {
                ...formData,
                target_value: Number(formData.target_value),
                reward_coins: Number(formData.reward_coins),
                starts_at: new Date(formData.starts_at).toISOString(),
                ends_at: new Date(formData.ends_at).toISOString(),
            },
        ]);

        if (!error) {
            setFormData({ ...emptyForm });
            fetchChallenges();
        }
        setIsCreating(false);
    }

    function startEditing(challenge: typeof challenges[0]) {
        setEditingId(challenge.id);
        setEditData({
            title: challenge.title,
            description: challenge.description || "",
            emoji: challenge.emoji,
            challenge_type: challenge.challenge_type,
            target_value: challenge.target_value,
            reward_coins: challenge.reward_coins,
            is_active: challenge.is_active,
            starts_at: new Date(challenge.starts_at).toISOString().split('T')[0],
            ends_at: new Date(challenge.ends_at).toISOString().split('T')[0],
        });
    }

    async function handleSaveEdit() {
        if (!editingId || !editData) return;

        const { error } = await db
            .from("challenges")
            .update({
                title: editData.title,
                description: editData.description,
                emoji: editData.emoji,
                challenge_type: editData.challenge_type,
                target_value: Number(editData.target_value),
                reward_coins: Number(editData.reward_coins),
                is_active: editData.is_active,
                starts_at: new Date(editData.starts_at).toISOString(),
                ends_at: new Date(editData.ends_at).toISOString(),
            })
            .eq("id", editingId);

        if (!error) {
            setEditingId(null);
            setEditData(null);
            fetchChallenges();
        }
    }

    async function handleDelete(id: string) {
        const { error } = await db.from("challenges").delete().eq("id", id);
        if (!error) {
            setDeletingId(null);
            fetchChallenges();
        }
    }

    const inputClass = "w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-none focus:border-brand-accent transition-colors";

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-brand-text">Gestion de Desafios</h2>
                    <p className="text-sm text-brand-muted">Crea y administra los desafios mensuales.</p>
                </div>
            </div>

            {/* Create Form */}
            <form onSubmit={handleSubmit} className="bg-brand-card rounded-card border border-brand-border p-6 space-y-4">
                <h3 className="font-bold text-brand-text mb-2 flex items-center gap-2">
                    <span>🆕</span> Crear Nuevo Desafio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Titulo</label>
                        <input
                            type="text"
                            required
                            className={inputClass}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Maraton de Codigo"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Emoji</label>
                        <input
                            type="text"
                            required
                            className={inputClass}
                            value={formData.emoji}
                            onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-muted uppercase">Descripcion</label>
                    <textarea
                        required
                        className={inputClass}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Define el objetivo del desafio..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Tipo de Objetivo</label>
                        <select
                            className={inputClass}
                            value={formData.challenge_type}
                            onChange={e => setFormData({ ...formData, challenge_type: e.target.value })}
                        >
                            <option value="xp_gained">XP Acumulado</option>
                            <option value="lessons_completed">Lecciones Completadas</option>
                            <option value="posts_published">Posts Publicados</option>
                            <option value="streak_days">Dias de Racha</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Valor Meta</label>
                        <input
                            type="number"
                            required
                            className={inputClass}
                            value={formData.target_value}
                            onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Recompensa (Sinapsis)</label>
                        <input
                            type="number"
                            required
                            className={inputClass}
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
                            className={inputClass}
                            value={formData.starts_at}
                            onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-muted uppercase">Fecha Fin</label>
                        <input
                            type="date"
                            required
                            className={inputClass}
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
                    {isCreating ? "Guardando..." : "CREAR DESAFIO"}
                </button>
            </form>

            {/* List */}
            <div className="space-y-4">
                <h3 className="font-bold text-brand-text flex items-center gap-2">
                    <span>📋</span> Desafios Existentes
                </h3>
                <div className="grid gap-3">
                    {challenges.map(c => {
                        const isEditing = editingId === c.id;
                        const isConfirmingDelete = deletingId === c.id;
                        const isExpired = new Date(c.ends_at) < new Date();

                        if (isEditing && editData) {
                            return (
                                <div key={c.id} className="bg-brand-card border-2 border-brand-accent/40 p-5 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-brand-accent uppercase tracking-wider">Editando desafio</h4>
                                        <button onClick={() => { setEditingId(null); setEditData(null); }} className="text-brand-muted hover:text-brand-text transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Titulo</label>
                                            <input type="text" className={inputClass} value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Emoji</label>
                                            <input type="text" className={inputClass} value={editData.emoji} onChange={e => setEditData({ ...editData, emoji: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-brand-muted uppercase">Descripcion</label>
                                        <textarea className={inputClass} value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Tipo</label>
                                            <select className={inputClass} value={editData.challenge_type} onChange={e => setEditData({ ...editData, challenge_type: e.target.value })}>
                                                <option value="xp_gained">XP Acumulado</option>
                                                <option value="lessons_completed">Lecciones Completadas</option>
                                                <option value="posts_published">Posts Publicados</option>
                                                <option value="streak_days">Dias de Racha</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Meta</label>
                                            <input type="number" className={inputClass} value={editData.target_value} onChange={e => setEditData({ ...editData, target_value: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Recompensa</label>
                                            <input type="number" className={inputClass} value={editData.reward_coins} onChange={e => setEditData({ ...editData, reward_coins: Number(e.target.value) })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Fecha Inicio</label>
                                            <input type="date" className={inputClass} value={editData.starts_at} onChange={e => setEditData({ ...editData, starts_at: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Fecha Fin</label>
                                            <input type="date" className={inputClass} value={editData.ends_at} onChange={e => setEditData({ ...editData, ends_at: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-brand-muted uppercase">Estado</label>
                                            <select className={inputClass} value={editData.is_active ? "true" : "false"} onChange={e => setEditData({ ...editData, is_active: e.target.value === "true" })}>
                                                <option value="true">Activo</option>
                                                <option value="false">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveEdit}
                                        className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> GUARDAR CAMBIOS
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div key={c.id} className={`bg-brand-card border border-brand-border p-4 rounded-xl flex items-center justify-between ${isExpired ? 'opacity-60' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{c.emoji}</span>
                                    <div>
                                        <h4 className="font-bold text-brand-text">{c.title}</h4>
                                        <p className="text-xs text-brand-muted">
                                            {c.challenge_type} - Meta: {c.target_value}
                                            <span className="ml-2 text-brand-muted/60">
                                                ({new Date(c.starts_at).toLocaleDateString()} - {new Date(c.ends_at).toLocaleDateString()})
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-2">
                                        <div className="text-xs font-bold text-brand-accent">⚡ {c.reward_coins}</div>
                                        <div className={`text-[10px] uppercase font-bold ${c.is_active && !isExpired ? 'text-brand-success' : isExpired ? 'text-yellow-500' : 'text-brand-muted'}`}>
                                            {isExpired ? 'Expirado' : c.is_active ? 'Activo' : 'Inactivo'}
                                        </div>
                                    </div>

                                    {isConfirmingDelete ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-red-400 font-medium">Eliminar?</span>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                className="p-1.5 rounded-lg bg-white/5 text-brand-muted hover:bg-white/10 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEditing(c)}
                                                className="p-2 rounded-lg text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(c.id)}
                                                className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {challenges.length === 0 && <p className="text-center py-8 text-brand-muted">No hay desafios creados.</p>}
                </div>
            </div>
        </div>
    );
}
