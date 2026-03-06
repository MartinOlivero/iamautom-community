"use client";

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/insforge/client';
import { useAuth } from '@/components/auth/AuthProvider';

type GamificationNotification = {
    id: string;
    type: 'xp_gained' | 'level_up' | 'badge_earned';
    title: string;
    message: string;
    metadata: {
        points?: number;
        event_type?: string;
        new_level?: number;
        level_name?: string;
        badge_name?: string;
        badge_emoji?: string;
    };
};

type Options = {
    onNotification: (notification: GamificationNotification) => void;
    onXPChange: () => void;
};

export function useGamificationRealtime({ onNotification, onXPChange }: Options) {
    const { user } = useAuth();
    const onNotificationRef = useRef(onNotification);
    const onXPChangeRef = useRef(onXPChange);

    // Keep refs up to date without triggering re-subscriptions
    useEffect(() => {
        onNotificationRef.current = onNotification;
    }, [onNotification]);

    useEffect(() => {
        onXPChangeRef.current = onXPChange;
    }, [onXPChange]);

    useEffect(() => {
        if (!user?.id) return;

        const insforge = createClient();
        const channel = `gamification:${user.id}`;

        async function setupRealtime() {
            try {
                if (!insforge.realtime.isConnected) {
                    await insforge.realtime.connect();
                }

                const { ok } = await insforge.realtime.subscribe(channel);
                if (!ok) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                insforge.realtime.on('notification_inserted', (notification: any) => {
                    if (['level_up', 'badge_earned'].includes(notification.type)) {
                        onNotificationRef.current({
                            id: notification.id,
                            type: notification.type,
                            title: notification.title,
                            message: notification.body || notification.message,
                            metadata: notification.metadata || {}
                        });
                        onXPChangeRef.current();
                    }
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                insforge.realtime.on('gamification_event_inserted', (event: any) => {
                    if (event.points > 0) {
                        onNotificationRef.current({
                            id: event.id,
                            type: 'xp_gained',
                            title: `+${event.points} Sinapsis`,
                            message: event.description,
                            metadata: {
                                points: event.points,
                                event_type: event.event_type
                            }
                        });
                        onXPChangeRef.current();
                    }
                });

            } catch (err) {
                console.error("Realtime setup failed:", err);
            }
        }

        setupRealtime();

        // Reconnect on visibility change (tab switch / inactivity)
        function handleVisibilityChange() {
            if (document.visibilityState === "visible" && !insforge.realtime.isConnected) {
                setupRealtime();
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            insforge.realtime.off('notification_inserted');
            insforge.realtime.off('gamification_event_inserted');
            insforge.realtime.unsubscribe(channel);
        };
    }, [user?.id]); // Only re-run when user changes
}
