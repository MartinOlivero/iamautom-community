"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ui/ProgressBar";
import type { ModuleWithProgress } from "@/hooks/useModules";
import { useAuth } from "@/components/auth/AuthProvider";
import { MoreHorizontal, Edit, LayoutList, Share2, Lock, GripVertical, Zap } from "lucide-react";

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").trim();
}

interface ModuleCardProps {
    module: ModuleWithProgress;
    onClick?: () => void;
    isLocked?: boolean;
    trialEndsAt?: Date | null;
    onUnlock?: (moduleId: string) => void;
    isUnlocking?: boolean;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    dragHandleProps?: {
        attributes: any;
        listeners: any;
    };
    isDragging?: boolean;
}

/**
 * Card displaying a course module with emoji, title, progress, and tier indicator.
 * Includes an admin overlay if the current user has an 'admin' role.
 */
export default function ModuleCard({ module, onClick, isLocked = false, trialEndsAt, onUnlock, isUnlocking, dragHandleProps, isDragging }: ModuleCardProps) {
    const router = useRouter();
    const { profile } = useAuth();
    const isAdmin = profile?.role === "admin";

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const progress =
        module.lesson_count > 0
            ? Math.round((module.completed_count / module.lesson_count) * 100)
            : 0;

    const isCompleted = progress === 100;
    const isInnerCircle = module.tier_required === "inner_circle";

    // Calculate days remaining until trial ends
    const daysRemaining = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const needsSynapsisUnlock = module.unlock_cost !== null && !module.is_unlocked && !isAdmin;

    // Detect click outside menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    };

    const handleEditModule = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        // If we want to open the modal, we can route to /admin/cursos with a query param, 
        // or just plain /admin/cursos for now since the main course info is handled there.
        router.push("/admin/cursos");
    };

    const handleManageLessons = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        router.push(`/admin/cursos/${module.id}`);
    };

    return (
        <div
            className={`w-full h-full flex flex-col text-left glass-hover rounded-card border overflow-visible
                 transition-all hover:border-primary/30 hover:-translate-y-1 relative group
                 ${isDragging ? "opacity-50 shadow-2xl" : ""}`}
        >
            {/* Drag Handle */}
            {dragHandleProps && (
                <div className="absolute top-2 left-2 z-20">
                    <button
                        {...dragHandleProps.attributes}
                        {...(dragHandleProps.listeners ?? {})}
                        className="p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-white
                            backdrop-blur-sm opacity-0 group-hover:opacity-100
                            cursor-grab active:cursor-grabbing transition-all"
                        title="Arrastrar para reordenar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={18} />
                    </button>
                </div>
            )}

            {/* Admin Menu Toggle */}
            {isAdmin && (
                <div className="absolute top-2 right-2 z-20" ref={menuRef}>
                    <button
                        onClick={toggleMenu}
                        className={`p-1.5 rounded-full transition-colors ${isMenuOpen
                            ? "bg-black/60 text-white backdrop-blur-md"
                            : "bg-black/40 text-white/80 hover:bg-black/80 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100"
                            }`}
                        title="Opciones de Administrador"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {/* Admin Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-full mt-1 right-0 w-48 bg-[#151921]/95 text-white/90 border border-brand-border/60 rounded-xl shadow-xl py-1 z-30 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={handleEditModule}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 hover:text-brand-accent transition-colors"
                            >
                                <Edit size={16} /> <span>Editar Curso</span>
                            </button>
                            <button
                                onClick={handleManageLessons}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 hover:text-brand-accent transition-colors"
                            >
                                <LayoutList size={16} /> <span>Lecciones</span>
                            </button>
                            {/* Optionals, visually matching the reference but inactive/stubbed */}
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition-colors text-brand-muted cursor-not-allowed"
                                title="Próximamente"
                            >
                                <Share2 size={16} /> <span>Compartir (Pronto)</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Lock Overlay - trial period: only covers the image area */}
            {isLocked && !needsSynapsisUnlock && module.cover_image_url && (
                <div className="absolute top-0 left-0 right-0 h-40 md:h-48 z-10 rounded-t-card flex items-center justify-center pointer-events-none"
                     style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)" }}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Lock size={22} className="text-white/80" />
                        </div>
                        <p className="text-sm font-semibold text-white/90">
                            Disponible en <span className="text-brand-accent font-bold">{daysRemaining} {daysRemaining === 1 ? "día" : "días"}</span>
                        </p>
                    </div>
                </div>
            )}
            {isLocked && !needsSynapsisUnlock && !module.cover_image_url && (
                <div className="absolute inset-0 z-10 rounded-card flex flex-col items-center justify-center text-center pointer-events-auto"
                     style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(15,20,30,0.95) 60%)" }}>
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                        <Lock size={24} className="text-white/70" />
                    </div>
                    <p className="text-lg font-bold text-white mb-1">Contenido bloqueado</p>
                    <p className="text-base text-white/70">
                        Disponible en <span className="text-brand-accent font-bold text-lg">{daysRemaining} {daysRemaining === 1 ? "día" : "días"}</span>
                    </p>
                </div>
            )}


            {/* Clickable Card Body */}
            <div onClick={isLocked ? undefined : onClick} className={`w-full h-full flex flex-col overflow-hidden rounded-card ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}>
                {/* Cover Image Area */}
                {module.cover_image_url && (
                    <div className="w-full h-40 md:h-48 relative bg-brand-bg-2 overflow-hidden border-b border-brand-border shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={module.cover_image_url}
                            alt={module.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-3 left-4 bg-brand-card/90 backdrop-blur-md rounded-xl p-2.5 shadow-sm border border-brand-border/50">
                            <span className="text-3xl leading-none block">{module.emoji}</span>
                        </div>
                    </div>
                )}

                <div className="p-6 flex flex-col flex-1 h-full">
                    {/* Header Info */}
                    <div className={`flex items-start justify-between mb-4 ${module.cover_image_url ? 'justify-end' : ''}`}>
                        {!module.cover_image_url && (
                            <span className="text-4xl group-hover:scale-110 transition-transform">
                                {module.emoji}
                            </span>
                        )}

                        <div className="flex items-center gap-2 flex-wrap justify-end relative z-10">
                            {isInnerCircle && (
                                <span className="text-xs font-semibold uppercase tracking-wider
                                      bg-gradient-gold text-brand-dark px-2.5 py-0.5 rounded-pill shrink-0">
                                    VIP
                                </span>
                            )}

                            {isCompleted && (
                                <span className="text-xs font-semibold uppercase tracking-wider
                                      bg-green-500/10 text-green-500 px-2.5 py-0.5 rounded-pill shrink-0">
                                    ✓ Completado
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title & description */}
                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 transition-colors ${isLocked ? "text-brand-text" : "text-brand-text group-hover:text-brand-accent"}`}>
                        {module.title}
                    </h3>
                    <p className={`text-sm text-brand-muted line-clamp-3 mb-6 flex-1 ${isLocked && !needsSynapsisUnlock ? "blur-[3px] select-none" : ""}`}>
                        {stripHtml(module.description)}
                    </p>

                    {/* Progress or Unlock CTA */}
                    <div className="space-y-2 mt-auto">
                        {needsSynapsisUnlock ? (
                            <div className="flex flex-col gap-2">
                                {onUnlock && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUnlock(module.id); }}
                                        disabled={isUnlocking}
                                        className="w-full py-2.5 bg-brand-electric-blue/15 hover:bg-brand-electric-blue/25 border border-brand-electric-blue/30 text-brand-electric-blue rounded-xl text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isUnlocking ? '...' : (
                                            <>
                                                <Zap size={14} />
                                                DESBLOQUEAR POR ⚡ {module.unlock_cost}
                                            </>
                                        )}
                                    </button>
                                )}
                                <p className="text-[10px] text-brand-muted text-center">
                                    {module.lesson_count} lecciones disponibles al desbloquear
                                </p>
                            </div>
                        ) : (
                            <>
                                <ProgressBar
                                    value={progress}
                                    color={isCompleted ? "success" : "accent"}
                                    size="md"
                                    showLabel={false}
                                />
                                <div className="flex items-center justify-between text-xs text-brand-muted font-medium">
                                    <span>
                                        {module.completed_count}/{module.lesson_count} lecciones
                                    </span>
                                    <span className="font-mono">{progress}%</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
