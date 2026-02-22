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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
                            whitespace-nowrap transition-all duration-200 border
                            ${isActive
                                ? isVIP
                                    ? "bg-gradient-gold text-white border-transparent shadow-[0_4px_12px_rgba(245,158,11,0.3)]"
                                    : "bg-[#6366f1] text-white border-transparent shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 shadow-card-sm"
                            }
                        `}
                    >
                        <span>{channel.emoji}</span>
                        <span>{channel.label}</span>
                        {isVIP && <span className="text-[9px] bg-white/25 px-1 rounded font-bold">VIP</span>}
                    </button>
                );
            })}
        </div>
    );
}
