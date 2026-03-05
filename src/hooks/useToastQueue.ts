"use client";

import { useState, useCallback } from 'react';

export type Toast = {
    id: string;
    type: 'xp_gained' | 'level_up' | 'badge_earned' | 'success' | 'error';
    title: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
};

const TOAST_DURATION = 4000; // 4 segundos

export function useToastQueue() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'> & { id?: string }) => {
        const id = toast.id || crypto.randomUUID();
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto-dismiss después de TOAST_DURATION ms
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, TOAST_DURATION);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, dismissToast };
}
