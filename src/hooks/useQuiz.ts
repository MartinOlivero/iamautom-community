import { useState, useCallback } from 'react'

type Question = {
    question: string
    options: { a: string; b: string; c: string; d: string }
    correct: string
}

type QuizState = {
    isOpen: boolean
    isLoading: boolean
    questions: Question[]
    error: string | null
}

export function useQuiz() {
    const [state, setState] = useState<QuizState>({
        isOpen: false,
        isLoading: false,
        questions: [],
        error: null,
    })

    const generateAndOpen = useCallback(async (
        lessonTitle: string,
        lessonDescription: string
    ) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonTitle, lessonDescription })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Error al generar el quiz')
            }

            const data = await response.json()

            setState({
                isOpen: true,
                isLoading: false,
                questions: data.questions,
                error: null,
            })
        } catch (err) {
            console.error('useQuiz Error:', err)
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'No se pudo generar el quiz. Intentá de nuevo.',
            }))
        }
    }, [])

    const closeQuiz = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }))
    }, [])

    return { state, generateAndOpen, closeQuiz }
}
