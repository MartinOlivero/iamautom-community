"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import type { Lesson, Module } from "@/types/database";

export default function AdminLessonsPage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = params.moduleId as string;
    const supabase = createClient();

    const [moduleData, setModuleData] = useState<Module | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [orderIndex, setOrderIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (moduleId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId]);

    async function fetchData() {
        setIsLoading(true);

        // 1. Fetch Module info
        const { data: mData, error: mError } = await supabase
            .from("modules")
            .select("*")
            .eq("id", moduleId)
            .single();

        if (mError) {
            console.error("Module not found");
            router.push("/admin/cursos");
            return;
        }
        setModuleData(mData as Module);

        // 2. Fetch Lessons
        const { data: lData } = await supabase
            .from("lessons")
            .select("*")
            .eq("module_id", moduleId)
            .order("order_index", { ascending: true });

        if (lData) setLessons(lData as Lesson[]);
        setIsLoading(false);
    }

    function openModal(less?: Lesson) {
        if (less) {
            setEditingLesson(less);
            setTitle(less.title);
            setDescription(less.description || "");
            setYoutubeUrl(less.youtube_url);
            setDurationMinutes(less.duration_minutes);
            setOrderIndex(less.order_index);
        } else {
            setEditingLesson(null);
            setTitle("");
            setDescription("");
            setYoutubeUrl("");
            setDurationMinutes(0);
            setOrderIndex(lessons.length);
        }
        setIsModalOpen(true);
    }

    async function handleSave() {
        setIsSaving(true);

        const payload = {
            module_id: moduleId,
            title,
            description: description || null,
            youtube_url: youtubeUrl,
            duration_minutes: durationMinutes,
            order_index: orderIndex,
        };

        if (editingLesson) {
            // Update
            const { error } = await supabase
                .from("lessons")
                .update(payload)
                .eq("id", editingLesson.id);
            if (!error) fetchData();
        } else {
            // Create
            const { error } = await supabase
                .from("lessons")
                .insert([payload]);
            if (!error) fetchData();
        }

        setIsSaving(false);
        setIsModalOpen(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Seguro que quieres eliminar esta lección? No se puede deshacer.")) return;

        const { error } = await supabase.from("lessons").delete().eq("id", id);
        if (!error) fetchData();
    }

    if (isLoading) {
        return <div className="text-center py-10 text-brand-muted">Cargando lecciones...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/admin/cursos" className="text-sm text-brand-muted hover:text-brand-text flex items-center gap-1">
                    <span>←</span> Volver a Módulos
                </Link>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-bold text-brand-text flex items-center gap-2">
                        <span>{moduleData?.emoji}</span>
                        {moduleData?.title}
                    </h2>
                    <p className="text-sm text-brand-muted mt-1">
                        Gestionar el contenido y orden de las lecciones
                    </p>
                </div>
                <Button onClick={() => openModal()}>+ Nueva Lección</Button>
            </div>

            {/* List */}
            {lessons.length === 0 ? (
                <div className="bg-brand-card border border-brand-border border-dashed p-10 text-center rounded-card">
                    <p className="text-brand-muted text-sm pb-4">No hay lecciones en este módulo aún.</p>
                    <Button variant="secondary" onClick={() => openModal()}>Agregar Lección</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {lessons.map((less) => (
                        <div key={less.id} className="bg-brand-card rounded-card border border-brand-border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-brand-muted font-mono text-sm px-3 border-r border-brand-border h-full flex items-center">
                                    {less.order_index}
                                </div>
                                <div className="w-16 h-10 bg-brand-hover-bg rounded overflow-hidden flex-shrink-0 relative group">
                                    <div className="absolute inset-0 flex items-center justify-center text-brand-muted">
                                        ▶
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-brand-text">{less.title}</h3>
                                    <p className="text-xs text-brand-muted mt-0.5 flex items-center gap-2">
                                        <span>⏱ {less.duration_minutes} min</span>
                                        <span className="truncate max-w-xs">{less.youtube_url}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                                <Button variant="secondary" size="sm" onClick={() => openModal(less)}>
                                    ✏️ Editar
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleDelete(less.id)}>
                                    🗑️
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLesson ? "Editar Lección" : "Nueva Lección"} size="lg">
                <div className="space-y-4">
                    <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Introducción a Zapier" />

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1">Descripción (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-brand-hover-bg border border-brand-border rounded-input px-3 py-2 text-sm text-brand-text resize-none focus:outline-none focus:border-brand-accent"
                            rows={3}
                        />
                    </div>

                    <Input label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Duración (minutos)"
                            type="number"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                        />
                        <Input
                            label="Orden (Índice)"
                            type="number"
                            value={orderIndex}
                            onChange={(e) => setOrderIndex(parseInt(e.target.value))}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button isLoading={isSaving} onClick={handleSave}>Guardar Lección</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
