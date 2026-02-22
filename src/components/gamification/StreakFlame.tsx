"use client";

interface StreakFlameProps {
    streak: number;
    size?: "sm" | "md" | "lg";
}

/**
 * Animated flame icon with streak counter.
 */
export default function StreakFlame({ streak, size = "md" }: StreakFlameProps) {
    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-xl",
    };

    const isActive = streak > 0;

    return (
        <span
            className={`inline-flex items-center gap-1 ${sizeClasses[size]}
                 ${isActive ? "animate-pulse" : "opacity-40"}`}
            title={`Racha: ${streak} día${streak !== 1 ? "s" : ""}`}
        >
            <span className={isActive ? "" : "grayscale"}>🔥</span>
            <span
                className={`font-mono font-semibold text-[0.75em]
                   ${isActive ? "text-orange-400" : "text-brand-muted"}`}
            >
                {streak}
            </span>
        </span>
    );
}
