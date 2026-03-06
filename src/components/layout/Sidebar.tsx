"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import PremiumIcon from "@/components/ui/PremiumIcon";

import { createClient } from "@/lib/insforge/client";



function useRealtimeProfile() {
    const { user, profile: initialProfile } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null);

    // Carga inicial y sincronización con AuthContext
    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    // Escuchar cambios en tiempo real
    useEffect(() => {
        if (!user?.id) return;

        const insforge = createClient();
        const channel = `profile:${user.id}`;

        async function setupRealtime() {
            try {
                if (!insforge.realtime.isConnected) {
                    await insforge.realtime.connect();
                }
                const { ok } = await insforge.realtime.subscribe(channel);
                if (ok) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    insforge.realtime.on('update_profiles', (payload: any) => {
                        setProfile(payload);
                    });
                }
            } catch (err) {
                console.error("Realtime profile sync failed:", err);
            }
        }

        setupRealtime();

        // Reconectar cuando el usuario vuelve a la pestaña
        function handleVisibilityChange() {
            if (document.visibilityState === "visible" && !insforge.realtime.isConnected) {
                setupRealtime();
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            insforge.realtime.off('update_profiles');
            insforge.realtime.unsubscribe(channel);
        };
    }, [user?.id]); // Solo depende del user.id

    return profile;
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const profile = useRealtimeProfile();
    const { settings } = useSiteSettings();

    async function handleSignOut() {
        await signOut();
        router.push("/login");
    }

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
                            <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/40 overflow-hidden shadow-card transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-neon group-hover:ring-2 group-hover:ring-brand-accent/40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.5)] border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_25px_rgba(199,125,255,0.8)] group-hover:ring-2 group-hover:ring-brand-accent/40">
                                <span className="text-white font-bold text-2xl drop-shadow-md">⚡</span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <span className="font-display font-extrabold text-brand-text text-[1.25rem] tracking-tight block truncate drop-shadow-sm transition-all duration-300 group-hover:text-brand-accent group-hover:drop-shadow-[0_0_10px_rgba(0,255,102,0.85)]">
                                {settings?.title || "IamAutom"}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-electric-blue font-bold block opacity-90 transition-all duration-300 group-hover:text-brand-accent group-hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]">Community</span>
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
                                <span className={`tracking-wide transition-all duration-300 ${isActive ? 'text-brand-text' : 'text-brand-text-secondary group-hover:text-brand-text group-hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.75)]'}`}>{item.label}</span>
                            </Link>
                        );
                    })}

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

                    <div className="my-5 mx-2 border-t border-brand-border/30" />

                    {/* Manual del Agente */}
                    <Link
                        href="/app/manual"
                        className={`
                            flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold
                            transition-all duration-300 group relative
                            ${pathname.startsWith("/app/manual")
                                ? "bg-white/60 dark:bg-white/10 text-brand-text shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.05)] border border-white/30 translate-y-[-1px]"
                                : "text-brand-text-secondary hover:text-brand-text hover:bg-white/40 dark:hover:bg-white/5 border border-transparent hover:border-white/20 hover:shadow-sm"
                            }
                        `}
                    >
                        {pathname.startsWith("/app/manual") && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-accent rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                        )}
                        <span className="text-lg">📖</span>
                        <span className={`tracking-wide transition-all duration-300 ${pathname.startsWith("/app/manual") ? 'text-brand-text' : 'text-brand-text-secondary group-hover:text-brand-text group-hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.75)]'}`}>Manual del Agente</span>
                    </Link>
                </nav>

                {/* ── User info + Sign Out ────────────────── */}
                {profile && (
                    <div className="px-4 py-3 bg-white/5 border-t border-brand-border/20 flex items-center gap-3">
                        <Link
                            href="/app/perfil"
                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-all group"
                        >
                            <Avatar
                                name={profile.full_name}
                                imageUrl={profile.avatar_url}
                                size="lg"
                                className="group-hover:ring-2 group-hover:ring-brand-accent/40 transition-all shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-brand-text truncate leading-tight">
                                    {profile.full_name}
                                </p>
                                <p className="text-[10px] font-medium text-brand-accent uppercase tracking-wider mt-0.5">
                                    {profile.role === "admin" ? "Administrador" : "Agente"}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={handleSignOut}
                            title="Cerrar sesión"
                            className="p-2 rounded-lg text-brand-text-secondary/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
