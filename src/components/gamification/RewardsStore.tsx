"use client";

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/insforge/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { motion } from 'framer-motion'
import { GamificationTooltip } from '@/components/ui/GamificationTooltip'

type Reward = {
    id: string
    title: string
    description: string
    emoji: string
    cost_coins: number
    reward_type: string
    stock: number | null
    is_active: boolean
}

export function RewardsStore() {
    const supabase = createClient()
    const { user } = useAuth()
    const [rewards, setRewards] = useState<Reward[]>([])
    const [userCoins, setUserCoins] = useState(0)
    const [loading, setLoading] = useState(true)
    const [redeeming, setRedeeming] = useState<string | null>(null)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        if (!user?.id) return

        async function fetchData() {
            const [rewardsRes, profileRes] = await Promise.all([
                supabase.from('rewards').select('*').eq('is_active', true).order('cost_coins'),
                supabase.from('profiles').select('coins').eq('id', user?.id).single()
            ])

            if (rewardsRes.data) setRewards(rewardsRes.data as Reward[])
            if (profileRes.data) setUserCoins(profileRes.data.coins)
            setLoading(false)
        }

        fetchData()
    }, [user?.id, supabase])

    const handleRedeem = async (reward: Reward, userMessage?: string) => {
        if (!user?.id) return

        setRedeeming(reward.id)
        const { data } = await supabase.rpc('redeem_reward', {
            p_user_id: user.id,
            p_reward_id: reward.id,
            p_user_message: userMessage || null
        })

        if (data?.success) {
            setUserCoins(prev => prev - reward.cost_coins)
            setMessage({ text: `✅ Solicitud enviada. Te contactaremos pronto.`, type: 'success' })
        } else {
            setMessage({ text: `❌ ${data?.error || 'Error al procesar el canje'}`, type: 'error' })
        }
        setRedeeming(null)
        setTimeout(() => setMessage(null), 5000)
    }

    if (loading) return <div className="text-brand-text-secondary animate-pulse">Cargando tienda...</div>

    return (
        <div className="space-y-6">
            {/* Balance de monedas */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/10 backdrop-blur-sm shadow-inner-glow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-electric-blue/10 to-transparent pointer-events-none" />
                <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">💎</span>
                <div>
                    <div className="text-[11px] font-bold text-brand-electric-blue uppercase tracking-[0.2em] mb-0.5">
                        <span className="flex items-center gap-1.5">
                            Sinapsis Canjeables
                            <GamificationTooltip content="Sinapsis disponibles para canjear. Al canjear se descuentan, pero tu nivel no se ve afectado." />
                        </span>
                    </div>
                    <p className="text-3xl font-black text-brand-text tracking-tight">{userCoins.toLocaleString()}</p>
                </div>
            </div>

            {/* Mensaje de feedback */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm font-bold text-center border shadow-lg ${message.type === 'success'
                        ? 'bg-brand-success/10 border-brand-success/30 text-brand-success'
                        : 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Grid de recompensas */}
            <div className="grid gap-4">
                {rewards.map((reward, i) => {
                    const canAfford = userCoins >= reward.cost_coins
                    const outOfStock = reward.stock !== null && reward.stock <= 0

                    return (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                            className={`
                p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                ${canAfford && !outOfStock
                                    ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-brand-electric-blue/30 shadow-sm'
                                    : 'border-white/10 bg-white/3 opacity-70'}
              `}
                        >
                            {canAfford && !outOfStock && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-brand-electric-blue/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            )}

                            <div className="flex items-start justify-between gap-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-glow-blue border border-white/10 shrink-0">
                                        {reward.emoji}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-display font-extrabold text-brand-text text-lg leading-tight h-12 flex items-center">
                                            {reward.title}
                                        </h3>
                                        <p className="text-sm text-brand-text-secondary mt-2 line-clamp-2 leading-relaxed">
                                            {reward.description}
                                        </p>
                                        {reward.stock !== null && (
                                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                                                {reward.stock > 0 ? `${reward.stock} disponibles` : 'Sin stock'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-right">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Costo</p>
                                        <p className="text-lg font-black text-brand-text">💎 {reward.cost_coins}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRedeem(reward)}
                                        disabled={!canAfford || outOfStock || redeeming === reward.id}
                                        className={`
                      w-full px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 shadow-lg
                      ${canAfford && !outOfStock
                                                ? 'bg-brand-success hover:bg-brand-success/90 text-brand-dark scale-100 hover:scale-[1.03] active:scale-95'
                                                : 'bg-white/10 text-brand-text-secondary cursor-not-allowed border border-white/10'}
                    `}
                                    >
                                        {redeeming === reward.id ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" />
                                                ...
                                            </span>
                                        ) :
                                            outOfStock ? 'AGOTADO' :
                                                !canAfford ? 'SALDO INSUF.' : 'CANJEAR'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
