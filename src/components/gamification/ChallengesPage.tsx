"use client";

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/insforge/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRefreshOnTabReturn } from '@/hooks/useVisibilityRefresh'
import { ChallengeCard } from './ChallengeCard'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { GamificationTooltip } from '@/components/ui/GamificationTooltip'

export function ChallengesPage() {
    const router = useRouter()
    const db = createClient()
    const { user } = useAuth()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [challenges, setChallenges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recommendation, setRecommendation] = useState<any>(null)
    const [loadingRec, setLoadingRec] = useState(false)

    const fetchChallenges = useCallback(async () => {
        if (!user?.id) return

        const { data } = await db
            .from('challenges')
            .select(`
            *,
            participant:challenge_participants(
              current_value, completed, joined_at
            )
          `)
            .eq('is_active', true)
            .lte('starts_at', new Date().toISOString())
            .gte('ends_at', new Date().toISOString())
            .eq('challenge_participants.user_id', user?.id)
            .order('ends_at', { ascending: true });

        if (data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setChallenges(data.map((c: any) => ({
                ...c,
                participant: c.participant?.[0] || null
            })))
        }
        setLoading(false)
    }, [user?.id, db])

    useRefreshOnTabReturn(fetchChallenges);

    useEffect(() => {
        if (!user?.id) return

        async function fetchRecommendation() {
            if (!user?.id) return
            setLoadingRec(true)
            try {
                // Primero intentamos ver si ya hay una guardada que no haya caducado
                const { data: existing } = await db
                    .from('user_recommendations')
                    .select('*, challenges(*)')
                    .eq('user_id', user.id)
                    .single()

                if (existing) {
                    setRecommendation({
                        ...existing,
                        title: existing.challenges?.title
                    })
                } else {
                    // Si no hay, la generamos
                    const res = await fetch('/api/recommend-challenge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id })
                    })
                    const data = await res.json()
                    if (!data.error) setRecommendation(data)
                }
            } catch (err) {
                console.error('Error fetching recommendation:', err)
            } finally {
                setLoadingRec(false)
            }
        }

        fetchChallenges()
        fetchRecommendation()
    }, [user?.id, db, fetchChallenges])

    const handleAcceptRecommendation = async () => {
        if (!user || !recommendation) return
        await db
            .from('user_recommendations')
            .update({ was_accepted: true })
            .eq('user_id', user.id)

        router.push(`/app/desafios?id=${recommendation.challengeId}`)
    }

    if (loading) return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto p-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-48 w-full bg-white/5 rounded-2xl animate-pulse" />
            ))}
        </div>
    )

    const active = challenges.filter(c => !c.participant?.completed)
    const completed = challenges.filter(c => c.participant?.completed)

    return (
        <div className="space-y-10 max-w-3xl mx-auto py-4 px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
            >
                <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-electric-blue to-transparent rounded-full" />
                <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black text-brand-text tracking-tight uppercase italic">🏆 Desafíos Mensuales</h2>
                    <GamificationTooltip content="Misiones mensuales con recompensas especiales. Uníte antes de que termine el mes." />
                </div>
                <p className="text-brand-text-secondary text-sm mt-3 max-w-md font-medium">
                    Cumplí objetivos estratégicos para ganar <span className="text-brand-electric-blue">Sinapsis</span> y demostrar tu compromiso con la comunidad.
                </p>
            </motion.div>

            {/* Recomendación IA */}
            <AnimatePresence>
                {(loadingRec || recommendation) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/30 shadow-glow-indigo relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🤖</span>
                        </div>

                        {loadingRec ? (
                            <div className="flex flex-col items-center py-4">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-sm text-indigo-300 font-medium animate-pulse">Analizando tu potencial...</p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                                        Recomendado por IA
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Estás listo para: <span className="text-indigo-300">{recommendation.title}</span>
                                </h3>
                                <p className="text-sm text-brand-text-secondary leading-relaxed mb-4 max-w-xl">
                                    {recommendation.reasoning}
                                </p>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <button
                                        onClick={handleAcceptRecommendation}
                                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-glow-indigo active:scale-95"
                                    >
                                        EMPEZAR DESAFÍO →
                                    </button>
                                    <p className="text-xs text-indigo-300/80 italic font-medium">
                                        &quot;{recommendation.motivational_message || recommendation.motivationalMessage}&quot;
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desafíos activos */}
            {active.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text-secondary">Disponibles</h3>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                    <div className="grid gap-6">
                        {active.map(c => (
                            <ChallengeCard key={c.id} challenge={c} />
                        ))}
                    </div>
                </div>
            )}

            {/* Completados */}
            {completed.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-success/50">Logros del Mes</h3>
                        <div className="flex-1 h-[1px] bg-brand-success/10" />
                    </div>
                    <div className="grid gap-6">
                        {completed.map(c => (
                            <ChallengeCard key={c.id} challenge={c} />
                        ))}
                    </div>
                </div>
            )}

            {challenges.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 rounded-3xl bg-white/3 border border-dashed border-white/10"
                >
                    <p className="text-6xl mb-6 grayscale h-16">🏜️</p>
                    <p className="text-brand-text font-bold text-lg leading-tight">No hay desafíos activos en este momento.</p>
                    <p className="text-brand-text-secondary text-sm mt-2">¡Volvé pronto para nuevas misiones!</p>
                </motion.div>
            )}
        </div>
    )
}
