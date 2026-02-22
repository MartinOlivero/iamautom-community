import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

/**
 * Card component with subtle border and optional hover effect.
 * Following the design system: 1px border, 12px radius, no aggressive shadows.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        { hover = false, padding = "md", className = "", children, ...props },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`
          relative overflow-hidden bg-brand-card/30 backdrop-blur-xl rounded-card border border-brand-border
          ${paddingStyles[padding]}
          ${className}
          ${hover
                        ? "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-accent/20 hover:border-brand-accent/40 hover:bg-brand-card/50 cursor-pointer group"
                        : "transition-all duration-500"}
        `}
                {...props}
            >
                {hover && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export default Card;
