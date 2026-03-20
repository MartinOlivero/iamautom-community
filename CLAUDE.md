# IamAutom Community Platform

## Commands
- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx tsc --noEmit` — Type check without emitting

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript 5 + React 18
- **Backend**: InsForge (BaaS — NOT Supabase). SDK: `@insforge/sdk`, `@insforge/nextjs`
- **Payments**: Stripe (checkout sessions, subscriptions, webhooks)
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`) for quiz/challenge generation
- **Styling**: TailwindCSS 3.4 + Framer Motion animations
- **Editor**: TipTap rich text editor
- **Icons**: Lucide React

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Login, callback
│   ├── (protected)/        # Auth-gated routes
│   │   ├── app/            # Member features (feed, cursos, leaderboard, etc.)
│   │   └── admin/          # Admin panel
│   ├── api/                # API routes (stripe, webhooks, xp, AI)
│   └── planes/             # Public pricing page
├── lib/
│   ├── insforge/           # InsForge clients (client.ts, server.ts, admin.ts, middleware.ts)
│   ├── stripe/client.ts    # Stripe SDK singleton
│   ├── xp.ts               # Synapse (XP) award logic (server-only)
│   ├── levels.ts           # 5-level system (Novato → Maestro IA)
│   ├── badges.ts           # Badge earning logic
│   └── constants.ts        # Plans, rewards, channels, nav config
├── components/
│   ├── gamification/       # XP toasts, level-up modals, challenges, badges
│   ├── feed/               # Social feed components
│   ├── courses/            # Course/lesson components
│   └── ui/                 # Shadcn/UI base components
├── types/database.ts       # Full database schema types
└── hooks/                  # React hooks
middleware.ts               # Auth, subscription gating, admin protection
```

## Key Conventions

### Language & UI
- **UI language is Spanish** — all user-facing text, labels, routes (cursos, desafios, miembros, perfil)
- **Dark mode is the default** — always use dark-first Tailwind classes (`bg-zinc-900`, `text-white`)
- Code, comments, and variable names remain in English

### InsForge (NOT Supabase)
- **Browser client**: `import { createClient } from "@/lib/insforge/client"` — singleton, Supabase-compatible API
- **Server client**: `import { createClient } from "@/lib/insforge/server"` — uses `auth()` from `@insforge/nextjs/server`
- **Admin client**: `import { createAdminClient } from "@/lib/insforge/admin"` — service role, bypasses RLS
- All clients expose `.from()`, `.rpc()`, `.auth`, `.storage` matching Supabase patterns
- Database operations use the same `.from("table").select().eq()` chain syntax as Supabase

### Stripe Integration
- Singleton via `getStripe()` from `src/lib/stripe/client.ts` — lazy-initialized, server-only
- Two plan tiers: **Member** and **Inner Circle**, each with quarterly/biannual billing
- Price IDs come from env vars (`STRIPE_MEMBER_QUARTERLY_PRICE_ID`, etc.)
- Webhook handler at `src/app/api/webhooks/stripe/route.ts`
- Checkout session creation at `src/app/api/stripe/checkout/route.ts`

### XP / Gamification ("Synapses")
- XP points are called **Synapses** in the UI
- Award via `awardSynapses(userId, action)` from `src/lib/xp.ts` — server-only, uses admin client
- Atomic DB update via `award_synapses_atomic` RPC to prevent race conditions
- Actions & rewards: daily_ping(5), complete_lesson(10), create_post(5), create_comment(2), reaction_received(3), complete_module(15), streak_7_days(20)
- 5 levels: Novato(0) → Aprendiz(100) → Automatizador(500) → Experto(2000) → Maestro IA(5000)
- Level calculated by DB trigger on xp_points update

### Middleware
- `middleware.ts` at project root handles: session refresh, auth redirects, subscription gating, admin/Inner Circle route protection
- Public routes: `/`, `/login`, `/planes`, `/api/*`
- Protected routes: `/app/*` (requires active subscription), `/admin/*` (requires admin role)

## Sensitive Files — DO NOT EDIT
- `.env.local` — Contains production Stripe keys, InsForge credentials, Claude API key
- `middleware.ts` — Critical auth/subscription gating (edit with extreme care)
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook verification (security-critical)

## Security Notes
- All user-generated HTML is sanitized with DOMPurify before rendering
- CSP headers configured in `next.config.mjs` — update when adding new external domains
- Atomic RPC operations used for XP to prevent race conditions
- Stripe webhook signature verification is mandatory
