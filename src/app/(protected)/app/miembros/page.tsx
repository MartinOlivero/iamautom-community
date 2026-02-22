"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import ProfileCard from "@/components/profile/ProfileCard";
import Spinner from "@/components/ui/Spinner";

/**
 * Members directory and XP leaderboard.
 */
export default function MiembrosPage() {
    const { members, isLoading } = useMembers();
    const [search, setSearch] = useState("");

    const filteredMembers = members.filter((m) =>
        m.full_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-display font-bold text-brand-text">Miembros</h1>
                    <p className="text-sm text-brand-muted mt-1">
                        {members.length} miembro{members.length !== 1 ? "s" : ""} activo{members.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted text-sm">
                    🔍
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar miembros..."
                    className="w-full bg-brand-card border border-brand-border rounded-input
                     pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted
                     focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
            </div>

            {/* Leaderboard */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-brand-muted text-sm">
                        {search ? "No se encontraron miembros" : "Aún no hay miembros"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredMembers.map((member, index) => (
                        <ProfileCard
                            key={member.id}
                            member={member}
                            rank={search ? undefined : index + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
