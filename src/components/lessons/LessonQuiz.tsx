import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Question = {
    question: string
    options: { a: string; b: string; c: string; d: string }
    correct: string
}

type Props = {
    questions: Question[]
    lessonTitle: string
    onPass: () => void     // callback cuando aprueba — llama a handleComplete
    onClose: () => void    // callback para cerrar sin completar
}

const OPTION_LABELS = ['a', 'b', 'c', 'd'] as const

export function LessonQuiz({ questions, lessonTitle, onPass, onClose }: Props) {
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)

    const handleSelect = (questionIndex: number, option: string) => {
        if (submitted) return
        setAnswers(prev => ({ ...prev, [questionIndex]: option }))
    }

    const handleSubmit = () => {
        const correct = questions.filter(
            (q, i) => answers[i] === q.correct
        ).length

        setScore(correct)
        setSubmitted(true)

        // Si aprobó (2 de 3 o más), completar la lección después de 2 segundos
        if (correct >= 2) {
            setTimeout(() => onPass(), 2000)
        }
    }

    const allAnswered = Object.keys(answers).length === questions.length
    const passed = submitted && score >= 2

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
                                🧠 Quiz de verificación
                            </p>
                            <h3 className="font-bold text-white text-lg">{lessonTitle}</h3>
                        </div>
                        {!submitted && (
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors text-xl p-1"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {!submitted && (
                        <p className="text-xs text-gray-400 mt-2">
                            Respondé 2 de 3 preguntas correctamente para completar la lección
                        </p>
                    )}
                </div>

                {/* Resultado */}
                <AnimatePresence>
                    {submitted && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`p-4 text-center font-bold text-sm ${passed
                                    ? 'bg-green-900/40 text-green-400'
                                    : 'bg-red-900/40 text-red-400'
                                }`}
                        >
                            {passed
                                ? `✅ ¡Aprobaste! ${score}/3 correctas — completando lección...`
                                : `❌ ${score}/3 correctas — necesitás al menos 2. Mirá el video nuevamente.`
                            }
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Preguntas */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {questions.map((q, qi) => (
                        <div key={qi}>
                            <p className="text-white text-sm font-medium mb-3 leading-relaxed">
                                <span className="text-orange-400 font-bold">{qi + 1}.</span> {q.question}
                            </p>
                            <div className="space-y-2">
                                {OPTION_LABELS.map(opt => {
                                    const isSelected = answers[qi] === opt
                                    const isCorrect = submitted && opt === q.correct
                                    const isWrong = submitted && isSelected && opt !== q.correct

                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleSelect(qi, opt)}
                                            disabled={submitted}
                                            className={`
                        w-full text-left px-4 py-3 rounded-lg text-sm transition-all border
                        ${isCorrect
                                                    ? 'bg-green-900/40 border-green-500/60 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                                                    : isWrong
                                                        ? 'bg-red-900/40 border-red-500/60 text-red-300'
                                                        : isSelected
                                                            ? 'bg-orange-400/20 border-orange-500/60 text-orange-300'
                                                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}
                      `}
                                        >
                                            <span className="font-bold mr-2 opacity-60">{opt.toUpperCase()}.</span>
                                            {q.options[opt]}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="p-6 border-t border-white/10">
                        <button
                            onClick={handleSubmit}
                            disabled={!allAnswered}
                            className={`
                w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg
                ${allAnswered
                                    ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20 active:scale-[0.98]'
                                    : 'bg-white/10 text-gray-500 cursor-not-allowed'}
              `}
                        >
                            {allAnswered ? 'Enviar respuestas →' : 'Respondé todas las preguntas'}
                        </button>
                    </div>
                )}

                {/* Botón reintentar si falló */}
                {submitted && !passed && (
                    <div className="p-6 border-t border-white/10">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white transition-all active:scale-[0.98]"
                        >
                            Volver a la lección
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}
