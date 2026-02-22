/* eslint-disable @next/next/no-img-element */
interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
};

/**
 * Generate a deterministic color from a name string.
 * Produces warm, branded colors that look good on dark backgrounds.
 */
function getColorFromName(name: string): string {
    const colors = [
        "#FF4D00", "#FFB800", "#00C853", "#2979FF",
        "#FF6D33", "#D500F9", "#00BFA5", "#FF1744",
        "#651FFF", "#F50057", "#00B8D4", "#76FF03",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Get initials from a full name (up to 2 characters).
 */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((word) => word[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/**
 * Avatar component with generated initials and color from name.
 * Shows an image if available, otherwise initials on a colored background.
 */
export default function Avatar({
    name,
    imageUrl,
    size = "md",
    className = "",
}: AvatarProps) {
    const initials = getInitials(name || "?");
    const bgColor = getColorFromName(name || "default");

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`
          ${sizeStyles[size]} rounded-full object-cover
          border-2 border-brand-border
          ${className}
        `}
            />
        );
    }

    return (
        <div
            className={`
        ${sizeStyles[size]} rounded-full flex items-center justify-center
        font-semibold text-white select-none shrink-0
        ${className}
      `}
            style={{ backgroundColor: bgColor }}
            title={name}
        >
            {initials}
        </div>
    );
}
