"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import type { Module, TierRequired } from "@/types/database";

export default function AdminCursosPage() {
    const supabase = createClient();
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [emoji, setEmoji] = useState("📚");
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [orderIndex, setOrderIndex] = useState(0);
    const [tierRequired, setTierRequired] = useState<TierRequired>("member");
    const [isPublished, setIsPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchModules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchModules() {
        setIsLoading(true);
        const { data } = await supabase
            .from("modules")
            .select("*")
            .order("order_index", { ascending: true });

        if (data) setModules(data as Module[]);
        setIsLoading(false);
    }

    function openModal(mod?: Module) {
        if (mod) {
            setEditingModule(mod);
            setTitle(mod.title);
            setDescription(mod.description);
            setEmoji(mod.emoji);
            setCoverImageUrl(mod.cover_image_url || null);
            setOrderIndex(mod.order_index);
            setTierRequired(mod.tier_required);
            setIsPublished(mod.is_published);
        } else {
            setEditingModule(null);
            setTitle("");
            setDescription("");
            setEmoji("📚");
            setCoverImageUrl(null);
            setOrderIndex(modules.length);
            setTierRequired("member");
            setIsPublished(false);
        }
        setIsModalOpen(true);
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `module-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("module_covers")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("module_covers")
                .getPublicUrl(filePath);

            setCoverImageUrl(publicUrl);
        } catch (error: unknown) {
            console.error("Error uploading cover:", error);
            alert("Error al subir imagen: " + (error as Error).message);
        } finally {
            setIsUploading(false);
        }
    }

    async function handleSave() {
        setIsSaving(true);

        const payload = {
            title,
            description,
            emoji,
            cover_image_url: coverImageUrl,
            order_index: orderIndex,
            tier_required: tierRequired,
            is_published: isPublished,
        };

        if (editingModule) {
            // Update
            const { error } = await supabase
                .from("modules")
                .update(payload)
                .eq("id", editingModule.id);
            if (!error) fetchModules();
        } else {
            // Create
            const { error } = await supabase
                .from("modules")
                .insert([payload]);
            if (!error) fetchModules();
        }

        setIsSaving(false);
        setIsModalOpen(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Seguro que quieres eliminar este módulo? (También eliminará las lecciones)")) return;

        const { error } = await supabase.from("modules").delete().eq("id", id);
        if (!error) fetchModules();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-bold text-brand-text">Gestión de Cursos</h2>
                    <p className="text-sm text-brand-muted mt-1">
                        Crea, edita y organiza los módulos de la plataforma
                    </p>
                </div>
                <Button onClick={() => openModal()}>+ Nuevo Módulo</Button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-10 text-brand-muted">Cargando módulos...</div>
            ) : modules.length === 0 ? (
                <div className="bg-brand-card border border-brand-border border-dashed p-10 text-center rounded-card">
                    <p className="text-brand-muted text-sm pb-4">Aún no tienes módulos creados.</p>
                    <Button variant="secondary" onClick={() => openModal()}>Crear el primero</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {modules.map((mod) => (
                        <div key={mod.id} className="bg-brand-card rounded-card border border-brand-border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {mod.cover_image_url ? (
                                    <div className="w-12 h-12 rounded-xl border border-brand-border overflow-hidden shrink-0 bg-brand-bg-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={mod.cover_image_url} alt={mod.title} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="text-3xl bg-brand-hover-bg w-12 h-12 rounded-xl flex items-center justify-center border border-brand-accent/20 shrink-0">
                                        {mod.emoji}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-brand-text">{mod.title}</h3>
                                        {!mod.is_published && (
                                            <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-pill font-medium uppercase tracking-wider">Borrador</span>
                                        )}
                                        {mod.tier_required === "inner_circle" && (
                                            <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-pill font-medium uppercase tracking-wider">VIP</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-brand-muted mt-1 max-w-xl truncate">
                                        {mod.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                                <div className="text-xs text-brand-muted px-3 border-r border-brand-border hidden md:block">
                                    Orden: {mod.order_index}
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => openModal(mod)}>
                                    ✏️ Editar
                                </Button>
                                <Link href={`/admin/cursos/${mod.id}`}>
                                    <Button variant="ghost" size="sm" className="bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 border border-brand-accent/20">
                                        📚 Lecciones
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleDelete(mod.id)}>
                                    🗑️
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingModule ? "Editar Módulo" : "Nuevo Módulo"} size="lg">
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Fundamentos de IamAutom" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1 flex justify-between">
                            Descripción
                        </label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Describe el contenido de este módulo..."
                        />
                    </div>

                    {/* Cover Upload */}
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                            Imagen de Portada (Opcional)
                        </label>
                        <div className="flex items-center gap-4">
                            {coverImageUrl ? (
                                <div className="w-24 h-16 rounded-lg border border-brand-border bg-brand-bg-2 overflow-hidden shrink-0 relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setCoverImageUrl(null)}
                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-16 rounded-lg border-2 border-dashed border-brand-border bg-brand-bg-2 flex items-center justify-center text-brand-muted shrink-0">
                                    <ImageIcon size={20} className="opacity-50" />
                                </div>
                            )}

                            <div className="flex-1">
                                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-bg-2 border border-brand-border rounded-xl text-brand-text-secondary hover:text-brand-text hover:border-brand-accent/50 transition-all text-sm font-medium cursor-pointer w-fit">
                                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {isUploading ? "Subiendo..." : "Subir Imagen"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1">Nivel de Acceso</label>
                        <select
                            value={tierRequired}
                            onChange={(e) => setTierRequired(e.target.value as TierRequired)}
                            className="w-full px-4 py-2.5 rounded-input bg-white dark:bg-black/20 border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent transition-all"
                        >
                            <option value="member">Member (Todos)</option>
                            <option value="inner_circle">Inner Circle (Solo VIP)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="w-4 h-4 accent-brand-accent bg-brand-card border-brand-border rounded"
                        />
                        <label htmlFor="isPublished" className="text-sm text-brand-text cursor-pointer">
                            Publicar (Visible para usuarios)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button isLoading={isSaving} onClick={handleSave}>Guardar Módulo</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
