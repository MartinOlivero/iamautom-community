"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import PremiumIcon from "@/components/ui/PremiumIcon";
import { LEVEL_THRESHOLDS } from "@/lib/constants";
import { getLevelInfo } from "@/lib/levels";

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
    const page = pageKey ? PAGE_TITLES[pageKey] : { title: settings?.title || "Iamautom Lab", emoji: settings?.logo_url ? "" : "⚡" };

    return (
        <header className="sticky top-4 z-50 mx-4 lg:mx-8 mb-8 mt-4 rounded-2xl glass border border-white/20 transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full duration-1000 transition-transform" />
            </div>
            <div className="flex items-center justify-between h-[4.5rem] px-5 lg:px-6 relative z-10">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2">
                    <Link href="/app/feed" className="flex items-center gap-2.5 group">
                        {settings?.logo_url ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-border flex items-center justify-center bg-brand-bg-2 shadow-sm transition-all group-hover:scale-110">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow-accent transition-all group-hover:scale-110">
                                <span className="text-white text-base font-bold">⚡</span>
                            </div>
                        )}
                        <span className="font-display font-bold text-brand-text text-lg">
                            {settings?.title || "Iamautom Lab"}
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
                    {/* Unified progress block */}
                    {profile && (() => {
                        const levelInfo = getLevelInfo(profile.level);
                        const thresholdEntries = Object.entries(LEVEL_THRESHOLDS)
                            .sort(([, a], [, b]) => a - b);
                        const xp = profile.xp_points || 0;
                        const coins = profile.coins || 0;
                        let currentThreshold = 0;
                        let nextThreshold = thresholdEntries[thresholdEntries.length - 1][1];
                        for (let i = 0; i < thresholdEntries.length; i++) {
                            if (i + 1 < thresholdEntries.length && xp < thresholdEntries[i + 1][1]) {
                                currentThreshold = thresholdEntries[i][1];
                                nextThreshold = thresholdEntries[i + 1][1];
                                break;
                            }
                            if (i === thresholdEntries.length - 1) {
                                currentThreshold = thresholdEntries[i][1];
                                nextThreshold = thresholdEntries[i][1];
                            }
                        }
                        const progress = nextThreshold === currentThreshold
                            ? 100
                            : Math.min(100, Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100));

                        return (
                            <Link href="/app/perfil" className="hidden md:flex flex-col w-[320px] relative overflow-hidden rounded-[20px] bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/30 px-5 py-3 group shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] hover:border-brand-accent/30 transition-all">
                                {/* Shimmer on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform pointer-events-none" />

                                {/* Stats row: XP left, Sinapsis right */}
                                <div className="flex items-center justify-between text-sm font-bold relative z-10">
                                    <span className="text-brand-accent drop-shadow-sm">⚡ {xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} <span className="text-xs font-medium opacity-70">XP</span></span>
                                    <span className="text-brand-electric-blue drop-shadow-sm flex items-center gap-1">
                                        ⚡ {coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} <span className="text-xs font-medium opacity-70">Sinapsis</span>
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-2 h-2 bg-brand-border/50 rounded-full overflow-hidden shadow-inner relative z-10">
                                    <div
                                        className="h-full bg-brand-accent rounded-full transition-all duration-700 relative"
                                        style={{
                                            width: `${progress}%`,
                                            boxShadow: "0 0 8px rgba(34,197,94,0.7)",
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/25 w-1/2 blur-[2px] rotate-12 translate-x-1" />
                                    </div>
                                </div>

                                {/* Level label + streak */}
                                <div className="mt-1.5 flex items-center justify-between relative z-10">
                                    <span className="text-[11px] font-semibold text-brand-text-secondary">
                                        {levelInfo.icon} Nivel {levelInfo.number} · {levelInfo.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {profile.current_streak > 0 && (
                                            <span className="text-[10px] font-bold text-orange-400">🔥 {profile.current_streak}d</span>
                                        )}
                                        <span className="text-[10px] font-bold text-brand-muted">{progress}%</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })()}
                </div>
            </div>
        </header>
    );
}
