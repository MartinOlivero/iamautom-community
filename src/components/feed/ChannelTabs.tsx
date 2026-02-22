"use client";

import { CHANNELS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

interface ChannelTabsProps {
    activeChannel: string;
    onChannelChange: (channel: string) => void;
}

export default function ChannelTabs({ activeChannel, onChannelChange }: ChannelTabsProps) {
    const { profile } = useAuth();
    const isInnerCircle =
        profile?.plan_type === "inner_circle" ||
        profile?.plan_type === "admin" ||
        profile?.role === "admin";

    const channelEntries = Object.entries(CHANNELS) as [string, { label: string; emoji: string; requiresInnerCircle: boolean }][];

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {channelEntries.map(([id, channel]) => {
                if (id === "inner_circle_vip" && !isInnerCircle) return null;
                const isActive = activeChannel === id;
                const isVIP = id === "inner_circle_vip";

                return (
                    <button
                        key={id}
                        onClick={() => onChannelChange(id)}
                        className={`
                            relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                            whitespace-nowrap transition-all duration-300 border
                            ${isActive
                                ? isVIP
                                    ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white border-transparent shadow-glow-accent"
                                    : "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30"
                                : "text-white/40 hover:text-white/70 hover:bg-white/5 border-transparent"
                            }
                        `}
                    >
                        {isActive && !isVIP && (
                            <span className="absolute inset-0 rounded-xl bg-[#38bdf8]/5" />
                        )}
                        <span className="relative z-10">{channel.emoji}</span>
                        <span className="relative z-10">{channel.label}</span>
                        {isVIP && <span className="relative z-10 text-[9px] bg-white/20 px-1 rounded-sm font-bold">VIP</span>}
                    </button>
                );
            })}
        </div>
    );
}
