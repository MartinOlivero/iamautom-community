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
 * Card component with glassmorphism effect and optional hover effect.
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
          relative overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg
          ${paddingStyles[padding]}
          ${className}
          ${hover
                ? "transition-all duration-300 hover:bg-card/80 hover:border-primary/30 hover:shadow-primary/10 hover:shadow-xl cursor-pointer group"
                : "transition-all duration-300"}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export default Card;
