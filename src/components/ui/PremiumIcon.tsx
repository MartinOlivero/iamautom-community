"use client";

import {
    MessageSquare, Library, Calendar, Trophy, Users, User, Settings
} from 'lucide-react';

interface PremiumIconProps {
    href?: string;
    isActive?: boolean;
    className?: string;
    size?: number;
    variant?: "default" | "ghost";
}

export default function PremiumIcon({ href = "", isActive = false, className = "", size = 18, variant = "default" }: PremiumIconProps) {
    let Icon;
    switch (true) {
        case href.startsWith("/app/feed"): Icon = MessageSquare; break;
        case href.startsWith("/app/cursos"): Icon = Library; break;
        case href.startsWith("/app/calendario"): Icon = Calendar; break;
        case href.startsWith("/app/leaderboard"): Icon = Trophy; break;
        case href.startsWith("/app/miembros"): Icon = Users; break;
        case href.startsWith("/app/perfil"): Icon = User; break;
        case href.startsWith("/admin"): Icon = Settings; break;
        default: Icon = MessageSquare; break;
    }

    return (
        <div
            className={`
                flex items-center justify-center rounded-xl shrink-0 transition-all duration-300
                ${isActive
                    ? "bg-gradient-accent text-brand-dark shadow-glow-neon border border-brand-accent/30"
                    : variant === "ghost"
                        ? "bg-transparent text-brand-muted hover:text-brand-text group-hover:text-brand-accent"
                        : "bg-brand-bg-2 dark:bg-black/40 text-brand-text border border-brand-border shadow-[0_2px_4px_rgba(0,0,0,0.05)] group-hover:text-brand-accent group-hover:border-brand-accent/50 group-hover:shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                }
                ${className}
            `}
            style={{ width: size * 2, height: size * 2 }}
        >
            <Icon size={size} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "drop-shadow-sm" : ""} />
        </div>
    );
}
