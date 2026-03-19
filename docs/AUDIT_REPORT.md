# Auditoría Integral — IamAutom Skool Community Platform

**Fecha:** 2026-03-19
**Plataforma:** Next.js 14 + InsForge + Stripe + Anthropic Claude
**Build:** Exitoso post-fixes

---

## Resumen Ejecutivo

| Severidad | Encontrados | Corregidos | Pendientes |
|-----------|:-----------:|:----------:|:----------:|
| CRITICO   | 5           | 5          | 0          |
| ALTO      | 6           | 6          | 0          |
| MEDIO     | 8           | 5          | 3          |
| BAJO      | 6           | 4          | 2          |
| **Total** | **25**      | **20**     | **5**      |

---

## Fixes Implementados

### CRITICOS - Seguridad

| # | Fix | Archivo | Descripcion |
|---|-----|---------|-------------|
| S1 | **XSS Corregido** | `RichTextDisplay.tsx` | Agregado DOMPurify con allowlist de tags/attrs antes de `dangerouslySetInnerHTML` |
| S2 | **XSS Corregido** | `LessonPlayer.tsx` | `lesson.description` ahora sanitizado con DOMPurify |
| S3 | **Input Validation** | `api/xp/award/route.ts` | `action` validado contra allowlist de `SYNAPSE_REWARDS` keys. Eliminado `as any` cast |
| S4 | **Prompt Injection Mitigado** | `api/generate-quiz/route.ts` | Inputs sanitizados (length limit + control chars), system prompt con instrucciones anti-injection |
| S4b | **Prompt Injection Mitigado** | `api/recommend-challenge/route.ts` | System prompt anti-injection agregado |

### CRITICOS - Concurrencia / Race Conditions

| # | Fix | Archivo | Descripcion |
|---|-----|---------|-------------|
| C1 | **Race Condition XP** | `src/lib/xp.ts` + SQL | Reemplazado read-then-write por RPC atomico `award_synapses_atomic` (`xp_points = xp_points + N`) |
| C2 | **Badges Duplicados** | `src/lib/badges.ts` + SQL | Agregado UNIQUE constraint `(user_id, badge_id)` + upsert con `ignoreDuplicates: true` |

### ALTOS - Seguridad & Logica

| # | Fix | Archivo | Descripcion |
|---|-----|---------|-------------|
| S6 | **Webhook Idempotencia** | `api/webhooks/stripe/route.ts` | Tabla `stripe_webhook_events` + deduplicacion por `event.id` |
| S8 | **CSP Header** | `next.config.mjs` | Content-Security-Policy agregado con allowlist para Stripe, YouTube, InsForge |
| L2 | **Verificacion DB** | `api/webhooks/stripe/route.ts` | Helper `updateProfile()` verifica errores y logea warnings si no matchea |
| L3 | **JSON.parse Fallback** | `api/generate-quiz/route.ts` | Try-catch separado para parsing + validacion de estructura del quiz |
| SQL1 | **SQL Injection** | `api/recommend-challenge/route.ts` | Validacion UUID regex antes de interpolar IDs en query filter |

### MEDIO - Calidad & Observabilidad

| # | Fix | Archivo | Descripcion |
|---|-----|---------|-------------|
| Q2 | **Console.logs Removidos** | `recommend-challenge/route.ts` | Eliminados logs de user IDs y respuestas raw de Claude |
| Q2b | **Error Logging Seguro** | `recommend-challenge/route.ts` | Error catch simplificado sin exponer detalles internos |

### BAJO - Codigo Muerto

| # | Fix | Archivo | Descripcion |
|---|-----|---------|-------------|
| D1 | **Eliminado** | `src/lib/streaks.ts` | Funcion `updateStreak()` nunca importada — streak se maneja via RPC |
| D2 | **Eliminado** | `src/lib/animations.ts` | `fadeUp`/`fadeUpFast` nunca importados |
| D3 | **Eliminado** | `create_test_user.js` | Script de test con credenciales hardcodeadas |
| D4 | **Eliminado** | `test-stripe.mjs`, `build_output.log` | Archivos de debugging |
| D5 | **Eliminado** | `ChannelTabs.tsx`, `PollCard.tsx`, `UpgradeWall.tsx` | Componentes fantasma nunca importados |

---

## Migraciones SQL Aplicadas

### 1. `award_synapses_atomic` (RPC Function)
```sql
CREATE OR REPLACE FUNCTION award_synapses_atomic(p_user_id UUID, p_xp_amount INT)
RETURNS JSON AS $$
  UPDATE profiles SET xp_points = xp_points + p_xp_amount, coins = coins + p_xp_amount, updated_at = NOW()
  WHERE id = p_user_id RETURNING json_build_object('new_xp', xp_points, 'new_level', level);
$$ LANGUAGE plpgsql;
```

### 2. `user_badges` UNIQUE constraint
```sql
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_id);
```

### 3. `stripe_webhook_events` (Idempotency table)
```sql
CREATE TABLE stripe_webhook_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Hallazgos Pendientes (No Implementados)

| # | Severidad | Hallazgo | Razon |
|---|-----------|----------|-------|
| S5 | MEDIO | APIs publicas en middleware (`pathname.startsWith("/api/")`) | Cada handler ya verifica auth internamente. Cambiar el middleware requiere verificar que el webhook de Stripe siga funcionando sin auth. Bajo riesgo actual. |
| S7 | MEDIO | Sin rate limiting en endpoints de IA | Requiere dependencia adicional (`@vercel/ratelimit` o Redis). Recomendado para produccion. |
| L5 | MEDIO | `force-dynamic` global en layout.tsx | Desactivar requiere testear cada pagina para ISR/SSG compatibility. Impacto en performance, no seguridad. |
| Q1 | BAJO | 76 `eslint-disable` comments | Resultado del shim de InsForge SDK. Se resolvera cuando el SDK madure y exponga tipos propios. |
| Q3 | BAJO | Cero tests | Requiere setup de testing framework (Vitest/Jest) y escritura de tests. Fuera del scope de esta auditoria. |

---

## Dependencias

- `dompurify@3.3.3` + `@types/dompurify` agregados para sanitizacion XSS
- `@insforge/sdk@1.1.6-dev.0` — version prerelease, monitorear actualizaciones
- `npm audit` reporta 7 vulnerabilidades high — revisar con `npm audit fix`

---

## Archivos Modificados

```
EDITADOS:
  src/components/ui/RichTextDisplay.tsx       — DOMPurify sanitization
  src/components/courses/LessonPlayer.tsx     — DOMPurify sanitization
  src/app/api/xp/award/route.ts              — Action allowlist validation
  src/lib/xp.ts                              — Atomic RPC for XP
  src/lib/badges.ts                          — Upsert with ignoreDuplicates
  src/app/api/webhooks/stripe/route.ts       — Idempotency + DB verification
  src/app/api/generate-quiz/route.ts         — Input sanitization + JSON fallback
  src/app/api/recommend-challenge/route.ts   — UUID validation + prompt injection defense
  next.config.mjs                            — CSP header

ELIMINADOS (codigo muerto):
  src/lib/streaks.ts
  src/lib/animations.ts
  src/components/feed/ChannelTabs.tsx
  src/components/feed/PollCard.tsx
  src/components/layout/UpgradeWall.tsx
  create_test_user.js
  test-stripe.mjs
  build_output.log

SQL MIGRATIONS:
  award_synapses_atomic() function
  user_badges UNIQUE constraint
  stripe_webhook_events table
```

---

## Recomendaciones Inmediatas

1. **Rate limiting** — Implementar en endpoints `/api/generate-quiz` y `/api/recommend-challenge` para controlar costos de Anthropic API
2. **Tests** — Setup Vitest + tests para rutas criticas (XP award, webhook, badges)
3. **npm audit fix** — Resolver las 7 vulnerabilidades reportadas
4. **Monitoreo** — Agregar Sentry o similar para error tracking en produccion
