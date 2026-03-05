"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";
import XPToast from "@/components/gamification/XPToast";
import { useCallback } from "react";
import { useToastQueue } from "@/hooks/useToastQueue";
import { useGamificationRealtime } from "@/hooks/useGamificationRealtime";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { useLevelUpModal } from "@/hooks/useLevelUpModal";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { toasts, addToast, dismissToast } = useToastQueue();
    const { isOpen, levelData, triggerLevelUp, closeLevelUp } = useLevelUpModal();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNotification = useCallback((notification: any) => {
        if (notification.type === 'level_up') {
            triggerLevelUp({
                level_number: notification.metadata.new_level,
                level_name: notification.metadata.level_name,
            });
        } else {
            addToast({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                metadata: notification.metadata,
            });
        }
    }, [addToast, triggerLevelUp]);

    const handleXPChange = useCallback(() => {
        // El sidebar se actualiza solo via useRealtimeProfile en Sidebar.tsx
    }, []);

    useGamificationRealtime({
        onNotification: handleNotification,
        onXPChange: handleXPChange,
    });
    return (
        <div className="min-h-screen relative overflow-hidden bg-brand-bg dark:bg-brand-dark transition-colors duration-500">
            {/* 3D Static Mesh Background */}
            <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
                <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark" />
                <div className="absolute inset-0 backdrop-blur-[100px]" />
            </div>

            {/* Sidebar — desktop only */}
            <Sidebar />

            {/* Main content */}
            <div className="relative z-10 lg:ml-[280px] flex flex-col min-h-screen transition-all duration-300">
                <Topbar />
                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-[1400px] mx-auto w-full">
                    {children}
                </main>
            </div>

            <MobileNav />
            <XPToast toasts={toasts} onDismiss={dismissToast} />
            <LevelUpModal
                isOpen={isOpen}
                levelData={levelData}
                onClose={closeLevelUp}
            />
            <WelcomeModal />
        </div>
    );
}
