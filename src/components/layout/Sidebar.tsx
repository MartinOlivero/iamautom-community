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
        <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 z-40 overflow-hidden">
            {/* Glass background layer */}
            <div className="absolute inset-0 bg-gradient-sidebar backdrop-blur-3xl border-r border-brand-electric/10" />

            {/* Ambient glow top */}
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-brand-electric/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-0 w-32 h-32 rounded-full bg-brand-violet/10 blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">

                {/* ── Logo ──────────────────────────────────── */}
                <div className="px-6 py-6 border-b border-white/5">
                    <Link href="/app/feed" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow-accent transition-transform duration-300 group-hover:scale-110">
                            <span className="text-white font-bold text-base">⚡</span>
                        </div>
                        <span className="font-display font-semibold text-lg text-white tracking-tight">
                            IamAutom
                        </span>
                    </Link>
                </div>

                {/* ── Navigation ────────────────────────────── */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-300 relative group
                    ${isActive
                                        ? "bg-brand-electric/15 text-white border border-brand-electric/25 shadow-glow-blue"
                                        : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                                    }
                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-electric rounded-r-full" />
                                )}
                                <span className="text-base">{item.emoji}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-3 border-t border-white/5" />

                    {/* Perfil */}
                    <Link
                        href="/app/perfil"
                        className={`
              flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-300 relative border
              ${pathname.startsWith("/app/perfil")
                                ? "bg-brand-electric/15 text-white border-brand-electric/25 shadow-glow-blue"
                                : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                            }
            `}
                    >
                        {pathname.startsWith("/app/perfil") && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-electric rounded-r-full" />
                        )}
                        <span className="text-base">👤</span>
                        <span>Mi Perfil</span>
                    </Link>

                    {/* Admin link (conditional) */}
                    {profile?.role === "admin" && (
                        <>
                            <div className="my-3 border-t border-white/5" />
                            <Link
                                href="/admin"
                                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-300 relative border
                  ${pathname.startsWith("/admin")
                                        ? "bg-brand-accent/15 text-brand-accent border-brand-accent/25 shadow-glow-accent"
                                        : "text-white/40 hover:text-brand-accent hover:bg-brand-accent/5 border-transparent"
                                    }
                `}
                            >
                                <span className="text-base">⚙️</span>
                                <span>Admin</span>
                                <span className="ml-auto text-[9px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                                    Panel
                                </span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* ── User info ─────────────────────────────── */}
                {profile && (
                    <div className="px-4 py-4 border-t border-white/5">
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300 group">
                            <Avatar
                                name={profile.full_name}
                                imageUrl={profile.avatar_url}
                                size="md"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">
                                    {profile.full_name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <PlanBadge planType={profile.plan_type} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 px-2">
                            <div className="flex items-center gap-1.5 text-xs bg-brand-electric/10 text-brand-electric px-2.5 py-1 rounded-lg border border-brand-electric/20">
                                <span>⚡</span>
                                <span className="font-mono font-semibold">{profile.xp_points} XP</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-lg border border-orange-500/20">
                                <span>🔥</span>
                                <span className="font-mono font-semibold">{profile.current_streak}</span>
                            </div>
                            <button
                                onClick={signOut}
                                className="ml-auto text-white/20 hover:text-white/60 transition-colors text-xs"
                                title="Cerrar sesión"
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
