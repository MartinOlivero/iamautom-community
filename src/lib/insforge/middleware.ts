import { auth } from "@insforge/nextjs/server";
import { createClient as createInsforgeClient } from "@insforge/sdk";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Insforge middleware helper.
 * Uses auth() from @insforge/nextjs/server to read session cookies correctly.
 */
export async function createClient(request: NextRequest) {
    const insforgeResponse = NextResponse.next({ request });

    // Get token from Insforge auth system (reads HTTP-only cookies set by /api/auth)
    let token: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let authUser: any = null;
    try {
        const authState = await auth();
        token = authState?.token || undefined;
        authUser = authState?.user || null;
    } catch {
        // Auth not available — user is not signed in
    }

    const rawClient = createInsforgeClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        edgeFunctionToken: token,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extendedClient = rawClient as any;

    extendedClient.from = (table: string) => rawClient.database.from(table);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extendedClient.rpc = (name: string, args?: any) => rawClient.database.rpc(name, args);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authInstance = rawClient.auth as any;
    if (!authInstance.getUser) {
        authInstance.getUser = async () => {
            // If we already have the user from auth(), return it directly
            if (authUser) {
                return {
                    data: { user: authUser },
                    error: null,
                };
            }
            // Fallback: try to get from session
            try {
                const { data, error } = await rawClient.auth.getCurrentSession();
                return {
                    data: { user: data?.session?.user || null },
                    error,
                };
            } catch {
                return { data: { user: null }, error: null };
            }
        };
    }

    return { supabase: extendedClient, supabaseResponse: insforgeResponse, insforge: extendedClient, insforgeResponse };
}
