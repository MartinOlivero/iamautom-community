"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";

const PAGE_TITLES: Record<string, { title: string; emoji: string }> = {
    "/app/feed": { title: "Feed", emoji: "📣" },
    "/app/cursos": { title: "Cursos", emoji: "📚" },
    "/app/leaderboard": { title: "Leaderboard", emoji: "🏆" },
    "/app/miembros": { title: "Miembros", emoji: "👥" },
    "/app/perfil": { title: "Mi Perfil", emoji: "👤" },
    "/admin": { title: "Admin", emoji: "⚙️" },
};

export default function Topbar() {
    const { profile } = useAuth();
    const pathname = usePathname();

    const pageKey = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k));
    const page = pageKey ? PAGE_TITLES[pageKey] : { title: "IamAutom", emoji: "⚡" };

    return (
        <header className="sticky top-0 z-30 overflow-hidden">
            {/* Glass layer */}
            <div className="absolute inset-0 bg-[rgba(4,8,15,0.6)] backdrop-blur-2xl border-b border-brand-electric/10" />

            {/* Subtle top aurora line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-aurora opacity-30" />

            <div className="relative z-10 flex items-center justify-between h-14 px-4 lg:px-6">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2">
                    <Link href="/app/feed" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow-accent transition-transform group-hover:scale-110">
                            <span className="text-white text-sm font-bold">⚡</span>
                        </div>
                        <span className="font-display font-semibold text-white">IamAutom</span>
                    </Link>
                </div>

                {/* Desktop: current page title */}
                <div className="hidden lg:flex items-center gap-2.5">
                    <span className="text-base">{page.emoji}</span>
                    <h1 className="text-sm font-semibold text-white/70">{page.title}</h1>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* XP chip — desktop only */}
                    {profile && (
                        <div className="hidden lg:flex items-center gap-1.5 text-xs bg-brand-electric/10 text-brand-electric px-3 py-1.5 rounded-lg border border-brand-electric/20 font-mono font-medium">
                            ⚡ {profile.xp_points} XP
                        </div>
                    )}

                    {/* Streak chip — desktop */}
                    {profile && profile.current_streak > 0 && (
                        <div className="hidden lg:flex items-center gap-1.5 text-xs bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-lg border border-orange-500/20 font-mono font-medium">
                            🔥 {profile.current_streak}
                        </div>
                    )}

                    {/* Profile & avatar */}
                    {profile && (
                        <Link href="/app/perfil" className="ml-1">
                            <div className="relative group">
                                <Avatar
                                    name={profile.full_name}
                                    imageUrl={profile.avatar_url}
                                    size="sm"
                                    className="ring-2 ring-brand-electric/0 group-hover:ring-brand-electric/50 transition-all duration-300"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-success rounded-full border-2 border-[#04080f]" />
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
