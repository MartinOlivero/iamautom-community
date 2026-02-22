import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * Styled input component with optional label and error message.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-brand-text"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-3 rounded-input
                    bg-brand-card /30 backdrop-blur-sm border border-brand-border
                text-brand-text placeholder:text-brand-muted
                focus:outline-none focus:ring-2 focus:ring-brand-accent/40 focus:border-brand-accent focus:bg-brand-card/60
                transition-all duration-300 hover:border-brand-accent/30 shadow-inner
                ${error ? "border-red-400 focus:ring-red-400/30 focus:border-red-400" : ""}
                ${className}
          `}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
