"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/insforge/client'
import { motion, AnimatePresence } from 'framer-motion'

export function RedemptionsAdmin() {
    const db = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [redemptions, setRedemptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    const fetchRedemptions = async () => {
        const { data } = await db
            .from('reward_redemptions')
            .select(`
        *,
        profiles:user_id (full_name, avatar_url, email),
        rewards:reward_id (title, emoji, cost_coins)
      `)
            .eq('status', 'pending')
            .order('requested_at', { ascending: false })

        if (data) setRedemptions(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchRedemptions()
    }, [db])

    const handleResolve = async (id: string, status: 'approved' | 'rejected', note?: string) => {
        setProcessing(id)
        try {
            const { error: updateError } = await db
                .from('reward_redemptions')
                .update({
                    status,
                    admin_note: note,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', id)

            if (updateError) throw updateError

            // Si se rechaza, devolver las monedas
            if (status === 'rejected') {
                const redemption = redemptions.find(r => r.id === id)
                if (redemption) {
                    await db.rpc('refund_coins', {
                        p_user_id: redemption.user_id,
                        p_amount: redemption.coins_spent
                    })
                }
            }
            await fetchRedemptions()
        } catch (err) {
            console.error("Error resolving redemption:", err)
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return <div className="text-brand-text-secondary animate-pulse p-8">Cargando solicitudes...</div>

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-brand-text flex items-center gap-3">
                    <span className="p-2 bg-brand-accent/10 rounded-xl border border-brand-accent/20">🎁</span>
                    Canjes Pendientes
                    <span className="ml-2 px-3 py-1 rounded-full bg-brand-accent/20 text-brand-accent text-sm font-bold">
                        {redemptions.length}
                    </span>
                </h3>
                <button
                    onClick={() => { setLoading(true); fetchRedemptions(); }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-brand-text-secondary hover:text-brand-text hover:bg-white/10 transition-all"
                >
                    🔄
                </button>
            </div>

            <AnimatePresence mode="popLayout">
                {redemptions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 rounded-3xl bg-white/5 border border-dashed border-white/10"
                    >
                        <p className="text-5xl mb-4">✨</p>
                        <p className="text-brand-text-secondary font-bold">No hay solicitudes pendientes</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {redemptions.map(r => (
                            <motion.div
                                key={r.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-5 rounded-2xl bg-white/5 dark:bg-black/40 border border-white/10 backdrop-blur-sm shadow-sm hover:border-white/20 transition-all"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={r.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${r.profiles?.full_name}`} alt="" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-brand-text truncate">{r.profiles?.full_name}</p>
                                            <p className="text-xs text-brand-text-secondary truncate">{r.profiles?.email}</p>

                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-2xl">{r.rewards?.emoji}</span>
                                                <span className="font-bold text-brand-text">{r.rewards?.title}</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-electric-blue/20 text-brand-electric-blue border border-brand-electric-blue/20">
                                                    💎 {r.coins_spent}
                                                </span>
                                            </div>

                                            {r.user_message && (
                                                <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-brand-text-secondary italic line-clamp-2">
                                                    &quot;{r.user_message}&quot;
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleResolve(r.id, 'approved')}
                                            disabled={processing === r.id}
                                            className="flex-1 md:flex-none px-4 py-2 bg-brand-success hover:bg-brand-success/90 text-brand-dark rounded-xl text-xs font-black transition-all shadow-glow-green"
                                        >
                                            {processing === r.id ? '...' : 'APROBAR'}
                                        </button>
                                        <button
                                            onClick={() => handleResolve(r.id, 'rejected')}
                                            disabled={processing === r.id}
                                            className="flex-1 md:flex-none px-4 py-2 bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent border border-brand-accent/30 rounded-xl text-xs font-black transition-all"
                                        >
                                            RECHAZAR
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
