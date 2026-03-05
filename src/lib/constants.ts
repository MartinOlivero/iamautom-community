// ============================================================
// Application-wide constants and configuration
// ============================================================

/**
 * Stripe Price IDs — populated from environment variables.
 * These map each plan + billing cycle to a Stripe Price.
 */
export const STRIPE_PRICES = {
    member_quarterly: process.env.STRIPE_MEMBER_QUARTERLY_PRICE_ID ?? "",
    member_biannual: process.env.STRIPE_MEMBER_BIANNUAL_PRICE_ID ?? "",
    inner_circle_quarterly: process.env.STRIPE_INNER_CIRCLE_QUARTERLY_PRICE_ID ?? "",
    inner_circle_biannual: process.env.STRIPE_INNER_CIRCLE_BIANNUAL_PRICE_ID ?? "",
} as const;

/**
 * Plan display information for the pricing page.
 * Prices in USD matching iamautom.com
 */
export const PLANS = {
    member: {
        name: "IamAutom Member",
        quarterlyPrice: 397,
        quarterlyOriginal: 591,
        biannualPrice: 647,
        biannualOriginal: 1182,
        quarterlyEquiv: "~$132 USD/mes",
        biannualEquiv: "Equivale a $108 USD/mes — ahorrás $147 USD vs trimestral",
        features: [
            "Plataforma privada exclusiva de IamAutom",
            "Acceso a +600 deals exclusivos de apps a través de gold.iamautom.com — con valor de mercado documentado de más de $500.000/año en ahorros",
            "Red de networking y oportunidades laborales en IA",
            "Clases en vivo semanales + módulos grabados con acceso permanente",
            "Liberación mensual de material exclusivo",
            "Acceso anticipado a nuevos lanzamientos",
        ],
    },
    inner_circle: {
        name: "IamAutom Inner Circle",
        quarterlyPrice: 697,
        quarterlyOriginal: 1191,
        biannualPrice: 1147,
        biannualOriginal: 2382,
        quarterlyEquiv: "~$232 USD/mes",
        biannualEquiv: "Equivale a $191 USD/mes — ahorrás $147 USD vs trimestral",
        features: [
            "Todo lo del plan Member incluido",
            "1 llamada 1:1 mensual directa con Tincho Olivero (valor de mercado: $200-$300 por sesión)",
            "Prioridad total en soporte y consultas",
            "Revisión personalizada de proyectos o propuestas para clientes",
            "Acceso a templates y propuestas comerciales reales de IamAutom Agency",
            "Grupo VIP con acceso directo a Tincho",
            "Todo el contenido premium sin restricciones",
        ],
    },
} as const;

/**
 * Synapse reward values for different user actions.
 */
export const SYNAPSE_REWARDS = {
    daily_ping: 5,
    complete_lesson: 10,
    create_post: 5,
    create_comment: 2,
    reaction_received: 3,
    complete_module: 15,
    streak_7_days: 20,
} as const;

/**
 * Level thresholds — Synapses required to reach each Processing Power level.
 */
export const LEVEL_THRESHOLDS = {
    novato: 0,
    aprendiz: 100,
    automatizador: 500,
    experto: 2000,
    maestro_ia: 5000,
} as const;

/**
 * Available emoji reactions for posts.
 */
export const REACTION_EMOJIS = ["🔥", "💡", "🚀", "👏", "❤️", "😂"] as const;

/**
 * Channel display configuration.
 */
export const CHANNELS = {
    general: { label: "General", emoji: "💬", requiresInnerCircle: false },
    proyectos: { label: "Proyectos", emoji: "🛠️", requiresInnerCircle: false },
    soporte: { label: "Soporte", emoji: "🆘", requiresInnerCircle: false },
    off_topic: { label: "Off-topic", emoji: "🎲", requiresInnerCircle: false },
    inner_circle_vip: { label: "Inner Circle VIP", emoji: "👑", requiresInnerCircle: true },
} as const;

/**
 * Navigation items for the sidebar.
 */
export const NAV_ITEMS = [
    { label: "Feed", emoji: "📣", href: "/app/feed" },
    { label: "Cursos", emoji: "📚", href: "/app/cursos" },
    { label: "Calendario", emoji: "📅", href: "/app/calendario" },
    { label: "Leaderboard", emoji: "🏆", href: "/app/leaderboard" },
    { label: "Desafíos", emoji: "🎯", href: "/app/desafios" },
    { label: "Miembros", emoji: "👥", href: "/app/miembros" },
] as const;

/**
 * Mobile bottom navigation (limited to 5 tabs).
 */
export const MOBILE_NAV_ITEMS = [
    { label: "Feed", emoji: "📣", href: "/app/feed" },
    { label: "Cursos", emoji: "📚", href: "/app/cursos" },
    { label: "Calendario", emoji: "📅", href: "/app/calendario" },
    { label: "Leaderboard", emoji: "🏆", href: "/app/leaderboard" },
    { label: "Perfil", emoji: "👤", href: "/app/perfil" },
] as const;

/**
 * Routes that are public (no auth required).
 */
export const PUBLIC_ROUTES = ["/", "/login", "/planes", "/api/webhooks/stripe"];

/**
 * Routes that require admin role.
 */
export const ADMIN_ROUTES_PREFIX = "/admin";

/**
 * Routes that require Inner Circle plan.
 */
export const INNER_CIRCLE_ROUTES = ["/app/chat/inner-circle"];
