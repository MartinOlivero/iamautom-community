interface ProgressBarProps {
    value: number; // 0-100
    color?: "accent" | "gold" | "success";
    size?: "sm" | "md";
    showLabel?: boolean;
    className?: string;
}

const colorStyles = {
    accent: "bg-gradient-to-r from-brand-accent to-brand-accent-hover",
    gold: "bg-gradient-to-r from-brand-gold to-yellow-300",
    success: "bg-brand-success",
};

const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
};

/**
 * Animated progress bar with gradient fill.
 */
export default function ProgressBar({
    value,
    color = "accent",
    size = "md",
    showLabel = false,
    className = "",
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`
          flex-1 ${sizeStyles[size]} bg-brand-border rounded-full overflow-hidden
        `}
            >
                <div
                    className={`
            ${sizeStyles[size]} ${colorStyles[color]} rounded-full
            transition-all duration-500 ease-out
          `}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-mono text-brand-muted min-w-[3ch] text-right">
                    {Math.round(clampedValue)}%
                </span>
            )}
        </div>
    );
}
