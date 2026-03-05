import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const { lessonTitle, lessonDescription } = await req.json()

        if (!lessonTitle || !lessonDescription) {
            return NextResponse.json(
                { error: 'Faltan datos de la lección' },
                { status: 400 }
            )
        }

        console.log(`Generating quiz for lesson: ${lessonTitle}`)

        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: `Eres un asistente educativo. Basándote en el siguiente contenido de una lección, 
generá exactamente 3 preguntas de opción múltiple para verificar que el estudiante 
realmente vio el video.

TÍTULO DE LA LECCIÓN: ${lessonTitle}

DESCRIPCIÓN Y CONTENIDO:
${lessonDescription}

REGLAS:
- Cada pregunta debe tener exactamente 4 opciones (a, b, c, d)
- Solo una opción es correcta
- Las preguntas deben ser sobre conceptos específicos mencionados en la descripción
- No hagas preguntas genéricas que se puedan responder sin ver el video
- Nivel de dificultad: medio (no trivial pero tampoco muy difícil)
- Idioma: español

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional:
{
  "questions": [
    {
      "question": "texto de la pregunta",
      "options": {
        "a": "opción a",
        "b": "opción b", 
        "c": "opción c",
        "d": "opción d"
      },
      "correct": "a"
    }
  ]
}`
                }
            ]
        })

        const content = response.content[0]
        if (content.type !== 'text') {
            throw new Error('Respuesta inesperada de la API')
        }

        // Limpiar posibles backticks que Claude pueda agregar
        const clean = content.text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()

        const quiz = JSON.parse(clean)

        return NextResponse.json(quiz)

    } catch (error) {
        console.error('Error generando quiz:', error)
        return NextResponse.json(
            { error: 'Error al generar el quiz' },
            { status: 500 }
        )
    }
}
