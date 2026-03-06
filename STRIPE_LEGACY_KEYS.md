# Stripe Legacy Keys: `supabase_user_id`

## NO RENOMBRAR / DO NOT RENAME

En los archivos de integración con Stripe vas a encontrar la key `supabase_user_id`
dentro de los objetos `metadata` que se envían y reciben de Stripe:

- `src/app/api/stripe/checkout/route.ts` — se envía en `metadata` al crear Checkout Sessions y Subscriptions.
- `src/app/api/webhooks/stripe/route.ts` — se lee desde `session.metadata?.supabase_user_id` al procesar webhooks.

## Por qué existe este nombre

Este proyecto originalmente usaba **Supabase** como backend. Durante la migración a **Insforge**,
se reemplazó todo el código, SDK, variables y comentarios que referenciaban a Supabase.

Sin embargo, `supabase_user_id` es una **key almacenada en los registros de Stripe** (metadata de
Customers, Subscriptions y Checkout Sessions). Renombrar esta key en el código significaría:

1. **Los webhooks dejarían de funcionar** para todas las suscripciones existentes, ya que Stripe
   seguiría enviando `supabase_user_id` en los eventos de suscripciones creadas antes del cambio.
2. **Habría que migrar los metadata de cada Customer y Subscription** en Stripe para usar el nuevo nombre.
3. No hay forma de hacer un rename atómico: habría un período donde coexisten ambas keys.

## Qué hacer si necesitás cambiarlo

Si en el futuro se decide renombrar esta key, el proceso seguro sería:

1. Agregar soporte dual en el webhook: leer tanto `supabase_user_id` como `insforge_user_id`.
2. Actualizar el checkout para enviar la nueva key `insforge_user_id`.
3. Migrar los metadata de todos los Customers/Subscriptions existentes en Stripe via API.
4. Una vez confirmado que no quedan registros con la key vieja, eliminar el fallback.

## Fecha de migración

La migración de Supabase a Insforge se completó en **marzo 2026**.
