"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/insforge/client";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState("");

    useEffect(() => {
        const next = searchParams.get("next") || "/app/feed";

        async function handleOAuthCallback() {
            try {
                const insforge = createClient();

                // Trigger session detection from OAuth callback params
                const { data, error: sessionError } = await insforge.auth.getCurrentSession();

                if (sessionError) {
                    console.error("OAuth callback session error:", sessionError);
                    setError("Error al completar el inicio de sesión. Intentá de nuevo.");
                    setTimeout(() => router.push("/login"), 3000);
                    return;
                }

                if (data?.session?.user) {
                    // Session established — redirect to destination
                    window.location.href = next;
                } else {
                    // No session yet — retry a few times (cookie may take a moment)
                    let attempts = 0;
                    const maxAttempts = 5;
                    const interval = setInterval(async () => {
                        attempts++;
                        try {
                            const { data: retryData } = await insforge.auth.getCurrentSession();
                            if (retryData?.session?.user) {
                                clearInterval(interval);
                                window.location.href = next;
                            } else if (attempts >= maxAttempts) {
                                clearInterval(interval);
                                setError("No se pudo establecer la sesión. Intentá iniciar sesión de nuevo.");
                                setTimeout(() => router.push("/login"), 3000);
                            }
                        } catch {
                            clearInterval(interval);
                            setError("Error de conexión. Intentá de nuevo.");
                            setTimeout(() => router.push("/login"), 3000);
                        }
                    }, 1000);
                }
            } catch {
                setError("Error inesperado. Redirigiendo al login...");
                setTimeout(() => router.push("/login"), 3000);
            }
        }

        handleOAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
            <div className="text-center">
                {error ? (
                    <>
                        <div className="text-3xl mb-4">⚠️</div>
                        <h1 className="text-xl font-medium text-white">{error}</h1>
                        <p className="text-brand-muted mt-2">Redirigiendo al login...</p>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <h1 className="text-xl font-medium text-white">Completando inicio de sesión...</h1>
                        <p className="text-brand-muted mt-2">Serás redirigido en unos segundos.</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-muted">
                Iniciando...
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
