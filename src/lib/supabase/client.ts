import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Create a Supabase client for use in browser/client components.
 * Uses the public anon key — RLS policies protect the data.
 * Returns a singleton to prevent lock contention.
 */
export function createClient() {
    if (client) {
        return client;
    }
    
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    return client;
}
