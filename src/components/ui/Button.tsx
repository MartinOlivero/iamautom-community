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
        "relative overflow-hidden group bg-gradient-to-r from-brand-accent to-brand-accent-hover text-white hover:text-white border-0 shadow-lg shadow-brand-accent/30 hover:shadow-brand-accent/50 hover:scale-105 active:scale-95 transition-all duration-300 before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-0 before:transition-transform before:duration-300",
    secondary:
        "bg-brand-card/50 backdrop-blur-md text-brand-text border border-white/10 hover:border-white/30 hover:bg-white/5 active:scale-[0.98] transition-all duration-300",
    ghost:
        "bg-transparent text-brand-text-secondary hover:bg-white/5 hover:text-brand-text transition-all duration-300",
    danger:
        "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 active:scale-[0.98] transition-all duration-300",
    gold:
        "relative overflow-hidden group bg-gradient-to-r from-brand-gold to-yellow-400 text-black font-bold shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-105 active:scale-95 transition-all duration-300 before:absolute before:inset-0 before:bg-white/30 before:translate-x-[-100%] hover:before:translate-x-0 before:transition-transform before:duration-300",
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
