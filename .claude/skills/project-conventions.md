---
name: project-conventions
description: IamAutom Community project conventions — InsForge clients, Stripe flows, XP/gamification, component patterns
---

# IamAutom Community — Project Conventions

## InsForge Client Usage

There are 3 InsForge clients. Choose based on context:

### Browser (Client Components)
```ts
import { createClient } from "@/lib/insforge/client";
const insforge = createClient(); // singleton
const { data } = await insforge.from("profiles").select("*").eq("id", userId).single();
```

### Server (Server Components, API Routes)
```ts
import { createClient } from "@/lib/insforge/server";
const insforge = await createClient(); // async — reads auth token
const { data } = await insforge.from("posts").select("*").order("created_at", { ascending: false });
```

### Admin (Bypass RLS — server-only)
```ts
import { createAdminClient } from "@/lib/insforge/admin";
const db = createAdminClient(); // service role key
await db.from("profiles").update({ xp_points: 100 }).eq("id", userId);
```

**Rules:**
- NEVER use admin client in client components
- NEVER import server client in client components
- Admin client is for operations that need to bypass Row Level Security (XP awards, webhook handlers)

## Stripe Subscription Flow

### Creating a Checkout Session
```ts
// src/app/api/stripe/checkout/route.ts
import { getStripe } from "@/lib/stripe/client";
const stripe = getStripe();
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  // ...
});
```

### Webhook Handling
```ts
// src/app/api/webhooks/stripe/route.ts
// ALWAYS verify webhook signature before processing
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

**Plan Types:** `member` | `inner_circle`
**Billing Cycles:** `quarterly` | `biannual`
**Price IDs:** From env vars — `STRIPE_MEMBER_QUARTERLY_PRICE_ID`, etc.

## XP / Gamification (Synapses)

### Awarding XP
```ts
import { awardSynapses } from "@/lib/xp";
const result = await awardSynapses(userId, "complete_lesson", "Completed Module 3 Lesson 2");
// result: { newXP, leveledUp, newLevel, xpAmount }
```

**Valid actions:** `daily_ping` | `complete_lesson` | `create_post` | `create_comment` | `reaction_received` | `complete_module` | `streak_7_days`

**Rules:**
- ONLY call `awardSynapses` from server context (API routes, server actions)
- Uses atomic RPC (`award_synapses_atomic`) — never manually update xp_points
- Level is computed by DB trigger — never set level manually
- Always check `leveledUp` to trigger UI celebrations

### Client-Side XP Display
```ts
import { fetchUserXP } from "@/lib/xpClient";
const xpData = await fetchUserXP(); // calls /api/xp/award internally
```

## Component Conventions

### Styling
- TailwindCSS with dark-mode-first approach
- Background: `bg-zinc-900`, `bg-zinc-800` (cards)
- Text: `text-white`, `text-zinc-400` (secondary)
- Accents: `text-purple-400`, `bg-purple-600` (primary brand color)
- Always add `transition-colors` for interactive elements

### Animations
```tsx
import { motion } from "framer-motion";
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### User-Generated Content
- ALWAYS sanitize with DOMPurify before `dangerouslySetInnerHTML`
```tsx
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

## Security Review Checklist

When modifying auth, payments, or user-generated content:
- [ ] Stripe webhooks verify signature before processing
- [ ] Admin client not exposed to client components
- [ ] User input sanitized with DOMPurify
- [ ] RPC calls used for atomic operations (no manual XP math)
- [ ] CSP headers updated if adding new external domains
- [ ] Middleware auth checks not bypassed
