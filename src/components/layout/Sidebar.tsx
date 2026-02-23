"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import PremiumIcon from "@/components/ui/PremiumIcon";

export default function Sidebar() {
    const pathname = usePathname();
    const { profile, signOut } = useAuth();
    const { settings } = useSiteSettings();

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-2rem)] fixed left-4 top-4 z-40 rounded-3xl glass dark:glass-dark border border-white/20 shadow-glass overflow-hidden transition-all duration-500">
            {/* Subtle decorative gradient blob */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-brand-electric-blue/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* ── Logo ─────────────────────────────── */}
                <div className="px-6 py-6 border-b border-brand-border/40">
                    <Link href="/app/feed" className="flex items-center gap-3 group">
                        {settings?.logo_url ? (
                            <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/40 overflow-hidden shadow-card transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-neon">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.5)] border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_25px_rgba(199,125,255,0.8)]">
                                <span className="text-white font-bold text-xl drop-shadow-md">⚡</span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <span className="font-display font-extrabold text-brand-text text-[1.15rem] tracking-tight block truncate drop-shadow-sm">
                                {settings?.title || "IamAutom"}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-electric-blue font-bold block opacity-90">Community</span>
                        </div>
                    </Link>
                </div>

                {/* ── Navigation ───────────────────────── */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold
                                    transition-all duration-300 group relative
                                    ${isActive
                                        ? "bg-white/60 dark:bg-white/10 text-brand-text shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.05)] border border-white/30 translate-y-[-1px]"
                                        : "text-brand-text-secondary hover:text-brand-text hover:bg-white/40 dark:hover:bg-white/5 border border-transparent hover:border-white/20 hover:shadow-sm"
                                    }
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-accent rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                )}
                                <PremiumIcon href={item.href} isActive={isActive} size={18} className="translate-y-[0px]" />
                                <span className={`tracking-wide transition-colors ${isActive ? 'text-brand-text' : 'text-brand-text-secondary group-hover:text-brand-text'}`}>{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="my-5 mx-2 border-t border-brand-border/30" />

                    {/* Mi Perfil */}
                    <Link
                        href="/app/perfil"
                        className={`
                            flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold
                            transition-all duration-300 group relative
                            ${pathname.startsWith("/app/perfil")
                                ? "bg-white/60 dark:bg-white/10 text-brand-text shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.05)] border border-white/30 translate-y-[-1px]"
                                : "text-brand-text-secondary hover:text-brand-text hover:bg-white/40 dark:hover:bg-white/5 border border-transparent hover:border-white/20 hover:shadow-sm"
                            }
                        `}
                    >
                        {pathname.startsWith("/app/perfil") && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-accent rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                        )}
                        <PremiumIcon href="/app/perfil" isActive={pathname.startsWith("/app/perfil")} size={18} />
                        <span className={`tracking-wide transition-colors ${pathname.startsWith("/app/perfil") ? 'text-brand-text' : 'text-brand-text-secondary group-hover:text-brand-text'}`}>Mi Perfil</span>
                    </Link>

                    {/* Admin */}
                    {profile?.role === "admin" && (
                        <>
                            <div className="my-5 mx-2 border-t border-brand-border/30" />
                            <Link
                                href="/admin"
                                className={`
                                    flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold
                                    transition-all duration-300 group relative overflow-hidden
                                    ${pathname.startsWith("/admin")
                                        ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"
                                        : "text-brand-text-secondary hover:text-brand-electric-blue hover:bg-brand-electric-blue/10 border border-transparent hover:border-brand-electric-blue/10"
                                    }
                                `}
                            >
                                <PremiumIcon href="/admin" isActive={pathname.startsWith("/admin")} size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span className="tracking-wide">Admin</span>
                                <span className="ml-auto text-[9px] bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-lg font-bold uppercase tracking-widest border border-brand-accent/20">
                                    Panel
                                </span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* ── XP Progress bar ───────────────────── */}
                {profile && (
                    <div className="px-5 mx-4 mb-4 py-4 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-inner-glow relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-medium text-brand-text-secondary uppercase tracking-wider">Tu progreso</span>
                            <span className="text-xs font-mono font-bold text-brand-accent drop-shadow-sm">⚡ {profile.xp_points} XP</span>
                        </div>
                        <div className="h-2 bg-brand-border/50 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-accent rounded-full animate-pulse-ring shadow-[0_0_10px_rgba(249,115,22,0.8)] relative"
                                style={{ width: `${Math.min(100, (profile.xp_points / 1000) * 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-1/2 blur-sm rotate-12 translate-x-1" />
                            </div>
                        </div>
                        {profile.current_streak > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-brand-text-secondary font-medium">
                                <span className="drop-shadow-sm scale-110">🔥</span>
                                <span className="font-mono tracking-tight">{profile.current_streak} días seguidos</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── User info ─────────────────────────── */}
                {profile && (
                    <div className="px-5 py-4 border-t border-brand-border/40 bg-white/20 dark:bg-black/10 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="relative group cursor-pointer" onClick={() => window.location.href = '/app/perfil'}>
                                <div className="transition-transform duration-300 group-hover:scale-105 group-hover:shadow-glow-blue rounded-full">
                                    <Avatar
                                        name={profile.full_name}
                                        imageUrl={profile.avatar_url}
                                        size="sm"
                                    />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-success rounded-full border-[2px] border-white shadow-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-brand-text truncate leading-tight drop-shadow-sm">
                                    {profile.full_name}
                                </p>
                                <p className="text-[11px] font-medium text-brand-accent truncate mt-0.5 tracking-wide">
                                    {profile.role === "admin" ? "Admnistrador" : "Estudiante"}
                                </p>
                            </div>
                            <button
                                onClick={signOut}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-brand-text-secondary hover:text-brand-accent transition-all duration-300 border border-transparent hover:border-brand-accent/20 hover:shadow-sm hover:scale-105 active:scale-95"
                                title="Salir"
                            >
                                ⎋
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
