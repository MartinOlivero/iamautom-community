"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Sidebar — dark, fixed left column on desktop.
 * Shows logo, navigation with emojis, and user info at the bottom.
 */
export default function Sidebar() {
    const pathname = usePathname();
    const { profile } = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-[#0a0a0a]/70 backdrop-blur-2xl border-r border-white/5 text-white fixed left-0 top-0 z-40 transition-all duration-500 ease-in-out">
            {/* ── Logo ────────────────────────────────── */}
            <div className="px-6 py-6 border-b border-white/10">
                <Link href="/app/feed" className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <span className="font-display text-xl tracking-tight">
                        IamAutom
                    </span>
                </Link>
            </div>

            {/* ── Navigation ──────────────────────────── */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-2.5 rounded-input text-sm
                transition-all duration-200
                ${isActive
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }
              `}
                        >
                            <span className="text-lg">{item.emoji}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                {/* Divider */}
                <div className="my-3 border-t border-white/10" />

                {/* Perfil link */}
                <Link
                    href="/app/perfil"
                    className={`
            flex items-center gap-3 px-4 py-2.5 rounded-input text-sm
            transition-all duration-200
            ${pathname.startsWith("/app/perfil")
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }
          `}
                >
                    <span className="text-lg">👤</span>
                    <span>Mi Perfil</span>
                </Link>

                {/* Deals link */}
                <Link
                    href="/app/deals"
                    className={`
            flex items-center gap-3 px-4 py-2.5 rounded-input text-sm
            transition-all duration-200
            ${pathname.startsWith("/app/deals")
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }
          `}
                >
                    <span className="text-lg">🎁</span>
                    <span>Deals</span>
                </Link>

                {/* Admin link (conditional) */}
                {profile?.role === "admin" && (
                    <>
                        <div className="my-3 border-t border-white/10" />
                        <Link
                            href="/admin"
                            className={`
                flex items-center gap-3 px-4 py-2.5 rounded-input text-sm
                transition-all duration-200
                ${pathname.startsWith("/admin")
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                }
              `}
                        >
                            <span className="text-lg">⚙️</span>
                            <span>Admin</span>
                        </Link>
                    </>
                )}
            </nav>

            {/* ── User info at bottom ─────────────────── */}
            {profile && (
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Avatar
                            name={profile.full_name}
                            imageUrl={profile.avatar_url}
                            size="md"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                                {profile.full_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <PlanBadge planType={profile.plan_type} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 px-1">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                            <span className="font-mono text-brand-accent font-semibold">
                                {profile.xp_points}
                            </span>
                            <span>XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/50">
                            <span>🔥</span>
                            <span className="font-mono font-semibold">
                                {profile.current_streak}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
