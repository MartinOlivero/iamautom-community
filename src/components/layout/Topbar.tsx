"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";

const PAGE_TITLES: Record<string, { title: string; emoji: string }> = {
    "/app/feed": { title: "Comunidad", emoji: "📣" },
    "/app/cursos": { title: "Cursos", emoji: "📚" },
    "/app/leaderboard": { title: "Leaderboard", emoji: "🏆" },
    "/app/miembros": { title: "Miembros", emoji: "👥" },
    "/app/calendario": { title: "Calendario", emoji: "📅" },
    "/app/perfil": { title: "Mi Perfil", emoji: "👤" },
    "/admin": { title: "Admin", emoji: "⚙️" },
};

export default function Topbar() {
    const { profile } = useAuth();
    const pathname = usePathname();
    const pageKey = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k));
    const page = pageKey ? PAGE_TITLES[pageKey] : { title: "IamAutom", emoji: "⚡" };

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between h-14 px-4 lg:px-6">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2">
                    <Link href="/app/feed" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-accent transition-all group-hover:scale-110">
                            <span className="text-white text-sm font-bold">⚡</span>
                        </div>
                        <span className="font-display font-bold text-[#1e293b] text-base">IamAutom</span>
                    </Link>
                </div>

                {/* Desktop: page title */}
                <div className="hidden lg:flex items-center gap-2.5">
                    <span className="text-xl">{page.emoji}</span>
                    <h1 className="text-base font-semibold text-[#1e293b]">{page.title}</h1>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* XP chip */}
                    {profile && (
                        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium bg-[#fff7ed] text-[#f97316] px-3 py-1.5 rounded-lg border border-[#fed7aa]">
                            ⚡ {profile.xp_points} XP
                        </div>
                    )}

                    {/* Streak */}
                    {profile && profile.current_streak > 0 && (
                        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-500 px-3 py-1.5 rounded-lg border border-orange-100">
                            🔥 {profile.current_streak}
                        </div>
                    )}

                    {/* Profile link */}
                    {profile && (
                        <Link href="/app/perfil" className="group relative">
                            <Avatar
                                name={profile.full_name}
                                imageUrl={profile.avatar_url}
                                size="sm"
                                className="ring-2 ring-transparent group-hover:ring-[#6366f1]/40 transition-all duration-300"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-white" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
