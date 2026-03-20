---
name: security-review
description: Security review for changes touching auth, payments, user-generated content, or middleware
---

# Security Review — IamAutom Community

Run this review when changes touch any of these areas:
- Authentication / session handling
- Stripe payments / webhooks
- User-generated content (posts, comments, rich text)
- Middleware (route protection)
- API routes handling sensitive data
- InsForge admin client usage

## Review Checklist

### Authentication & Authorization
- [ ] `middleware.ts` auth checks are intact — no bypass introduced
- [ ] Server components use `createClient` from `@/lib/insforge/server` (not browser client)
- [ ] Admin routes check `profile.role === "admin"`
- [ ] Subscription gating checks `subscription_status === "active" || "trialing"`
- [ ] Inner Circle routes verify `plan_type === "inner_circle"`

### Stripe / Payments
- [ ] Webhook signature verified via `stripe.webhooks.constructEvent()`
- [ ] No Stripe secret key exposed to client-side code
- [ ] Price IDs come from env vars, not hardcoded
- [ ] Checkout session creation validates user is authenticated
- [ ] Subscription status updates only happen in webhook handler (not client-controlled)

### User-Generated Content (XSS Prevention)
- [ ] All user HTML rendered via `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`
- [ ] TipTap editor output sanitized before storage and display
- [ ] No `eval()`, `innerHTML` without sanitization, or `document.write()`
- [ ] Image/file uploads validated for type and size

### Data Integrity
- [ ] XP/Synapse awards use `awardSynapses()` (atomic RPC) — no manual xp_points updates
- [ ] Database writes that need atomicity use RPC functions
- [ ] No race conditions in concurrent operations (check for read-then-write patterns)

### InsForge Client Security
- [ ] `createAdminClient()` ONLY used in server-side code (API routes, server actions)
- [ ] Browser client uses anon key (RLS enforced)
- [ ] Server client properly passes auth token for RLS
- [ ] No service role key exposed in client bundles

### CSP & Headers
- [ ] New external domains added to CSP in `next.config.mjs` if needed
- [ ] No `unsafe-eval` or overly permissive `unsafe-inline` added
- [ ] Frame sources restricted appropriately

## How to Use

When reviewing a diff that touches sensitive areas:

1. Identify which categories above are affected
2. Run through the relevant checklist items
3. Flag any violations with severity: CRITICAL / HIGH / MEDIUM
4. Suggest specific fixes for each issue found
