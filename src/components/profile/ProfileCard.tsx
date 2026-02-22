"use client";

import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import type { MemberProfile } from "@/hooks/useMembers";

interface ProfileCardProps {
    member: MemberProfile;
    rank?: number;
    onClick?: () => void;
}

/**
 * Compact profile card for the members directory.
 */
export default function ProfileCard({ member, rank, onClick }: ProfileCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-brand-card rounded-card border border-brand-border p-4
                 transition-all hover:shadow-md hover:border-brand-accent/20 hover:-translate-y-0.5
                 flex items-center gap-3"
        >
            {/* Rank badge */}
            {rank !== undefined && rank <= 3 && (
                <span className="text-lg flex-shrink-0">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                </span>
            )}
            {rank !== undefined && rank > 3 && (
                <span className="w-6 h-6 rounded-full bg-brand-hover-bg text-brand-muted
                        text-[10px] font-mono flex items-center justify-center flex-shrink-0">
                    {rank}
                </span>
            )}

            {/* Avatar */}
            <Avatar
                name={member.full_name}
                imageUrl={member.avatar_url || undefined}
                size="sm"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-text truncate">
                        {member.full_name}
                    </span>
                    <PlanBadge planType={member.plan_type} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-brand-muted mt-0.5">
                    <span>⚡ {member.xp_points} XP</span>
                    <span>📊 Nivel {member.level}</span>
                    {member.current_streak > 0 && <span>🔥 {member.current_streak}d</span>}
                </div>
            </div>
        </button>
    );
}
