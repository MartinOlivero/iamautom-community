"use client";

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

type LevelUpData = {
    level_number: number
    level_name: string
}

type Props = {
    isOpen: boolean
    levelData: LevelUpData | null
    onClose: () => void
}

// Colores y configuración por nivel — deben coincidir con level_config en Supabase
const LEVEL_CONFIG: Record<number, { color: string; gradient: string; icon: string; glow: string }> = {
    1: { color: '#9CA3AF', gradient: 'from-gray-700 to-gray-900', icon: '🌱', glow: 'shadow-gray-500/30' },
    2: { color: '#60A5FA', gradient: 'from-blue-700 to-blue-900', icon: '📚', glow: 'shadow-blue-500/40' },
    3: { color: '#34D399', gradient: 'from-emerald-700 to-emerald-900', icon: '⚡', glow: 'shadow-emerald-500/40' },
    4: { color: '#A78BFA', gradient: 'from-violet-700 to-violet-900', icon: '🔧', glow: 'shadow-violet-500/40' },
    5: { color: '#F59E0B', gradient: 'from-amber-700 to-amber-900', icon: '🧠', glow: 'shadow-amber-500/40' },
    6: { color: '#F97316', gradient: 'from-orange-700 to-orange-900', icon: '🏗️', glow: 'shadow-orange-500/40' },
    7: { color: '#EF4444', gradient: 'from-red-700 to-red-900', icon: '🚀', glow: 'shadow-red-500/40' },
    8: { color: '#EC4899', gradient: 'from-pink-700 to-pink-900', icon: '🎓', glow: 'shadow-pink-500/40' },
    9: { color: '#8B5CF6', gradient: 'from-purple-700 to-purple-900', icon: '👑', glow: 'shadow-purple-500/50' },
}

export function LevelUpModal({ isOpen, levelData, onClose }: Props) {
    const confettiFired = useRef(false)

    useEffect(() => {
        if (isOpen && levelData && !confettiFired.current) {
            confettiFired.current = true

            const config = LEVEL_CONFIG[levelData.level_number] || LEVEL_CONFIG[1]

            // Confetti desde ambos lados — estilo celebración épica
            const fire = (particleRatio: number, opts: confetti.Options) => {
                confetti({
                    origin: { y: 0.7 },
                    ...opts,
                    particleCount: Math.floor(200 * particleRatio),
                })
            }

            setTimeout(() => {
                fire(0.25, { spread: 26, startVelocity: 55, colors: [config.color, '#ffffff'] })
                fire(0.2, { spread: 60, colors: [config.color, '#ffffff'] })
                fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: [config.color] })
                fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
                fire(0.1, { spread: 120, startVelocity: 45 })
            }, 300)
        }

        if (!isOpen) {
            confettiFired.current = false
        }
    }, [isOpen, levelData])

    if (!levelData) return null
    const config = LEVEL_CONFIG[levelData.level_number] ?? LEVEL_CONFIG[1]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className={`
              pointer-events-auto relative overflow-hidden
              w-full max-w-sm rounded-3xl p-8 text-center
              bg-gradient-to-b ${config.gradient}
              border border-white/20 shadow-2xl ${config.glow}
            `}
                    >

                        {/* Glow de fondo animado */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{ background: `radial-gradient(circle at center, ${config.color}33, transparent 70%)` }}
                        />

                        {/* Ícono del nivel */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="text-8xl mb-6 relative z-10 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            {config.icon}
                        </motion.div>

                        {/* Texto NIVEL ALCANZADO */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm font-black tracking-[0.3em] uppercase mb-2 relative z-10"
                            style={{ color: config.color }}
                        >
                            ¡NIVEL ALCANZADO!
                        </motion.p>

                        {/* Nombre del nivel */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl font-black text-white mb-2 relative z-10 tracking-tight"
                        >
                            {levelData.level_name}
                        </motion.h2>

                        {/* Número de nivel */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-base text-white/60 mb-10 relative z-10 font-medium"
                        >
                            Has desbloqueado el Nivel {levelData.level_number}
                        </motion.p>

                        {/* Botón */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="relative z-10 w-full py-4 rounded-2xl font-black text-base text-black transition-all shadow-xl"
                            style={{ backgroundColor: config.color }}
                        >
                            ¡SEGUIR ESCALANDO! 🚀
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
