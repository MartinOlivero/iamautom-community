import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-gradient-to-r from-brand-accent to-brand-accent-hover text-white hover:shadow-lg hover:shadow-brand-accent/25 active:scale-[0.98]",
    secondary:
        "bg-brand-card text-brand-text border border-brand-border hover:bg-brand-hover-bg active:scale-[0.98]",
    ghost:
        "bg-transparent text-brand-text-secondary hover:bg-brand-hover-bg hover:text-brand-text",
    danger:
        "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-[0.98]",
    gold:
        "bg-gradient-to-r from-brand-gold to-yellow-300 text-brand-dark font-semibold hover:shadow-lg hover:shadow-brand-gold/25 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm rounded-input",
    md: "px-5 py-2.5 text-sm rounded-input",
    lg: "px-8 py-3.5 text-base rounded-input",
};

/**
 * Reusable Button component with variant and size props.
 * Supports loading state with a spinner.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            isLoading = false,
            className = "",
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
