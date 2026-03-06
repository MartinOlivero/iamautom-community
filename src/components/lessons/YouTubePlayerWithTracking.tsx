"use client";

import { useState, useEffect, useId, useRef } from 'react'
import { motion } from 'framer-motion'
import { useYouTubeProgress, extractYouTubeId } from '@/hooks/useYouTubeProgress'

type Props = {
    videoUrl: string
    durationMinutes?: number
    onCanCompleteChange: (canComplete: boolean) => void
}

function extractLoomId(url: string): string | null {
    if (!url) return null
    const match = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/)
    return match ? match[1] : null
}

function detectPlatform(url: string): 'youtube' | 'loom' | null {
    if (extractYouTubeId(url)) return 'youtube'
    if (extractLoomId(url)) return 'loom'
    return null
}

const COMPLETION_THRESHOLD = 0.8

/**
 * Loom player — embeds Loom directly (native preview).
 * Fetches real video duration from Loom oEmbed API.
 * Timer starts on iframe load, pauses when tab is hidden.
 */
function LoomPlayer({ videoId, durationMinutes, onCanCompleteChange }: {
    videoId: string
    durationMinutes?: number
    onCanCompleteChange: (canComplete: boolean) => void
}) {
    const watchedRef = useRef(0)
    const [percent, setPercent] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const [realDuration, setRealDuration] = useState<number | null>(null)

    // Use real duration from Loom, fallback to durationMinutes
    const totalSeconds = realDuration ?? (durationMinutes || 5) * 60
    const canComplete = percent >= COMPLETION_THRESHOLD

    useEffect(() => {
        onCanCompleteChange(canComplete)
    }, [canComplete, onCanCompleteChange])

    // Fetch real duration from Loom oEmbed
    useEffect(() => {
        fetch(`https://www.loom.com/v1/oembed?url=https://www.loom.com/share/${videoId}`)
            .then(res => res.json())
            .then(data => {
                if (data.duration) {
                    setRealDuration(Math.ceil(data.duration))
                }
            })
            .catch(() => { /* fallback to durationMinutes */ })
    }, [videoId])

    // Start timer when we have the duration
    useEffect(() => {
        if (totalSeconds <= 0) return

        const tick = () => {
            watchedRef.current += 1
            setPercent(Math.min(1, watchedRef.current / totalSeconds))
        }

        intervalRef.current = setInterval(tick, 1000)

        const handleVisibility = () => {
            if (document.hidden) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
            } else if (!intervalRef.current) {
                intervalRef.current = setInterval(tick, 1000)
            }
        }

        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [totalSeconds])

    const displayMinutes = realDuration ? Math.ceil(realDuration / 60) : durationMinutes

    return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner-glow border border-white/5">
            <iframe
                src={`https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
            />

            {/* Duration badge */}
            {displayMinutes && percent < 1 && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 pointer-events-none">
                    {displayMinutes} min
                </div>
            )}

            {/* Progress bar */}
            {percent > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div
                        className="h-full bg-purple-500 transition-all duration-1000"
                        style={{ width: `${percent * 100}%` }}
                    />
                </div>
            )}
        </div>
    )
}

/** Main component — auto-detects YouTube or Loom */
export function YouTubePlayerWithTracking({
    videoUrl,
    durationMinutes,
    onCanCompleteChange
}: Props) {
    const uid = useId().replace(/:/g, '')
    const playerId = `yt-${uid}`
    const [isPlaying, setIsPlaying] = useState(false)
    const { state, initPlayer } = useYouTubeProgress(playerId)

    const platform = detectPlatform(videoUrl)
    const youtubeId = extractYouTubeId(videoUrl)
    const loomId = extractLoomId(videoUrl)

    // YouTube tracking
    useEffect(() => {
        if (platform === 'youtube') {
            onCanCompleteChange(state.canComplete)
        }
    }, [state.canComplete, onCanCompleteChange, platform])

    // Loom — delegate to LoomPlayer
    if (platform === 'loom' && loomId) {
        return (
            <LoomPlayer
                videoId={loomId}
                durationMinutes={durationMinutes}
                onCanCompleteChange={onCanCompleteChange}
            />
        )
    }

    // No valid video
    if (!youtubeId) {
        return (
            <div className="aspect-video bg-brand-hover-bg rounded-xl flex items-center justify-center">
                <p className="text-brand-muted text-sm">Video no disponible</p>
            </div>
        )
    }

    // YouTube thumbnail
    if (!isPlaying) {
        const handleThumbnailClick = () => {
            setIsPlaying(true)
            setTimeout(() => initPlayer(), 300)
        }

        return (
            <div
                className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-black"
                onClick={handleThumbnailClick}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current ml-1">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                {durationMinutes && (
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">
                        {durationMinutes} min
                    </div>
                )}
            </div>
        )
    }

    // YouTube iframe with tracking
    return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner-glow border border-white/5">
            <iframe
                id={playerId}
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''
                    }`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />

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
