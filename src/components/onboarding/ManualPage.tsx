"use client";

import Link from "next/link";


export function ManualPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-12 py-8 px-4">

            {/* Header */}
            <div className="text-center space-y-3">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">
                    Bienvenido a
                </p>
                <h1 className="text-4xl font-black text-white">
                    El Manual del Agente
                </h1>
                <p className="text-gray-400 text-base">
                    Todo lo que necesitás saber para dominar IamAutom Community
                    y sacarle el máximo provecho.
                </p>
            </div>

            {/* Sección 1: Sinapsis */}
            <ManualSection
                emoji="⚡"
                title="Sinapsis — Tu energía en la red"
                color="text-yellow-400"
                borderColor="border-yellow-500/20"
                description="Las Sinapsis son tu moneda de participación. Las ganás por hacer cosas reales dentro de la comunidad."
                items={[
                    { action: "Publicar un post", reward: "+3 Sinapsis" },
                    { action: "Recibir una reacción en tu post", reward: "+1 Sinapsis" },
                    { action: "Comentar en la comunidad", reward: "+1 Sinapsis" },
                    { action: "Completar una lección", reward: "+2 Sinapsis" },
                    { action: "Día activo en la plataforma", reward: "+1 Sinapsis" },
                    { action: "7 días seguidos activo", reward: "+10 Sinapsis bonus" },
                    { action: "30 días seguidos activo", reward: "+30 Sinapsis bonus" },
                ]}
                tip="Las Sinapsis tienen DOS usos: subir de nivel (nunca se pierden) y canjear recompensas en la Tienda (se descuentan al canjear)."
            />

            {/* Sección 2: Proceso (Niveles) */}
            <ManualSection
                emoji="🚀"
                title="Proceso — Tu nivel de evolución"
                color="text-purple-400"
                borderColor="border-purple-500/20"
                description="Tu Proceso refleja cuánto creciste en la comunidad. Sube automáticamente a medida que acumulás Sinapsis."
                levels={[
                    { number: 1, name: "Novato", xp: 0, icon: "🌱", color: "#9CA3AF" },
                    { number: 2, name: "Aprendiz", xp: 50, icon: "📚", color: "#60A5FA" },
                    { number: 3, name: "Practicante", xp: 150, icon: "⚡", color: "#34D399" },
                    { number: 4, name: "Especialista", xp: 400, icon: "🔧", color: "#A78BFA" },
                    { number: 5, name: "Experto", xp: 900, icon: "🧠", color: "#F59E0B" },
                    { number: 6, name: "Architect", xp: 2000, icon: "🏗️", color: "#F97316" },
                    { number: 7, name: "Innovador", xp: 5000, icon: "🚀", color: "#EF4444" },
                    { number: 8, name: "Mentor", xp: 12000, icon: "🎓", color: "#EC4899" },
                    { number: 9, name: "Visionario", xp: 30000, icon: "👑", color: "#8B5CF6" },
                ]}
                tip="Tu nivel NUNCA baja aunque canjees Sinapsis en la Tienda. El Proceso solo sube."
            />

            {/* Sección 3: Uptime (Racha) */}
            <ManualSection
                emoji="🔥"
                title="Uptime — Tu racha de actividad"
                color="text-orange-400"
                borderColor="border-orange-500/20"
                description="El Uptime mide cuántos días consecutivos estuviste activo en la plataforma. Como un servidor que nunca se cae."
                items={[
                    { action: "Entrar a la plataforma cualquier día", reward: "Uptime +1" },
                    { action: "7 días seguidos", reward: "+10 Sinapsis bonus 🔥" },
                    { action: "30 días seguidos", reward: "+30 Sinapsis bonus ⚡" },
                ]}
                tip="Si un día no entrás, tu Uptime vuelve a 0. El récord personal (Uptime Máx) se guarda para siempre."
            />

            {/* Sección 4: Nodos Neurales (Badges) */}
            <ManualSection
                emoji="🧠"
                title="Nodos Neurales — Tus logros desbloqueados"
                color="text-green-400"
                borderColor="border-green-500/20"
                description="Los Nodos son badges que se desbloquean automáticamente cuando alcanzás ciertos hitos. No hay que reclamarlos — simplemente aparecen."
                badges={[
                    { emoji: "🏔️", name: "Primera Publicación", condition: "Publicá tu primer post" },
                    { emoji: "📋", name: "Creador Activo", condition: "Publicá 10 posts" },
                    { emoji: "💬", name: "Comentarista", condition: "Dejá 10 comentarios" },
                    { emoji: "🗣️", name: "Conversador", condition: "Dejá 50 comentarios" },
                    { emoji: "🔥", name: "Popular", condition: "Recibí 50 reacciones en tus posts" },
                    { emoji: "📚", name: "Primer Módulo", condition: "Completá tu primer módulo" },
                    { emoji: "🦉", name: "Sabio", condition: "Completá 5 módulos" },
                    { emoji: "💎", name: "Centenario", condition: "Alcanzá 1.000 Sinapsis" },
                    { emoji: "🏆", name: "Élite", condition: "Alcanzá 5.000 Sinapsis" },
                    { emoji: "🔥", name: "Racha 7 Días", condition: "Mantené 7 días de Uptime" },
                    { emoji: "⚡", name: "Racha 30 Días", condition: "Mantené 30 días de Uptime" },
                    { emoji: "👑", name: "Inner Circle", condition: "Sé miembro Inner Circle" },
                ]}
                tip="Los Nodos aparecen automáticamente en tu perfil. Podés ver cuáles te faltan en la sección 'Nodos Neurales' de tu perfil."
            />

            {/* Sección 5: Tienda */}
            <ManualSection
                emoji="🏪"
                title="Tienda de Sinapsis — Canjeá tus recompensas"
                color="text-blue-400"
                borderColor="border-blue-500/20"
                description="Con las Sinapsis que acumulás podés canjear recompensas reales. Las Sinapsis canjeadas se descuentan de tu saldo pero NO afectan tu nivel."
                items={[
                    { action: "Acceso a Contenido Premium", reward: "150 Sinapsis" },
                    { action: "Destacado en el Newsletter", reward: "200 Sinapsis" },
                    { action: "Consultoría 1:1 con Tincho (30 min)", reward: "500 Sinapsis" },
                ]}
                tip="Las solicitudes de canje se aprueban manualmente. Recibirás una notificación cuando sea aprobada."
            />

            {/* Sección 6: Desafíos */}
            <ManualSection
                emoji="🏆"
                title="Desafíos — Misiones mensuales"
                color="text-red-400"
                borderColor="border-red-500/20"
                description="Cada mes hay desafíos con objetivos específicos. Completarlos te da Sinapsis extra y a veces Nodos especiales."
                items={[
                    { action: "Uníte a un desafío activo", reward: "Gratis, sin costo" },
                    { action: "Completar el desafío antes del fin de mes", reward: "Sinapsis bonus según el desafío" },
                ]}
                tip="Los desafíos se renuevan cada mes. Si no te unís antes de que termine el mes, perdés la oportunidad."
            />

            {/* CTA final */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-orange-900/20 to-transparent border border-orange-500/20">
                <p className="text-2xl mb-2">🚀</p>
                <h3 className="text-xl font-black text-white mb-2">
                    ¿Listo para escalar?
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                    El primer paso es publicar tu presentación en el Feed.
                    Contale a la comunidad quién sos y qué te trajo acá.
                </p>

                <Link
                    href="/app/feed"
                    className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-all"
                >
                    Ir al Feed →
                </Link>
            </div>

        </div>
    )
}

interface Level {
    number: number;
    name: string;
    xp: number;
    icon: string;
    color: string;
}

interface Badge {
    emoji: string;
    name: string;
    condition: string;
}

interface Item {
    action: string;
    reward: string;
}

interface ManualSectionProps {
    emoji: string;
    title: string;
    color: string;
    borderColor: string;
    description: string;
    items?: Item[];
    levels?: Level[];
    badges?: Badge[];
    tip?: string;
}

// Subcomponente para cada sección
function ManualSection({
    emoji, title, color, borderColor, description,
    items, levels, badges, tip
}: ManualSectionProps) {
    return (
        <div className={`p-6 rounded-2xl border bg-white/5 ${borderColor} space-y-4`}>
            <div className="flex items-center gap-3">
                <span className="text-3xl">{emoji}</span>
                <h2 className={`text-xl font-black ${color}`}>{title}</h2>
            </div>
            <p className="text-gray-300 text-sm">{description}</p>

            {/* Lista de acciones/recompensas */}
            {items && (
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-gray-300 text-sm">{item.action}</span>
                            <span className={`text-sm font-bold ${color}`}>{item.reward}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabla de niveles */}
            {levels && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {levels.map((level) => (
                        <div
                            key={level.number}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                        >
                            <span className="text-lg">{level.icon}</span>
                            <div>
                                <p className="text-xs font-bold text-white">{level.name}</p>
                                <p className="text-xs text-gray-500">{level.xp.toLocaleString("es-AR")} XP</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid de badges */}
            {badges && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {badges.map((badge, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                            <span className="text-xl">{badge.emoji}</span>
                            <div>
                                <p className="text-xs font-bold text-white">{badge.name}</p>
                                <p className="text-xs text-gray-500">{badge.condition}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tip */}
            {tip && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-yellow-400 shrink-0">💡</span>
                    <p className="text-xs text-gray-400">{tip}</p>
                </div>
            )}
        </div>
    )
}
