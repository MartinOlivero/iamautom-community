"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import MembersModal from "./MembersModal";
import type { CommunityMember } from "@/hooks/useCommunityStats";

interface CommunitySidebarProps {
    onlineMembers: CommunityMember[];
    stats: {
        totalMembers: number;
        postsThisWeek: number;
        onlineNow: number;
    };
    topContributors: CommunityMember[];
}

export default function CommunitySidebar({ onlineMembers, stats, topContributors }: CommunitySidebarProps) {
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

    return (
        <div className="flex flex-col gap-6 w-full pb-20 lg:pb-0">
            {/* Members List */}
            <div className="bg-brand-card/50 rounded-2xl border border-brand-border/50 p-5 overflow-hidden shadow-card-sm transition-all duration-300 hover:border-brand-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                        Miembros
                        <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full">
                            {stats.totalMembers}
                        </span>
                    </h3>
                    <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="text-[10px] font-bold text-brand-accent hover:underline uppercase tracking-wider"
                    >
                        Ver todo
                    </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                    {onlineMembers.slice(0, 12).map((member) => (
                        <div key={member.id} className="relative group/avatar cursor-pointer" onClick={() => setIsMembersModalOpen(true)}>
                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-brand-accent to-purple-500 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-[2px]" />
                            <div className="relative transform hover:scale-110 transition-transform duration-200">
                                <Avatar
                                    name={member.full_name}
                                    imageUrl={member.avatar_url || undefined}
                                    size="sm"
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-brand-card rounded-full" />
                            </div>

                            {/* Simple tooltip simulation */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 backdrop-blur-sm text-[10px] text-white rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {member.full_name}
                            </div>
                        </div>
                    ))}
                    {onlineMembers.length > 12 && (
                        <div
                            onClick={() => setIsMembersModalOpen(true)}
                            className="w-8 h-8 rounded-full bg-brand-hover-bg flex items-center justify-center text-[10px] font-bold text-brand-muted border border-brand-border hover:border-brand-accent transition-colors cursor-pointer"
                        >
                            +{onlineMembers.length - 12}
                        </div>
                    )}
                </div>
            </div>

            {/* Members Modal */}
            <MembersModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
            />

            {/* Stats */}
            <div className="bg-brand-card/50 rounded-2xl border border-brand-border/50 p-5 grid grid-cols-2 gap-4 shadow-card-sm">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Nuevos posts</p>
                    <p className="text-xl font-display font-bold text-brand-text">{stats.postsThisWeek}</p>
                    <p className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Esta semana
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">En línea</p>
                    <p className="text-xl font-display font-bold text-brand-text">{stats.onlineNow}</p>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-500">Activo ahora</span>
                    </div>
                </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-brand-card/50 rounded-2xl border border-brand-border/50 p-5 shadow-card-sm">
                <h3 className="text-sm font-bold text-brand-text mb-4">🏆 Mejores de la semana</h3>
                <div className="space-y-3">
                    {topContributors.map((user, idx) => (
                        <div key={user.id} className="flex items-center justify-between group/user cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold w-4 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-brand-muted'}`}>
                                    {idx + 1}
                                </span>
                                <Avatar
                                    name={user.full_name}
                                    imageUrl={user.avatar_url || undefined}
                                    size="sm"
                                />
                                <span className="text-xs font-medium text-brand-text group-hover/user:text-brand-accent transition-colors">
                                    {user.full_name}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-muted group-hover/user:text-brand-accent bg-brand-hover-bg rounded-full px-2 py-0.5 transition-all">
                                Lv {user.level || 1}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
