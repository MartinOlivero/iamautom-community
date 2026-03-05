"use client";

import { useState, useEffect, useId } from 'react'
import { motion } from 'framer-motion'
import { useYouTubeProgress, extractYouTubeId } from '@/hooks/useYouTubeProgress'

type Props = {
    videoUrl: string
    durationMinutes?: number  // el campo "Duración (minutos)" ya existente
    onCanCompleteChange: (canComplete: boolean) => void
}

export function YouTubePlayerWithTracking({
    videoUrl,
    durationMinutes,
    onCanCompleteChange
}: Props) {
    const uid = useId().replace(/:/g, '')
    const playerId = `yt-${uid}`
    const [isPlaying, setIsPlaying] = useState(false)
    const { state, initPlayer } = useYouTubeProgress(playerId)
    const videoId = extractYouTubeId(videoUrl)

    // Cuando el usuario hace clic en el thumbnail, activar el iframe
    const handleThumbnailClick = () => {
        setIsPlaying(true)
        // Inicializar el player de YouTube después de que el iframe esté en el DOM
        setTimeout(() => initPlayer(), 300)
    }

    useEffect(() => {
        onCanCompleteChange(state.canComplete)
    }, [state.canComplete, onCanCompleteChange])

    if (!videoId) {
        return (
            <div className="aspect-video bg-brand-hover-bg rounded-xl flex items-center justify-center">
                <p className="text-brand-muted text-sm">Video no disponible</p>
            </div>
        )
    }

    // Thumbnail — igual que antes, sin cambios visuales
    if (!isPlaying) {
        return (
            <div
                className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-black"
                onClick={handleThumbnailClick}
            >
                {/* Thumbnail de YouTube */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay con botón play — igual al diseño actual */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current ml-1">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                {/* Duración si está disponible */}
                {durationMinutes && (
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                        {durationMinutes} min
                    </div>
                )}
            </div>
        )
    }

    // Iframe con tracking — reemplaza el thumbnail al hacer clic
    return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner-glow border border-white/5">
            <iframe
                id={playerId}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''
                    }`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />

            {/* Barra de progreso de visualización — discreta, abajo del video */}
            {state.hasStarted && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div
                        className="h-full bg-brand-accent shadow-glow-neon transition-all duration-1000"
                        style={{ width: `${state.maxPercentReached * 100}%` }}
                    />
                </div>
            )}
        </div>
    )
}
