"use client";

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/insforge/client'
import { useAuth } from '@/components/auth/AuthProvider'

type Challenge = {
    id: string
    title: string
    description: string
    emoji: string
    challenge_type: string
    target_value: number
    reward_coins: number
    ends_at: string
    participant?: {
        current_value: number
        completed: boolean
        joined_at: string
    }
}

function getDaysLeft(endsAt: string) {
    const diff = new Date(endsAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
    const supabase = createClient()
    const { user } = useAuth()
    const [participant, setParticipant] = useState(challenge.participant)
    const [joining, setJoining] = useState(false)

    const progress = participant
        ? Math.min(100, (participant.current_value / challenge.target_value) * 100)
        : 0

    const daysLeft = getDaysLeft(challenge.ends_at)
    const isCompleted = participant?.completed ?? false
    const hasJoined = !!participant

    const handleJoin = async () => {
        if (!user?.id) return
        setJoining(true)
        const { data } = await supabase.rpc('join_challenge', {
            p_user_id: user.id,
            p_challenge_id: challenge.id
        })
        if (data?.success) {
            setParticipant({ current_value: 0, completed: false, joined_at: new Date().toISOString() })
        }
        setJoining(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className={`
        p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group
        ${isCompleted
                    ? 'border-brand-success/40 bg-brand-success/5 shadow-glow-green'
                    : hasJoined
                        ? 'border-brand-electric-blue/30 bg-white/5'
                        : 'border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20'}
      `}
        >
            {isCompleted && (
                <div className="absolute top-0 right-0 p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-success text-brand-dark text-xs font-black shadow-lg">✓</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner border border-white/10 shrink-0">
                    {challenge.emoji}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-display font-extrabold text-brand-text text-lg leading-tight">
                        {challenge.title}
                    </h3>
                    <p className="text-sm text-brand-text-secondary mt-1 leading-relaxed">
                        {challenge.description}
                    </p>
                </div>
            </div>

            {/* Progreso */}
            <AnimatePresence>
                {hasJoined && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6"
                    >
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[11px] font-black text-brand-text-secondary uppercase tracking-widest">
                                Progreso Actual
                            </span>
                            <span className="text-sm font-mono font-bold text-brand-text">
                                {participant!.current_value} <span className="text-brand-text-secondary/50">/</span> {challenge.target_value}
                            </span>
                        </div>
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.2, ease: 'circOut' }}
                                className={`h-full rounded-full ${isCompleted ? 'bg-gradient-to-r from-brand-success to-emerald-400' : 'bg-gradient-to-r from-brand-electric-blue to-brand-accent'} shadow-glow-blue`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-sm">💎</span>
                        <span className="text-xs font-black text-brand-text">{challenge.reward_coins}</span>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${daysLeft <= 3 ? 'text-brand-accent animate-pulse' : 'text-brand-text-secondary'}`}>
                        <span className="text-sm">⏳</span>
                        {daysLeft === 0 ? '¡HOY CIERRA!' : `${daysLeft} DÍAS`}
                    </div>
                </div>

                {!hasJoined ? (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="px-6 py-2 bg-brand-electric-blue hover:bg-brand-electric-blue/90 text-brand-dark rounded-xl text-xs font-black transition-all shadow-glow-blue scale-100 active:scale-95"
                    >
                        {joining ? '...' : 'INICIAR DESAFÍO'}
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${isCompleted ? 'bg-brand-success/20 border-brand-success text-brand-success' : 'bg-brand-electric-blue/20 border-brand-electric-blue text-brand-electric-blue'}`}>
                            {isCompleted ? 'COMPLETADO' : 'EN CURSO'}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
