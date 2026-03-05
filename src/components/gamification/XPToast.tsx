"use client";

import { motion, AnimatePresence } from 'framer-motion';

type Toast = {
    id: string;
    type: 'xp_gained' | 'level_up' | 'badge_earned' | 'challenge_completed' | 'success' | 'error';
    title: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
};

type Props = {
    toasts: Toast[];
    onDismiss: (id: string) => void;
};

const TOAST_CONFIG = {
    xp_gained: {
        icon: '⚡',
        bgColor: 'bg-green-900/90',
        borderColor: 'border-green-500/50',
        titleColor: 'text-green-400',
    },
    level_up: {
        icon: '🚀',
        bgColor: 'bg-purple-900/90',
        borderColor: 'border-purple-500/50',
        titleColor: 'text-purple-400',
    },
    badge_earned: {
        icon: '🧠',
        bgColor: 'bg-orange-900/90',
        borderColor: 'border-orange-500/50',
        titleColor: 'text-orange-400',
    },
    challenge_completed: {
        icon: '🏆',
        bgColor: 'bg-blue-900/90',
        borderColor: 'border-blue-500/50',
        titleColor: 'text-blue-400',
    },
    success: {
        icon: '✅',
        bgColor: 'bg-emerald-900/90',
        borderColor: 'border-emerald-500/50',
        titleColor: 'text-emerald-400',
    },
    error: {
        icon: '❌',
        bgColor: 'bg-red-900/90',
        borderColor: 'border-red-500/50',
        titleColor: 'text-red-400',
    },
};

export default function XPToast({ toasts = [], onDismiss }: Props) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const config = TOAST_CONFIG[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 80, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border
                backdrop-blur-md shadow-lg pointer-events-auto cursor-pointer
                ${config.bgColor} ${config.borderColor}
              `}
                            onClick={() => onDismiss(toast.id)}
                        >
                            <span className="text-2xl">{config.icon}</span>
                            <div className="min-w-0">
                                <p className={`font-bold text-sm ${config.titleColor} truncate`}>
                                    {toast.title}
                                </p>
                                <p className="text-xs text-gray-200 opacity-90">{toast.message}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
