"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileData } from "@/hooks/useProfileData";
import Avatar from "@/components/ui/Avatar";
import PlanBadge from "@/components/ui/Badge";
import { getLevelInfo } from "@/lib/levels";

interface ProfileHoverCardProps {
    userId: string | undefined;
    children: ReactNode;
}

/**
 * Format date as "Miembro desde [Mes] [Año]"
 */
function formatMemberSince(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("es-ES", { month: "long" });
    const year = date.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${year}`;
}

/**
 * Format "Activo hace X minutos/horas/días"
 */
function formatLastSeen(updatedAt: string): string {
    const lastSeen = new Date(updatedAt).getTime();
    const now = Date.now();
    const diffMs = now - lastSeen;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Activo ahora";
    if (diffMin < 60) return `Activo hace ${diffMin} min`;
    if (diffHours < 24) return `Activo hace ${diffHours}h`;
    if (diffDays === 1) return "Activo hace 1 día";
    return `Activo hace ${diffDays} días`;
}

export default function ProfileHoverCard({ userId, children }: ProfileHoverCardProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, position: "bottom" as "top" | "bottom" });
    const triggerRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { data, isLoading } = useProfileData(isVisible ? userId : undefined);

    const handleMouseEnter = () => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const vh = window.innerHeight;
                const isBottomHalf = rect.top > vh / 2;

                setCoords({
                    top: isBottomHalf ? rect.top - 8 : rect.bottom + 8,
                    left: rect.left + rect.width / 2,
                    position: isBottomHalf ? "top" : "bottom",
                });
                setIsVisible(true);
            }
        }, 400);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        leaveTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 200);
    };

    const handleCardMouseEnter = () => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    const card = (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onMouseEnter={handleCardMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        position: "fixed",
                        top: coords.top,
                        left: coords.left,
                        transform: coords.position === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                        zIndex: 99999,
                        pointerEvents: "auto",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    }}
                    className="w-[320px] bg-brand-card border border-brand-border rounded-[16px] p-5 overflow-hidden"
                >
                    {isLoading || !data ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (() => {
                        const levelInfo = getLevelInfo(data.level);
                        const isOnlineNow = data.is_online;

                        return (
                            <div>
                                {/* Header: Avatar + Name/Status */}
                                <div className="flex gap-4">
                                    {/* Avatar 96px with level color ring */}
                                    <div className="shrink-0">
                                        <div
                                            className="w-[103px] h-[103px] rounded-full p-[3.5px] flex items-center justify-center"
                                            style={{ background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}88)` }}
                                        >
                                            <Avatar
                                                name={data.full_name}
                                                imageUrl={data.avatar_url}
                                                className="!w-[96px] !h-[96px] !min-w-[96px] !min-h-[96px] text-3xl !border-4 !border-brand-card !rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Name + Status */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className="text-lg font-bold text-brand-text truncate leading-tight">
                                            {data.full_name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PlanBadge planType={data.plan_type} />
                                            <span className="text-[10px] bg-brand-hover-bg text-brand-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter self-center">
                                                LVL {getLevelInfo(data.level).number}
                                            </span>
                                            <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded font-bold self-center">
                                                {getLevelInfo(data.level).label}
                                            </span>
                                        </div>

                                        {/* Active status */}
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <div
                                                className={`w-2 h-2 rounded-full ${isOnlineNow ? "bg-emerald-500 animate-pulse" : "bg-brand-muted/40"}`}
                                            />
                                            <span className={`text-xs ${isOnlineNow ? "text-emerald-500" : "text-brand-muted"}`}>
                                                {formatLastSeen(data.updated_at)}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(data as any).location && (
                                            <div className="flex items-center gap-1 text-xs text-brand-muted mt-1">
                                                <span>📍</span>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <span>{(data as any).location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {data.bio && (
                                    <>
                                        <div className="my-3 border-t border-brand-border" />
                                        <p className="text-sm text-brand-muted leading-snug line-clamp-2">
                                            {data.bio}
                                        </p>
                                    </>
                                )}

                                {/* Stats separator */}
                                <div className="my-3 border-t border-brand-border" />

                                {/* Level + XP row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="text-xs font-bold uppercase tracking-wide"
                                            style={{ color: levelInfo.color }}
                                        >
                                            Nivel {levelInfo.number}
                                        </span>
                                        <span className="text-brand-muted text-xs">—</span>
                                        <span className="text-xs text-brand-text font-medium">
                                            {levelInfo.icon} {levelInfo.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">⚡</span>
                                        <span className="text-xs font-bold text-brand-accent">
                                            {data.total_xp.toLocaleString()} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Member since */}
                                <p className="mt-3 text-[11px] text-brand-muted flex items-center gap-1">
                                    <span>📅</span>
                                    <span>Miembro desde {formatMemberSince(data.created_at)}</span>
                                </p>
                            </div>
                        );
                    })()}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div
            ref={triggerRef}
            className="inline-flex"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {typeof document !== "undefined" && createPortal(card, document.body)}
        </div>
    );
}
