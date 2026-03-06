"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
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
    const mouseDownOnOverlay = useRef(false);

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

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4
                 bg-black/60 backdrop-blur-sm animate-fade-in"
            onMouseDown={(e) => {
                if (e.target === overlayRef.current) {
                    mouseDownOnOverlay.current = true;
                }
            }}
            onMouseUp={(e) => {
                if (e.target === overlayRef.current && mouseDownOnOverlay.current) {
                    onClose();
                }
                mouseDownOnOverlay.current = false;
            }}
        >
            <div
                className={`
          ${sizeStyles[size]} w-full bg-brand-card rounded-card
          border border-brand-border shadow-2xl
          animate-scale-in flex flex-col max-h-[90vh]
        `}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
                        <h2 className="text-lg font-semibold font-display">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-brand-muted hover:text-brand-text transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>,
        document.body
    );
}
