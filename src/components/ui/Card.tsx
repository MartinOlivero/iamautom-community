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
          bg-brand-card rounded-card border border-brand-border
          ${hover ? "transition-shadow duration-200 hover:shadow-md hover:shadow-black/5 cursor-pointer" : ""}
          ${paddingStyles[padding]}
          ${className}
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
