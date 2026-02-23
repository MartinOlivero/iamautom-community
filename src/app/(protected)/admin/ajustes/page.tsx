"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Image as ImageIcon, Upload, Loader2, Save } from "lucide-react";
import Input from "@/components/ui/Input";

export default function AjustesPage() {
    const { settings, refreshSettings } = useSiteSettings();
    const [title, setTitle] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Populate initial state
    useEffect(() => {
        if (settings) {
            setTitle(settings.title);
            setLogoUrl(settings.logo_url);
        }
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings?.id) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from("site_settings")
                .update({ title, logo_url: logoUrl })
                .eq("id", settings.id);

            if (error) throw error;

            setMessage({ type: "success", text: "Ajustes guardados correctamente." });
            await refreshSettings();
        } catch (error: unknown) {
            console.error("Error saving settings:", error);
            setMessage({ type: "error", text: (error as Error).message || "Error al guardar los ajustes." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setMessage(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            // Upload the image
            const { error: uploadError } = await supabase.storage
                .from("site_assets")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from("site_assets")
                .getPublicUrl(filePath);

            setLogoUrl(publicUrl);
            setMessage({ type: "success", text: "Logo subido correctamente. Haz clic en 'Guardar' para aplicar." });

        } catch (error: unknown) {
            console.error("Error uploading logo:", error);
            setMessage({ type: "error", text: (error as Error).message || "Error al subir el logo." });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-brand-text mb-2">Ajustes Globales</h2>
                <p className="text-brand-muted text-sm">
                    Configura la identidad y los ajustes principales de tu plataforma.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm ${message.type === "success" ? "bg-brand-success/10 text-brand-success" : "bg-red-500/10 text-red-500"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Info Card */}
                <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Identidad de Marca</h3>

                    <div className="space-y-5">
                        {/* Title Input */}
                        <div>
                            <Input
                                label="Nombre de la plataforma"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: IamAutom LAB"
                                required
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                                Logo de la plataforma
                            </label>
                            <div className="flex items-start gap-6">
                                {/* Logo Preview */}
                                <div className="shrink-0">
                                    {logoUrl ? (
                                        <div className="w-24 h-24 rounded-2xl border border-brand-border bg-brand-bg-2 flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-brand-border bg-brand-bg-2 flex flex-col items-center justify-center text-brand-muted">
                                            <ImageIcon size={24} className="mb-1 opacity-50" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">Sin Logo</span>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Action */}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-bg-2 border border-brand-border rounded-xl text-brand-text-secondary hover:text-brand-text hover:border-brand-accent/50 transition-all text-sm font-medium disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        {isUploading ? "Subiendo..." : "Subir nuevo logo"}
                                    </button>
                                    <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                                        Recomendamos utilizar una imagen PNG o SVG transparente con dimensiones cuadradas (ej. 512x512px) y un tamaño inferior a 2MB para asegurar una carga rápida.
                                    </p>
                                    {logoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setLogoUrl(null)}
                                            className="text-xs text-red-500 font-medium mt-2 hover:underline"
                                        >
                                            Eliminar logo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-medium rounded-xl transition-all shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Guardar Ajustes
                    </button>
                </div>
            </form>
        </div>
    );
}
