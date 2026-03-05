/**
 * Helper to call the XP award API and dispatch the toast notification.
 * Call this from client components or hooks after a user action.
 */
export async function triggerXPAward(action: string) {
    try {
        const res = await fetch("/api/xp/award", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action }),
        });

        if (!res.ok) {
            console.error("XP API returned status", res.status);
            return null;
        }

        const data = await res.json();

        // El toast se dispara ahora via el Realtime listener en ProtectedLayout
        // que escucha la tabla de notificaciones.
        // No es necesario llamar a showXPToast aquí.

        return data;
    } catch (err) {
        console.error("Failed to trigger XP award:", err);
        return null;
    }
}
