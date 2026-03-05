"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ModuleCard from "./ModuleCard";
import type { ModuleWithProgress } from "@/hooks/useModules";

interface SortableModuleCardProps {
    module: ModuleWithProgress;
    isLocked: boolean;
    trialEndsAt?: Date | null;
    onClick: () => void;
}

export default function SortableModuleCard({
    module,
    isLocked,
    trialEndsAt,
    onClick,
}: SortableModuleCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

    // Only apply transform/transition when actively dragging or displaced
    // Avoids creating a stacking context that breaks group-hover + backdrop-blur
    const hasTransform = transform && (transform.x !== 0 || transform.y !== 0 || transform.scaleX !== 1 || transform.scaleY !== 1);
    const style: React.CSSProperties | undefined = hasTransform
        ? { transform: CSS.Transform.toString(transform), transition }
        : transition
            ? { transition }
            : undefined;

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <ModuleCard
                module={module}
                isLocked={isLocked}
                trialEndsAt={trialEndsAt}
                onClick={onClick}
                isDragging={isDragging}
                dragHandleProps={{ attributes, listeners }}
            />
        </div>
    );
}
