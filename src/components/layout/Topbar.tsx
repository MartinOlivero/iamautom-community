"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import PremiumIcon from "@/components/ui/PremiumIcon";

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
    const { settings } = useSiteSettings();
    const pathname = usePathname();
    const pageKey = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k));
    const page = pageKey ? PAGE_TITLES[pageKey] : { title: settings?.title || "IamAutom", emoji: settings?.logo_url ? "" : "⚡" };

    return (
        <header className="sticky top-4 z-30 mx-4 lg:mx-8 mb-8 mt-4 rounded-2xl glass dark:glass-dark shadow-glass border border-white/20 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full duration-1000 transition-transform" />
            <div className="flex items-center justify-between h-[4.5rem] px-5 lg:px-6 relative z-10">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2">
                    <Link href="/app/feed" className="flex items-center gap-2.5 group">
                        {settings?.logo_url ? (
                            <div className="w-8 h-8 rounded-xl overflow-hidden border border-brand-border flex items-center justify-center bg-brand-bg-2 shadow-sm transition-all group-hover:scale-110">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-accent transition-all group-hover:scale-110">
                                <span className="text-white text-sm font-bold">⚡</span>
                            </div>
                        )}
                        <span className="font-display font-bold text-brand-text text-base">
                            {settings?.title || "IamAutom"}
                        </span>
                    </Link>
                </div>

                {/* Desktop: page title */}
                <div className="hidden lg:flex items-center gap-3">
                    {pageKey && <PremiumIcon href={pageKey} isActive={false} className="shadow-none border-transparent bg-transparent dark:bg-transparent" size={24} />}
                    <h1 className="text-xl font-display font-bold text-brand-text">{page.title}</h1>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* XP chip */}
                    {profile && (
                        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium bg-brand-accent/10 text-brand-accent px-3 py-1.5 rounded-lg border border-brand-accent/20">
                            ⚡ {profile.xp_points} Synapses
                        </div>
                    )}

                    {/* Streak */}
                    {profile && profile.current_streak > 0 && (
                        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 border-orange-500/20">
                            🔥 {profile.current_streak} Uptime
                        </div>
                    )}

                    {/* Profile link */}
                    {profile && (
                        <Link href="/app/perfil" className="group relative">
                            <Avatar
                                name={profile.full_name}
                                imageUrl={profile.avatar_url}
                                size="sm"
                                className="ring-2 ring-transparent group-hover:ring-brand-violet/40 transition-all duration-300"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-success rounded-full border-2 border-brand-card dark:border-brand-dark" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
