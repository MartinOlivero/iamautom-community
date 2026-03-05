"use client";

import { useEffect } from 'react';
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
    const insforge = createClient();

    useEffect(() => {
        if (!user?.id) return;

        const channel = `gamification:${user.id}`;

        async function setupRealtime() {
            try {
                // Ensure connection
                if (!insforge.realtime.isConnected) {
                    await insforge.realtime.connect();
                }

                // Subscribe to user channel
                const { ok } = await insforge.realtime.subscribe(channel);
                if (!ok) return;

                // Listen for notification inserts
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                insforge.realtime.on('notification_inserted', (notification: any) => {
                    if (['level_up', 'badge_earned'].includes(notification.type)) {
                        onNotification({
                            id: notification.id,
                            type: notification.type,
                            title: notification.title,
                            message: notification.body || notification.message,
                            metadata: notification.metadata || {}
                        });
                        onXPChange();
                    }
                });

                // Listen for XP event inserts
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                insforge.realtime.on('gamification_event_inserted', (event: any) => {
                    if (event.points > 0) {
                        onNotification({
                            id: event.id,
                            type: 'xp_gained',
                            title: `+${event.points} Sinapsis`,
                            message: event.description,
                            metadata: {
                                points: event.points,
                                event_type: event.event_type
                            }
                        });
                        onXPChange();
                    }
                });

            } catch (err) {
                console.error("Realtime setup failed:", err);
            }
        }

        setupRealtime();

        return () => {
            insforge.realtime.off('notification_inserted');
            insforge.realtime.off('gamification_event_inserted');
            insforge.realtime.unsubscribe(channel);
        };
    }, [user?.id, onNotification, onXPChange, insforge]);
}
