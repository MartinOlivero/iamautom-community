// ============================================================
// Application-wide constants and configuration
// ============================================================

/**
 * Stripe Price IDs — populated from environment variables.
 * These map each plan + billing cycle to a Stripe Price.
 */
export const STRIPE_PRICES = {
    member_monthly: process.env.STRIPE_MEMBER_MONTHLY_PRICE_ID ?? "",
    member_annual: process.env.STRIPE_MEMBER_ANNUAL_PRICE_ID ?? "",
    inner_circle_monthly: process.env.STRIPE_INNER_CIRCLE_MONTHLY_PRICE_ID ?? "",
    inner_circle_annual: process.env.STRIPE_INNER_CIRCLE_ANNUAL_PRICE_ID ?? "",
} as const;

/**
 * Plan display information for the pricing page.
 */
export const PLANS = {
    member: {
        name: "IamAutom Member",
        monthlyPrice: 127,
        annualPrice: 1270,
        features: [
            "Acceso a la comunidad completa",
            "Todos los cursos y módulos",
            "Feed, encuestas y eventos",
            "Sistema de gamificación",
            "Chat de la comunidad",
            "Soporte de la comunidad",
        ],
    },
    inner_circle: {
        name: "IamAutom Inner Circle",
        monthlyPrice: 227,
        annualPrice: 2270,
        features: [
            "Todo lo de Member",
            "Chat VIP exclusivo",
            "Eventos exclusivos Inner Circle",
            "Grabaciones de sesiones en vivo",
            "Acceso prioritario a nuevos contenidos",
            "Badge dorado exclusivo ✨",
            "Soporte directo de Tincho",
        ],
    },
} as const;

/**
 * XP reward values for different user actions.
 */
export const XP_REWARDS = {
    complete_lesson: 10,
    create_post: 5,
    create_comment: 2,
    reaction_received: 3,
    complete_module: 15,
    streak_7_days: 20,
} as const;

/**
 * Level thresholds — XP required to reach each level.
 */
export const LEVEL_THRESHOLDS = {
    novato: 0,
    aprendiz: 500,
    automatizador: 1500,
    experto: 3500,
    maestro_ia: 7000,
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
    { label: "Eventos", emoji: "📅", href: "/app/eventos" },
    { label: "Chat", emoji: "💬", href: "/app/chat" },
    { label: "Leaderboard", emoji: "🏆", href: "/app/leaderboard" },
] as const;

/**
 * Mobile bottom navigation (limited to 5 tabs).
 */
export const MOBILE_NAV_ITEMS = [
    { label: "Feed", emoji: "📣", href: "/app/feed" },
    { label: "Cursos", emoji: "📚", href: "/app/cursos" },
    { label: "Eventos", emoji: "📅", href: "/app/eventos" },
    { label: "Chat", emoji: "💬", href: "/app/chat" },
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
