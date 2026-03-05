"use client";

import { CHANNELS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

interface ChannelNavProps {
    activeChannel: string;
    onChannelChange: (channel: string) => void;
    horizontal?: boolean;
}

export default function ChannelNav({ activeChannel, onChannelChange, horizontal = false }: ChannelNavProps) {
    const { profile } = useAuth();
    const isInnerCircle =
        profile?.plan_type === "inner_circle" ||
        profile?.role === "admin";

    const channelEntries = Object.entries(CHANNELS) as [string, { label: string; emoji: string; requiresInnerCircle: boolean }][];

    return (
        <div className={`flex ${horizontal ? 'flex-row items-center justify-center gap-1 py-1.5 px-1 overflow-visible' : 'flex-col gap-1'} w-full`}>
            {channelEntries.map(([id, channel]) => {
                if (channel.requiresInnerCircle && !isInnerCircle) return null;
                const isActive = activeChannel === id;

                return (
                    <button
                        key={id}
                        onClick={() => onChannelChange(id)}
                        className={`
                            group flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold
                            transition-all duration-200 ${horizontal ? 'flex-1 whitespace-nowrap' : 'w-full text-left justify-between'}
                            ${isActive
                                ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20"
                                : "text-brand-muted hover:bg-brand-hover-bg hover:text-brand-text"
                            }
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-base">{channel.emoji}</span>
                            <span>{channel.label}</span>
                        </div>

                        {id === 'general' && !isActive && (
                            <span className={`${horizontal ? 'ml-1.5' : ''} bg-brand-accent text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center`}>
                                3
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
