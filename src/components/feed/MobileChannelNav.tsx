"use client";

import { CHANNELS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

interface MobileChannelNavProps {
    activeChannel: string;
    onChannelChange: (channel: string) => void;
}

export default function MobileChannelNav({ activeChannel, onChannelChange }: MobileChannelNavProps) {
    const { profile } = useAuth();
    const isInnerCircle =
        profile?.plan_type === "inner_circle" ||
        profile?.role === "admin";

    const channelEntries = Object.entries(CHANNELS) as [string, { label: string; emoji: string; requiresInnerCircle: boolean }][];

    return (
        <div className="lg:hidden fixed bottom-[10rem] left-4 right-4 z-30 pointer-events-none">
            <div className="bg-brand-card/90 backdrop-blur-md border border-brand-border rounded-full shadow-lg p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide pointer-events-auto pr-8">
                {channelEntries.map(([id, ch]) => {
                    if (ch.requiresInnerCircle && !isInnerCircle) return null;

                    return (
                        <button
                            key={id}
                            onClick={() => onChannelChange(id)}
                            className={`
                                flex items-center gap-2 px-4 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-bold
                                ${activeChannel === id
                                    ? "bg-brand-accent text-white shadow-sm"
                                    : "text-brand-muted hover:text-brand-text hover:bg-brand-hover-bg"
                                }
                            `}
                        >
                            <span>{ch.emoji}</span>
                            <span>{ch.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
