"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

function LoginForm() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/app/feed";
    const supabase = createClient();

    async function handleGoogleLogin() {
        setError("");
        setIsGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(redirectTo)}`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Error al conectar con Google";
            setError(message);
            setIsGoogleLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Previene race-conditions del Soft-Router de Next con cookies
                window.location.href = redirectTo;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
                        emailRedirectTo: `${window.location.origin}/callback`,
                    },
                });
                if (error) throw error;
                setSuccessMessage(
                    "¡Cuenta creada! Revisá tu email para confirmar tu cuenta."
                );
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Ocurrió un error inesperado";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-white">
                        <span className="text-3xl">⚡</span>
                        <span className="font-display text-2xl">IamAutom</span>
                    </Link>
                    <p className="mt-2 text-sm text-white/50">
                        {mode === "login"
                            ? "Ingresá a tu cuenta"
                            : "Creá tu cuenta para empezar"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-brand-card rounded-card border border-brand-border p-8">
                    {/* Tabs */}
                    <div className="flex bg-brand-hover-bg rounded-input p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => { setMode("login"); setError(""); setSuccessMessage(""); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-[6px] transition-all ${mode === "login"
                                ? "bg-brand-card text-brand-text shadow-sm"
                                : "text-brand-muted hover:text-brand-text-secondary"
                                }`}
                        >
                            Iniciar sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode("register"); setError(""); setSuccessMessage(""); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-[6px] transition-all ${mode === "register"
                                ? "bg-brand-card text-brand-text shadow-sm"
                                : "text-brand-muted hover:text-brand-text-secondary"
                                }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
                            <Input
                                label="Nombre completo"
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        {error && (
                            <div className="p-3 rounded-input bg-red-50 border border-red-200 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-input bg-green-50 border border-green-200 text-sm text-green-700">
                                {successMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full"
                        >
                            {mode === "login" ? "Ingresar" : "Crear cuenta"}
                        </Button>
                    </form>

                    {/* Separador */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-brand-border" />
                        <span className="text-xs text-brand-muted uppercase tracking-wider">o</span>
                        <div className="flex-1 h-px bg-brand-border" />
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-input border border-brand-border bg-brand-hover-bg text-brand-text text-sm font-medium hover:bg-brand-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <div className="w-5 h-5 border-2 border-brand-muted border-t-brand-text rounded-full animate-spin" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continuar con Google
                    </button>
                </div>

                {/* Footer link */}
                <p className="text-center mt-6 text-sm text-white/40">
                    <Link href="/" className="hover:text-white/60 transition-colors">
                        ← Volver al inicio
                    </Link>
                </p>
            </div>
        </div>
    );
}

/**
 * Login/Register page with tab toggle.
 * Uses Supabase email/password authentication.
 * Wrapped in Suspense to prevent useSearchParams hydration errors in Next.js build.
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-dark flex items-center justify-center text-brand-muted">Cargando plataforma...</div>}>
            <LoginForm />
        </Suspense>
    );
}
