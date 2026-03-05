import { createClient } from '@/lib/insforge/server'
import { getUserBehaviorProfile } from '@/lib/getUserBehaviorProfile'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Auth check — verify the requesting user matches the userId
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { userId, justCompletedChallenge } = await request.json()

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden: userId mismatch' }, { status: 403 })
        }

        // Cache: reutilizar si tiene menos de 1 hora
        const { data: cached } = await supabase
            .from('user_recommendations')
            .select('*')
            .eq('user_id', userId)
            .gte('generated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
            .single()

        if (cached) return NextResponse.json(cached)

        const profile = await getUserBehaviorProfile(userId, supabase)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const completedIds = profile.completedChallenges.map((c: any) => c.challenge_id)
        let query = supabase
            .from('challenges')
            .select('id, title, description, emoji, challenge_type, target_value, reward_coins, ends_at')
            .eq('is_active', true)
            .gte('ends_at', new Date().toISOString())

        if (completedIds.length > 0) {
            query = query.not('id', 'in', `(${completedIds.join(',')})`)
        }

        const { data: availableChallenges } = await query

        console.log(`Available challenges for user ${userId}:`, availableChallenges?.length || 0)

        if (!availableChallenges || availableChallenges.length === 0) {
            return NextResponse.json({ error: 'no_challenges_available' }, { status: 404 })
        }

        const avgDays = profile.completedChallenges
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => c.days_to_complete !== null)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .reduce((acc: number, c: any, _: number, arr: any[]) => acc + c.days_to_complete / arr.length, 0)

        const favoriteType = Object.entries(profile.typeCount)
            .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'general'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalXP = (profile.gamificationEvents as any[])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .reduce((acc: number, e: any) => acc + (e.points || 0), 0)

        const prompt = `Sos un coach de IamAutom Community, una comunidad de automatización con IA para hispanohablantes.

PERFIL DEL MIEMBRO:
- Retos completados: ${profile.totalCompleted}
- XP total acumulado: ${totalXP}
- Tipo de reto favorito: ${favoriteType}
- Distribución por tipo: ${JSON.stringify(profile.typeCount)}
- Tiempo promedio en completar: ${avgDays.toFixed(1)} días
- Posts en último mes: ${profile.recentPosts.length}
- Badges obtenidos: ${profile.badges.length}
- Acaba de completar: "${justCompletedChallenge?.title || 'su primer reto'}" (tipo: ${justCompletedChallenge?.challenge_type || 'desconocido'})

RETOS DISPONIBLES:
${JSON.stringify(availableChallenges.map((c: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
            id: c.id,
            title: c.title,
            emoji: c.emoji,
            type: c.challenge_type,
            target: c.target_value,
            coins: c.reward_coins,
            expires: c.ends_at
        })), null, 2)}

Analizá el comportamiento y elegí el ÚNICO reto más apropiado para este miembro ahora.
Respondé SOLO con JSON válido sin markdown ni texto extra:
{
  "challengeId": "uuid-exacto-del-reto",
  "title": "título del reto",
  "reasoning": "2 oraciones explicando por qué este reto para este miembro específicamente",
  "motivationalMessage": "mensaje personalizado en español, 1 oración",
  "estimatedFit": "alto|medio"
}`

        const response = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001', // Actualizado según pedido del usuario
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
        })

        // ... rest of logic stays same ...
        // Note: I'm only replacing this part and the catch block below.
        // But for completeness in the chunk:
        let recommendation
        try {
            const content = response.content[0]
            if (content.type === 'text') {
                console.log('Claude raw response:', content.text)

                // Robust parsing: quitar backticks de markdown si existen
                let cleanText = content.text.trim();
                if (cleanText.startsWith('```')) {
                    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                    if (match && match[1]) {
                        cleanText = match[1];
                    }
                }

                recommendation = JSON.parse(cleanText)
            } else {
                throw new Error('Unexpected response type')
            }
        } catch (error) {
            console.error('JSON parse error:', error)
            const content = response.content[0]
            if (content.type === 'text') {
                console.error('Raw text was:', content.text)
            }
            recommendation = {
                challengeId: availableChallenges[0].id,
                title: availableChallenges[0].title,
                reasoning: 'Este reto es ideal para tu próximo paso.',
                motivationalMessage: '¡Vamos por más!',
                estimatedFit: 'medio'
            }
        }

        await supabase.from('user_recommendations').upsert({
            user_id: userId,
            challenge_id: recommendation.challengeId,
            reasoning: recommendation.reasoning,
            motivational_message: recommendation.motivationalMessage,
            generated_at: new Date().toISOString()
        })

        return NextResponse.json(recommendation)

    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errAny = error as any;
        console.error('recommend-challenge error details:', {
            message: err.message,
            status: errAny?.status,
            name: err.name,
            body: errAny?.body
        })
        return NextResponse.json({
            error: err.message,
            details: errAny?.status === 404 ? 'Model not found or account lacks access' : 'Internal error'
        }, { status: 500 })
    }
}
