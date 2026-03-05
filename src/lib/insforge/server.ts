import { auth } from "@insforge/nextjs/server";
import { createClient as createInsforgeClient } from "@insforge/sdk";

export async function createClient() {
    const authState = await auth();
    const token = authState?.token || undefined;
    const authUser = authState?.user || null;

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
            // Return user directly from auth() — getCurrentSession() doesn't work server-side
            return {
                data: { user: authUser },
                error: null,
            };
        };
    }

    extendedClient.storage = rawClient.storage;

    return extendedClient;
}
