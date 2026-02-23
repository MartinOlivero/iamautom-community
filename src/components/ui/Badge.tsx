import type { PlanType } from "@/types";

interface PlanBadgeProps {
    planType: PlanType;
    className?: string;
}

/**
 * Small badge that shows the user's plan level.
 * Inner Circle visually represents the "PRO" tier.
 */
export default function PlanBadge({ planType, className = "" }: PlanBadgeProps) {
    if (planType === "none") return null;

    const isInnerCircle = planType === "inner_circle" || planType === "admin";

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-[10px] font-bold font-mono uppercase tracking-widest
        rounded-pill whitespace-nowrap shadow-sm border
        ${isInnerCircle
                    ? "bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-[length:200%_auto] animate-shimmer text-[#431407] border-yellow-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    : "bg-brand-bg-2 text-brand-text-secondary border-brand-border/50"
                }
        ${className}
      `}
        >
            {isInnerCircle && "👑"}
            {planType === "admin"
                ? "Admin"
                : planType === "inner_circle"
                    ? "PRO"
                    : "Comunidad"}
        </span>
    );
}
