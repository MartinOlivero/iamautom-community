"use client";
export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useModules, type ModuleWithProgress } from "@/hooks/useModules";
import { useRefreshOnTabReturn } from "@/hooks/useVisibilityRefresh";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/insforge/client";
import ModuleCard from "@/components/courses/ModuleCard";
import SortableModuleCard from "@/components/courses/SortableModuleCard";
import Spinner from "@/components/ui/Spinner";

/**
 * Courses page — grid of available modules with progress tracking.
 * Admins can drag-and-drop modules to reorder them.
 */
export default function CursosPage() {
    const { modules, isLoading, isInTrialPeriod, trialEndsAt, refresh } = useModules();
    useRefreshOnTabReturn(refresh);
    const { profile } = useAuth();
    const router = useRouter();
    const isAdmin = profile?.role === "admin";

    const [localModules, setLocalModules] = useState<ModuleWithProgress[] | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [unlockingId, setUnlockingId] = useState<string | null>(null);
    const [unlockMessage, setUnlockMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleUnlockModule = async (moduleId: string) => {
        if (!profile?.id) return;
        setUnlockingId(moduleId);
        try {
            const db = createClient();
            const { data } = await db.rpc('unlock_module', {
                p_user_id: profile.id,
                p_module_id: moduleId
            });
            if (data?.success) {
                setUnlockMessage({ text: 'Modulo desbloqueado!', type: 'success' });
                await refresh();
            } else {
                setUnlockMessage({ text: data?.error || 'Error al desbloquear', type: 'error' });
            }
        } catch {
            setUnlockMessage({ text: 'Error al desbloquear el modulo', type: 'error' });
        } finally {
            setUnlockingId(null);
            setTimeout(() => setUnlockMessage(null), 4000);
        }
    };

    // Use localModules during drag operations, otherwise use hook data
    const displayModules = localModules ?? modules;

    // Require 8px movement before starting drag to avoid accidental drags on click
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const currentList = localModules ?? modules;
            const oldIndex = currentList.findIndex((m) => m.id === active.id);
            const newIndex = currentList.findIndex((m) => m.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;

            const reordered = arrayMove(currentList, oldIndex, newIndex);
            setLocalModules(reordered);

            // Persist new order to database
            setIsSaving(true);
            try {
                const db = createClient();
                const updates = reordered.map((m, i) => ({
                    id: m.id,
                    order_index: i,
                }));

                // Update each module's order_index
                await Promise.all(
                    updates.map(({ id, order_index }) =>
                        db
                            .from("modules")
                            .update({ order_index })
                            .eq("id", id)
                    )
                );

                // Refresh from server to confirm
                await refresh();
                setLocalModules(null);
            } catch (err) {
                console.error("Error saving module order:", err);
                // Revert on error
                setLocalModules(null);
            } finally {
                setIsSaving(false);
            }
        },
        [modules, localModules, refresh]
    );

    const renderGrid = () => {
        if (displayModules.length === 0) {
            if (isLoading) {
                return (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                );
            }
            return (
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-brand-muted text-sm">
                        Los cursos están siendo preparados. ¡Pronto habrá contenido!
                    </p>
                </div>
            );
        }

        // Admin: drag-and-drop grid
        if (isAdmin) {
            return (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={displayModules.map((m) => m.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {displayModules.map((mod) => {
                                const locked = isInTrialPeriod && !mod.available_during_trial;
                                return (
                                    <SortableModuleCard
                                        key={mod.id}
                                        module={mod}
                                        isLocked={locked}
                                        trialEndsAt={trialEndsAt}
                                        onClick={() => router.push(`/app/cursos/${mod.id}`)}
                                    />
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            );
        }

        // Regular users: static grid
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayModules.map((mod) => {
                    const locked = isInTrialPeriod && !mod.available_during_trial;
                    return (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            isLocked={locked}
                            trialEndsAt={trialEndsAt}
                            onUnlock={handleUnlockModule}
                            isUnlocking={unlockingId === mod.id}
                            onClick={() => router.push(`/app/cursos/${mod.id}`)}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-display font-bold text-brand-text">Cursos</h1>
                    <p className="text-sm text-brand-muted mt-1">
                        Módulos paso a paso con video, recursos y seguimiento de progreso
                    </p>
                </div>
                {isSaving && (
                    <div className="flex items-center gap-2 text-sm text-brand-muted">
                        <Spinner size="sm" />
                        <span>Guardando orden…</span>
                    </div>
                )}
            </div>

            {/* Unlock feedback message */}
            {unlockMessage && (
                <div className={`p-3 rounded-xl text-sm font-bold text-center border ${
                    unlockMessage.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-500'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    {unlockMessage.text}
                </div>
            )}

            {/* Module grid */}
            {renderGrid()}
        </div>
    );
}
