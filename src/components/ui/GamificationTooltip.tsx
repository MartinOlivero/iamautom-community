"use client";

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
    content: string
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export function GamificationTooltip({ content, position = 'top' }: Props) {
    const [visible, setVisible] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)

    const updatePosition = () => {
        if (!buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()

        const positions = {
            top: {
                top: rect.top + window.scrollY - 8,
                left: rect.left + window.scrollX + rect.width / 2,
            },
            bottom: {
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX + rect.width / 2,
            },
            left: {
                top: rect.top + window.scrollY + rect.height / 2,
                left: rect.left + window.scrollX - 8,
            },
            right: {
                top: rect.top + window.scrollY + rect.height / 2,
                left: rect.right + window.scrollX + 8,
            },
        }
        setCoords(positions[position])
    }

    const handleMouseEnter = () => {
        updatePosition()
        setVisible(true)
    }

    const transformOrigin = {
        top: 'translateX(-50%) translateY(-100%)',
        bottom: 'translateX(-50%) translateY(0%)',
        left: 'translateX(-100%) translateY(-50%)',
        right: 'translateX(0%) translateY(-50%)',
    }

    const tooltip = (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        transform: transformOrigin[position],
                        zIndex: 99999,
                        pointerEvents: 'none',
                    }}
                    className="w-56 p-3 rounded-xl bg-gray-800 border border-white/20 text-xs text-gray-300 leading-relaxed shadow-2xl"
                >
                    {content}
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <button
                ref={buttonRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setVisible(false)}
                onFocus={handleMouseEnter}
                onBlur={() => setVisible(false)}
                className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 text-white/60 hover:text-white text-xs font-bold flex items-center justify-center transition-all ml-1.5 shrink-0"
                aria-label="Más información"
            >
                ?
            </button>

            {/* Renderizar el tooltip fuera del árbol DOM con portal */}
            {typeof document !== 'undefined' &&
                createPortal(tooltip, document.body)
            }
        </>
    )
}
