"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

/**
 * Login/Register page with tab toggle.
 * Uses Supabase email/password authentication.
 */
export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/app/feed";
    const supabase = createClient();

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
                router.push(redirectTo);
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
                            onClick={() => { setMode("login"); setError(""); setSuccessMessage(""); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-[6px] transition-all ${mode === "login"
                                    ? "bg-brand-card text-brand-text shadow-sm"
                                    : "text-brand-muted hover:text-brand-text-secondary"
                                }`}
                        >
                            Iniciar sesión
                        </button>
                        <button
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
