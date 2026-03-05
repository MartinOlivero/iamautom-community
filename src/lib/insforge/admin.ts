import { createClient as createInsforgeClient } from "@insforge/sdk";

export function createAdminClient() {
    const rawClient = createInsforgeClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY!,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extendedClient = rawClient as any;

    extendedClient.from = (table: string) => rawClient.database.from(table);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extendedClient.rpc = (name: string, args?: any) => rawClient.database.rpc(name, args);
    extendedClient.auth = rawClient.auth;
    extendedClient.storage = rawClient.storage;

    return extendedClient;
}
