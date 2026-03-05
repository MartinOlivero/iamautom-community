"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PLANS } from "@/lib/constants";

/**
 * Plan selection page.
 * Shows Member and Inner Circle plans with monthly/annual toggle.
 * Initiates Stripe Checkout on plan selection.
 */
export default function PlanesPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");

    async function handleSelectPlan(planType: "member" | "inner_circle") {
        setLoadingPlan(planType);

        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planType, billingCycle }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Error al crear la sesión de pago");
            }
        } catch {
            alert("Error de conexión. Intentá de nuevo.");
        } finally {
            setLoadingPlan(null);
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg px-4 py-12 lg:py-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="text-3xl">⚡</span>
                        <span className="font-display text-2xl text-brand-text">IamAutom</span>
                    </div>

                    {reason === "inactive" && (
                        <div className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-200 text-sm text-amber-700 max-w-md mx-auto">
                            ⚠️ Tu suscripción no está activa. Elegí un plan para acceder a la plataforma.
                        </div>
                    )}

                    <h1 className="font-display text-4xl md:text-5xl text-brand-text mb-4">
                        Elegí tu plan
                    </h1>
                    <p className="text-brand-text-secondary text-lg max-w-md mx-auto">
                        Accedé a cursos, comunidad, eventos en vivo y mucho más.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="flex bg-brand-card rounded-input p-1 border border-brand-border">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-5 py-2 text-sm font-medium rounded-[6px] transition-all ${billingCycle === "monthly"
                                ? "bg-brand-dark text-white shadow-sm"
                                : "text-brand-muted hover:text-brand-text"
                                }`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setBillingCycle("annual")}
                            className={`px-5 py-2 text-sm font-medium rounded-[6px] transition-all ${billingCycle === "annual"
                                ? "bg-brand-dark text-white shadow-sm"
                                : "text-brand-muted hover:text-brand-text"
                                }`}
                        >
                            Anual
                            <span className="ml-1.5 text-[10px] font-semibold text-brand-success">
                                -17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plan cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Member */}
                    <Card padding="lg" hover className="relative">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-brand-text mb-1">
                                {PLANS.member.name}
                            </h2>
                            <p className="text-sm text-brand-text-secondary">
                                Todo lo que necesitás para empezar
                            </p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-brand-text font-mono">
                                ${billingCycle === "monthly" ? PLANS.member.monthlyPrice : PLANS.member.annualPrice}
                            </span>
                            <span className="text-brand-muted text-sm ml-1">
                                /{billingCycle === "monthly" ? "mes" : "año"}
                            </span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {PLANS.member.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2 text-sm text-brand-text-secondary">
                                    <span className="text-brand-success mt-0.5">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            isLoading={loadingPlan === "member"}
                            onClick={() => handleSelectPlan("member")}
                        >
                            Empezar ahora
                        </Button>
                    </Card>

                    {/* Inner Circle */}
                    <Card padding="lg" hover className="relative border-brand-gold/50">
                        {/* Popular badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-gradient-gold text-brand-dark text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-pill">
                                👑 Más popular
                            </span>
                        </div>

                        <div className="mb-6 mt-2">
                            <h2 className="text-xl font-semibold text-brand-text mb-1">
                                {PLANS.inner_circle.name}
                            </h2>
                            <p className="text-sm text-brand-text-secondary">
                                Acceso VIP completo + Tincho directo
                            </p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-brand-text font-mono">
                                ${billingCycle === "monthly" ? PLANS.inner_circle.monthlyPrice : PLANS.inner_circle.annualPrice}
                            </span>
                            <span className="text-brand-muted text-sm ml-1">
                                /{billingCycle === "monthly" ? "mes" : "año"}
                            </span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {PLANS.inner_circle.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2 text-sm text-brand-text-secondary">
                                    <span className="text-brand-gold mt-0.5">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={loadingPlan === "inner_circle"}
                            onClick={() => handleSelectPlan("inner_circle")}
                        >
                            ✨ Únete al Inner Circle
                        </Button>
                    </Card>
                </div>

                {/* Guarantee */}
                <p className="text-center mt-10 text-sm text-brand-muted">
                    🔒 Pago seguro con Stripe. Cancelá cuando quieras.
                </p>
            </div>
        </div>
    );
}
