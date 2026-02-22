"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

/**
 * Modal overlay component with backdrop blur and smooth animation.
 * Closes on backdrop click and Escape key.
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div
                className={`
          ${sizeStyles[size]} w-full bg-brand-card rounded-card
          border border-brand-border shadow-xl
          animate-scale-in
        `}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                        <h2 className="text-lg font-semibold font-display">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-brand-muted hover:text-brand-text transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
