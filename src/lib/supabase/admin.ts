import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using the service role key.
 * ⚠️  ONLY use this server-side (API routes, webhooks).
 * This bypasses RLS — use with extreme caution.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
