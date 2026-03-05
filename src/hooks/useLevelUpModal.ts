"use client";

import { useState, useCallback } from 'react'

type LevelUpData = {
    level_number: number
    level_name: string
}

export function useLevelUpModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [levelData, setLevelData] = useState<LevelUpData | null>(null)

    const triggerLevelUp = useCallback((data: LevelUpData) => {
        setLevelData(data)
        setIsOpen(true)
    }, [])

    const closeLevelUp = useCallback(() => {
        setIsOpen(false)
        // Limpiar datos después de la animación de salida
        setTimeout(() => setLevelData(null), 500)
    }, [])

    return { isOpen, levelData, triggerLevelUp, closeLevelUp }
}
