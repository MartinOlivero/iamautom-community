import type { PlanType } from "@/types";

interface PlanBadgeProps {
    planType: PlanType;
    className?: string;
}

/**
 * Small badge that shows the user's plan level.
 * Inner Circle gets the golden badge. Member gets a neutral one.
 */
export default function PlanBadge({ planType, className = "" }: PlanBadgeProps) {
    if (planType === "none") return null;

    const isInnerCircle = planType === "inner_circle" || planType === "admin";

    return (
        <span
            className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-[10px] font-semibold font-mono uppercase tracking-wider
        rounded-pill whitespace-nowrap
        ${isInnerCircle
                    ? "bg-gradient-to-r from-brand-gold to-yellow-300 text-brand-dark"
                    : "bg-brand-hover-bg text-brand-text-secondary border border-brand-border"
                }
        ${className}
      `}
        >
            {isInnerCircle && "👑 "}
            {planType === "admin"
                ? "Admin"
                : planType === "inner_circle"
                    ? "Inner Circle"
                    : "Member"}
        </span>
    );
}
