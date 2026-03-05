import { useState, useEffect, useRef, useCallback } from 'react'

type ProgressState = {
  isReady: boolean
  maxPercentReached: number  // máximo % visto — nunca puede bajar
  canComplete: boolean       // true cuando llegó al 80%
  hasStarted: boolean        // si el usuario siquiera presionó play
}

const COMPLETION_THRESHOLD = 0.8  // 80%

export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function useYouTubeProgress(playerId: string) {
  const [state, setState] = useState<ProgressState>({
    isReady: false,
    maxPercentReached: 0,
    canComplete: false,
    hasStarted: false,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const maxPercentRef = useRef(0)

  const startTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      if (!playerRef.current) return
      try {
        const duration = playerRef.current.getDuration()
        const currentTime = playerRef.current.getCurrentTime()

        if (duration > 0) {
          const percent = currentTime / duration

          // El máximo solo sube — evita trampa con seek al final
          if (percent > maxPercentRef.current) {
            maxPercentRef.current = percent
          }

          setState(prev => ({
            ...prev,
            hasStarted: true,
            maxPercentReached: maxPercentRef.current,
            canComplete: maxPercentRef.current >= COMPLETION_THRESHOLD,
          }))
        }
      } catch { /* ignore */ }
    }, 2000)
  }, [])

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const initPlayer = useCallback(() => {
    const tryInit = () => {
      if (!window.YT?.Player) {
        setTimeout(tryInit, 500)
        return
      }

      playerRef.current = new window.YT.Player(playerId, {
        events: {
          onReady: () => {
            setState(prev => ({ ...prev, isReady: true }))
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (event: any) => {
            if (event.data === 1) {  // PLAYING
              startTracking()
            } else {
              stopTracking()
            }
          },
        }
      })
    }
    tryInit()
  }, [playerId, startTracking, stopTracking])

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    return () => stopTracking()
  }, [stopTracking])

  return { state, initPlayer }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { YT: any }
}
