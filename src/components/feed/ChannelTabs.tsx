"use client";

import { CHANNELS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

interface ChannelTabsProps {
    activeChannel: string;
    onChannelChange: (channel: string) => void;
}

/**
 * Horizontal channel tabs for the feed.
 * VIP channel only visible to Inner Circle / admin users.
 */
export default function ChannelTabs({ activeChannel, onChannelChange }: ChannelTabsProps) {
    const { profile } = useAuth();
    const isInnerCircle =
        profile?.plan_type === "inner_circle" ||
        profile?.plan_type === "admin" ||
        profile?.role === "admin";

    const channelEntries = Object.entries(CHANNELS) as [string, { label: string; emoji: string; requiresInnerCircle: boolean }][];

    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {channelEntries.map(([id, channel]) => {
                // Hide VIP channel from non-Inner Circle users
                if (id === "inner_circle_vip" && !isInnerCircle) return null;

                const isActive = activeChannel === id;

                return (
                    <button
                        key={id}
                        onClick={() => onChannelChange(id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium
                       whitespace-nowrap transition-all
                       ${isActive
                                ? id === "inner_circle_vip"
                                    ? "bg-gradient-gold text-brand-dark"
                                    : "bg-brand-dark text-white"
                                : "text-brand-muted hover:text-brand-text hover:bg-brand-hover-bg"
                            }`}
                    >
                        <span>{channel.emoji}</span>
                        <span>{channel.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
