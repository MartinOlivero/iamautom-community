"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Top bar header — visible on all screen sizes.
 * Shows page context on mobile and notification + profile links on the right.
 */
export default function Topbar() {
    const { profile, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-30 bg-brand-bg/60 backdrop-blur-2xl border-b border-white/5 transition-all duration-500">
            <div className="flex items-center justify-between h-14 px-4 lg:px-6">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2">
                    <Link href="/app/feed" className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <span className="font-display text-lg">IamAutom</span>
                    </Link>
                </div>

                {/* Desktop: empty left (sidebar provides context) */}
                <div className="hidden lg:block" />

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <Link
                        href="/app/notificaciones"
                        className="relative p-2 text-brand-text-secondary hover:text-brand-text hover:bg-brand-hover-bg rounded-input transition-colors"
                    >
                        <span className="text-lg">🔔</span>
                    </Link>

                    {/* Profile dropdown (simplified) */}
                    {profile && (
                        <div className="flex items-center gap-2">
                            <Link href="/app/perfil">
                                <Avatar
                                    name={profile.full_name}
                                    imageUrl={profile.avatar_url}
                                    size="sm"
                                />
                            </Link>
                            <button
                                onClick={signOut}
                                className="hidden lg:block text-xs text-brand-muted hover:text-brand-text transition-colors"
                            >
                                Salir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
