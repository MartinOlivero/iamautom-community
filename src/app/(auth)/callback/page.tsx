"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // The InsforgeBrowserProvider in layout.tsx will detect the 
        // code/session in the URL and set up the session automatically.
        // We just wait for a second and then redirect to the destination.
        const next = searchParams.get("next") || "/app/feed";

        const timeoutId = setTimeout(() => {
            router.push(next);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-white rounded-full animate-spin mx-auto mb-4" />
                <h1 className="text-xl font-medium text-white">Completando inicio de sesión...</h1>
                <p className="text-brand-muted mt-2">Serás redirigido en unos segundos.</p>
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
