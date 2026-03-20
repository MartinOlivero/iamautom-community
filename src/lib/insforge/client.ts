import { createClient as createInsforgeClient } from "@insforge/sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any;

export function createClient() {
    if (client) {
        return client;
    }

    const rawClient = createInsforgeClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        autoRefreshToken: true,
        persistSession: true,
    });

    // Attach Insforge-compatible methods to the instance to preserve prototype methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extendedClient = rawClient as any;

    extendedClient.from = (table: string) => rawClient.database.from(table);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extendedClient.rpc = (name: string, args?: any) => rawClient.database.rpc(name, args);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authInstance = rawClient.auth as any;
    if (!authInstance.getUser) {
        authInstance.getUser = async () => {
            try {
                const { data, error } = await rawClient.auth.getCurrentSession();
                return {
                    data: { user: data?.session?.user || null },
                    error
                };
            } catch {
                // Session refresh failed (401) — return null user instead of throwing
                return { data: { user: null }, error: null };
            }
        };
    }

    extendedClient.channel = (name: string) => {
        // Return a mock channel object that uses Insforge Realtime under the hood
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            on: (type: string, filter: any, callback: (payload: any) => void) => {
                // If it's a postgres_changes event, we map it to the expected event names in Insforge
                // Insforge uses event names like 'UPDATE_table' or 'INSERT_table'
                const tableName = filter.table;
                // filter.event: "*" means all events, otherwise specific SQL TG_OP

                // We'll listen for any event that matches the table if event is *
                // Note: This is a simplified mapping.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const handler = (payload: any) => {
                    // Insforge payload structure for postgres_changes
                    callback({
                        new: payload,
                        old: {}, // simplified
                        eventType: payload.meta?.senderType === 'system' ? 'UPDATE' : 'INSERT', // simplified
                        schema: filter.schema,
                        table: tableName,
                        commit_timestamp: payload.meta?.timestamp
                    });
                };

                // Connect if not connected
                if (!extendedClient.realtime.isConnected) {
                    extendedClient.realtime.connect();
                }

                extendedClient.realtime.subscribe(name);

                // We add multiple listeners if event is *
                if (filter.event === "*") {
                    extendedClient.realtime.on(`INSERT_${tableName}`, handler);
                    extendedClient.realtime.on(`UPDATE_${tableName}`, handler);
                    extendedClient.realtime.on(`DELETE_${tableName}`, handler);
                } else {
                    extendedClient.realtime.on(`${filter.event}_${tableName}`, handler);
                }

                return {
                    subscribe: () => {
                        return { unsubscribe: () => extendedClient.realtime.unsubscribe(name) };
                    }
                };
            },
            subscribe: () => {
                if (!extendedClient.realtime.isConnected) {
                    extendedClient.realtime.connect();
                }
                extendedClient.realtime.subscribe(name);
                return { unsubscribe: () => extendedClient.realtime.unsubscribe(name) };
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extendedClient.removeChannel = (channel: any) => {
        if (channel && channel.unsubscribe) {
            channel.unsubscribe();
        }
    };

    // storage is already on rawClient.storage, but we expose it at root if needed
    extendedClient.storage = rawClient.storage;

    client = extendedClient;
    return client;
}
