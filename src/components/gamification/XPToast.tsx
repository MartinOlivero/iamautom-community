"use client";

import { useEffect, useState } from "react";

interface XPToastData {
    id: string;
    xpAmount: number;
    leveledUp: boolean;
    newLevel: string;
    badges: { name: string; emoji: string }[];
}

/**
 * Floating toast that shows XP gained, level-ups, and new badges.
 * Auto-dismisses after 4 seconds.
 */
export default function XPToast() {
    const [toasts, setToasts] = useState<XPToastData[]>([]);

    useEffect(() => {
        // Listen for custom XP events dispatched from hooks/components
        function handleXPEvent(event: CustomEvent<XPToastData>) {
            setToasts((prev) => [...prev, event.detail]);

            // Auto-dismiss after 4s
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== event.detail.id));
            }, 4000);
        }

        window.addEventListener("xp-awarded" as string, handleXPEvent as EventListener);
        return () => {
            window.removeEventListener("xp-awarded" as string, handleXPEvent as EventListener);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="relative overflow-hidden bg-[#0a0a0a]/80 backdrop-blur-2xl border border-brand-accent/40 rounded-card px-5 py-4
                     shadow-[0_0_40px_rgba(255,77,0,0.2)] animate-slideInRight
                     min-w-[240px] max-w-[320px] transform hover:scale-105 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/20 to-transparent pointer-events-none" />

                    {/* Content Wrapper */}
                    <div className="relative z-10">
                        {/* XP gained */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">⚡</span>
                            <span className="text-sm font-semibold text-brand-accent">
                                +{toast.xpAmount} XP
                            </span>
                        </div>

                        {/* Level up */}
                        {toast.leveledUp && (
                            <div className="flex items-center gap-2 text-xs text-yellow-400 mt-1">
                                <span>⬆️</span>
                                <span className="font-medium">
                                    ¡Subiste a {toast.newLevel}!
                                </span>
                            </div>
                        )}

                        {/* New badges */}
                        {toast.badges.map((badge) => (
                            <div
                                key={badge.name}
                                className="flex items-center gap-2 text-xs text-brand-text mt-1"
                            >
                                <span>{badge.emoji}</span>
                                <span>
                                    Badge: <strong>{badge.name}</strong>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Dispatches an XP toast event from anywhere in the app.
 */
export function showXPToast(data: {
    xpAmount: number;
    leveledUp: boolean;
    newLevel: string;
    badges: { name: string; emoji: string }[];
}) {
    const event = new CustomEvent("xp-awarded", {
        detail: {
            id: crypto.randomUUID(),
            ...data,
        },
    });
    window.dispatchEvent(event);
}
