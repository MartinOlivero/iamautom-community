"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Sidebar() {
    const pathname = usePathname();
    const { profile, signOut } = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-[240px] h-screen fixed left-0 top-0 z-40">
            {/* Deep indigo sidebar — inspired by premium community platforms */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] via-[#1e293b] to-[#0f172a] shadow-[4px_0_32px_rgba(0,0,0,0.15)]" />

            {/* Subtle decorative gradient blob */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-[#6366f1]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-[#f97316]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* ── Logo ─────────────────────────────── */}
                <div className="px-5 py-5 border-b border-white/[0.08]">
                    <Link href="/app/feed" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow-accent transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <span className="text-white font-bold text-lg">⚡</span>
                        </div>
                        <div>
                            <span className="block font-display font-bold text-white text-base leading-tight tracking-tight">IamAutom</span>
                            <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Community</span>
                        </div>
                    </Link>
                </div>

                {/* ── Navigation ───────────────────────── */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                    transition-all duration-200 group relative
                                    ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                                    }
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-accent rounded-r-full" />
                                )}
                                <span className={`text-base transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                                    {item.emoji}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="my-3 mx-1 border-t border-white/[0.08]" />

                    {/* Mi Perfil */}
                    <Link
                        href="/app/perfil"
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 group relative
                            ${pathname.startsWith("/app/perfil")
                                ? "bg-white/10 text-white"
                                : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                            }
                        `}
                    >
                        {pathname.startsWith("/app/perfil") && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-accent rounded-r-full" />
                        )}
                        <span className="text-base">👤</span>
                        <span>Mi Perfil</span>
                    </Link>

                    {/* Admin */}
                    {profile?.role === "admin" && (
                        <>
                            <div className="my-3 mx-1 border-t border-white/[0.08]" />
                            <Link
                                href="/admin"
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                    transition-all duration-200 group relative
                                    ${pathname.startsWith("/admin")
                                        ? "bg-[#f97316]/20 text-[#fb923c]"
                                        : "text-white/30 hover:text-[#fb923c] hover:bg-[#f97316]/10"
                                    }
                                `}
                            >
                                <span className="text-base">⚙️</span>
                                <span>Admin</span>
                                <span className="ml-auto text-[9px] bg-[#f97316]/20 text-[#fb923c] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                    Panel
                                </span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* ── XP Progress bar ───────────────────── */}
                {profile && (
                    <div className="px-4 mx-3 mb-3 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-white/50">Tu progreso</span>
                            <span className="text-xs font-mono font-bold text-[#f97316]">⚡ {profile.xp_points} XP</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-accent rounded-full transition-all duration-700"
                                style={{ width: `${Math.min((profile.xp_points % 500) / 500 * 100, 100)}%` }}
                            />
                        </div>
                        {profile.current_streak > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                                <span>🔥</span>
                                <span className="font-mono">{profile.current_streak} días seguidos</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── User info ─────────────────────────── */}
                {profile && (
                    <div className="px-4 py-4 border-t border-white/[0.08]">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar
                                    name={profile.full_name}
                                    imageUrl={profile.avatar_url}
                                    size="sm"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-[#0f172a]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate leading-tight">
                                    {profile.full_name}
                                </p>
                                <PlanBadge planType={profile.plan_type} />
                            </div>
                            <button
                                onClick={signOut}
                                className="text-white/20 hover:text-white/60 transition-colors text-sm"
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
