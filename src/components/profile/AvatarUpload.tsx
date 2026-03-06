"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/insforge/client";
import Avatar from "@/components/ui/Avatar";
interface AvatarUploadProps {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    onUploadComplete: (newUrl: string) => void;
}

export default function AvatarUpload({ userId, fullName, avatarUrl, onUploadComplete }: AvatarUploadProps) {
    const db = createClient();
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Solo puedes subir imágenes.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg("La imagen no debe superar los 5MB.");
            return;
        }

        setIsUploading(true);
        setErrorMsg("");

        try {
            // Generate a safe unique filename avoiding cache issues
            const fileExt = file.name.split(".").pop();
            const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

            // Upload to 'avatars' bucket
            const { data: uploadData, error: uploadError } = await db.storage
                .from("avatars")
                .upload(fileName, file);

            if (uploadError) throw uploadError;
            if (!uploadData?.url) throw new Error("No se pudo obtener la URL del avatar");

            const publicUrl = uploadData.url;

            // Update user profile in database
            const { error: updateError } = await db
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", userId);

            if (updateError) throw updateError;

            // Callback to update parent state
            onUploadComplete(publicUrl);
        } catch (err: unknown) {
            console.error("Avatar upload error:", err);
            setErrorMsg("Hubo un error al subir la foto.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input
            }
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                <Avatar name={fullName} imageUrl={avatarUrl || undefined} size="xl" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">Cambiar</span>
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <span className="animate-spin text-white">⏳</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept="image/*"
                className="hidden"
            />

            {errorMsg && <p className="text-red-500 text-xs mt-1 text-center w-full">{errorMsg}</p>}
        </div>
    );
}
