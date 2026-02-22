import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Create a Supabase client for use in browser/client components.
 * Uses the public anon key — RLS policies protect the data.
 * Returns a singleton to prevent lock contention.
 *
 * Navigator Lock is disabled via a no-op lock function to prevent
 * the NavigatorLockAcquireTimeoutError that blocks auth resolution.
 */
export function createClient() {
    if (client) {
        return client;
    }

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                flowType: 'pkce',
                detectSessionInUrl: true,
                persistSession: true,
                autoRefreshToken: true,
            },
        }
    );

    return client;
}
