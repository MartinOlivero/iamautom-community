"use client";

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/insforge/client'

const STEPS = [
    {
        emoji: '⚡',
        title: '¡Bienvenido a la red, Agente!',
        description: 'IamAutom Community no es una plataforma normal. Acá cada acción que tomás tiene peso. Participar, aprender y aportar te hace crecer.',
        highlight: null,
    },
    {
        emoji: '🚀',
        title: 'Ganás Sinapsis por todo',
        description: 'Publicar posts, comentar, completar lecciones, mantener tu racha diaria — todo suma Sinapsis. Con ellas subís de nivel y canjeás recompensas reales.',
        highlight: '⚡ Sinapsis → 🚀 Nivel → 🏪 Tienda',
    },
    {
        emoji: '🧠',
        title: 'Desbloqueá Nodos Neurales',
        description: 'Son logros que aparecen automáticamente en tu perfil cuando alcanzás ciertos hitos. No hay que reclamarlos — simplemente llegás y aparecen.',
        highlight: null,
    },
    {
        emoji: '🏆',
        title: 'Sumate a los Desafíos del mes',
        description: 'Cada mes hay misiones con objetivos específicos y Sinapsis extra como recompensa. Los encontrás en la sección Desafíos del menú.',
        highlight: null,
    },
    {
        emoji: '📖',
        title: '¿Dudas? Consultá el Manual',
        description: 'En "Manual del Agente" encontrás todo el sistema explicado en detalle — niveles, Sinapsis, Nodos, Tienda y más.',
        highlight: null,
    },
]

export function WelcomeModal() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(0)

    // Verificar si es el primer login del usuario
    useEffect(() => {
        if (!user?.id) return

        const key = `welcome_shown_${user.id}`
        const alreadyShown = localStorage.getItem(key)

        if (!alreadyShown) {
            const db = createClient()
            // Mostrar solo si el perfil fue creado hace menos de 24 horas
            db
                .from('profiles')
                .select('created_at')
                .eq('id', user.id)
                .single()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then(({ data }: any) => {
                    if (data) {
                        const hoursSinceCreation =
                            (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60)
                        if (hoursSinceCreation < 24) {
                            setIsOpen(true)
                            localStorage.setItem(key, 'true')
                        }
                    }
                })
        }
    }, [user?.id])

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(prev => prev + 1)
        } else {
            setIsOpen(false)
        }
    }

    const currentStep = STEPS[step]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-md bg-brand-card dark:bg-brand-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                            {/* Barra de progreso de pasos */}
                            <div className="flex gap-1 p-4 pb-0">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-orange-500' : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Contenido */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-8 text-center space-y-4"
                                >
                                    <div className="text-6xl">{currentStep.emoji}</div>
                                    <h2 className="text-2xl font-black text-brand-text">
                                        {currentStep.title}
                                    </h2>
                                    <p className="text-brand-muted text-sm leading-relaxed">
                                        {currentStep.description}
                                    </p>
                                    {currentStep.highlight && (
                                        <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-500 text-sm font-bold">
                                            {currentStep.highlight}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Footer */}
                            <div className="p-6 pt-0 flex items-center justify-between">
                                <span className="text-xs text-brand-muted">
                                    {step + 1} de {STEPS.length}
                                </span>
                                <div className="flex gap-2">
                                    {step > 0 && (
                                        <button
                                            onClick={() => setStep(prev => prev - 1)}
                                            className="px-4 py-2 rounded-xl text-sm text-brand-muted hover:text-brand-text transition-colors"
                                        >
                                            ← Anterior
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        className="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-all shadow-glow-orange"
                                    >
                                        {step === STEPS.length - 1 ? '¡Empezar! 🚀' : 'Siguiente →'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
