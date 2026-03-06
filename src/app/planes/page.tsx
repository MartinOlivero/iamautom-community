"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, CheckCircle, Star, Clock, Sparkles, Crown } from "lucide-react";
import { PLANS } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const boxes = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <div className="flex items-center gap-3">
      {boxes.map((b) => (
        <div key={b.label} className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-black text-white">{String(b.value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PlanesPage() {
  const [billingCycle, setBillingCycle] = useState<"quarterly" | "biannual">("quarterly");
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
        alert(data.error || "Error al crear la sesion de pago");
      }
    } catch {
      alert("Error de conexion. Intenta de nuevo.");
    } finally {
      setLoadingPlan(null);
    }
  }

  const isQuarterly = billingCycle === "quarterly";

  return (
    <div className="min-h-screen bg-[#0d0d18] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d18]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Iamautom Lab</span>
          </Link>
          <Link href="/login">
            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
              Iniciar Sesion
            </button>
          </Link>
        </div>
      </nav>

      {/* Decorative blur */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/[0.08] blur-3xl rounded-full pointer-events-none" />

      <div className="pt-28 pb-20 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            {reason === "inactive" && (
              <motion.div variants={fadeUp} custom={0} className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-400 max-w-md mx-auto">
                Tu suscripcion no esta activa. Elegi un plan para acceder a la plataforma.
              </motion.div>
            )}

            <motion.span variants={fadeUp} custom={0} className="text-indigo-400 text-xs font-semibold tracking-widest uppercase">
              Planes
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-white mt-3 mb-4">
              Elegí el plan que{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                se adapte a vos
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-slate-400 text-lg max-w-md mx-auto">
              Accede a cursos, comunidad, eventos en vivo y mucho mas.
            </motion.p>
          </motion.div>

          {/* Countdown */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-col items-center gap-4 mb-10">
            <p className="text-amber-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Precio de lanzamiento disponible hasta el cierre del primer trimestre
            </p>
            <Countdown targetDate="2026-04-01T00:00:00" />
          </motion.div>

          {/* Billing toggle */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-col items-center gap-3 mb-12">
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-1.5 flex">
              <button
                onClick={() => setBillingCycle("quarterly")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isQuarterly
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Trimestral
              </button>
              <button
                onClick={() => setBillingCycle("biannual")}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !isQuarterly
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semestral
              </button>
            </div>
            {!isQuarterly && (
              <span className="text-green-400 text-xs font-medium">Ahorras mas con el plan semestral</span>
            )}
          </motion.div>

          {/* Plan cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative">
            {/* Member */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={5}
              className="border border-slate-800 bg-[#0f0f1e] rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-white">{PLANS.member.name}</h2>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="text-slate-500 text-lg line-through">
                  ${isQuarterly ? PLANS.member.quarterlyOriginal.toLocaleString("es-AR") : PLANS.member.biannualOriginal.toLocaleString("es-AR")}
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-semibold">
                  LANZAMIENTO
                </span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black text-white">
                  ${isQuarterly ? PLANS.member.quarterlyPrice : PLANS.member.biannualPrice}
                </span>
                <span className="text-slate-500 text-sm ml-1">
                  USD/{isQuarterly ? "trimestre" : "semestre"}
                </span>
              </div>
              <p className="text-green-400 text-xs font-medium mb-6 pb-6 border-b border-slate-800">
                {isQuarterly ? `Equivale a ${PLANS.member.quarterlyEquiv}` : PLANS.member.biannualEquiv}
              </p>

              <ul className="space-y-3 mb-8">
                {PLANS.member.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={loadingPlan === "member"}
                onClick={() => handleSelectPlan("member")}
                className="w-full rounded-xl font-bold text-sm px-6 py-3.5 transition-all duration-200 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingPlan === "member" ? "Procesando..." : "Entrar a la formacion"}
                {loadingPlan !== "member" && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.div>

            {/* Inner Circle */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={6}
              className="border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-950/50 to-[#0f0f1e] shadow-xl shadow-indigo-600/15 rounded-2xl p-6 sm:p-8 relative"
            >
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <Star className="w-3 h-3" /> Mas popular
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6 mt-2">
                <Crown className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">{PLANS.inner_circle.name}</h2>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="text-slate-500 text-lg line-through">
                  ${isQuarterly ? PLANS.inner_circle.quarterlyOriginal.toLocaleString("es-AR") : PLANS.inner_circle.biannualOriginal.toLocaleString("es-AR")}
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-semibold">
                  LANZAMIENTO
                </span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black text-white">
                  ${isQuarterly ? PLANS.inner_circle.quarterlyPrice.toLocaleString("es-AR") : PLANS.inner_circle.biannualPrice.toLocaleString("es-AR")}
                </span>
                <span className="text-slate-500 text-sm ml-1">
                  USD/{isQuarterly ? "trimestre" : "semestre"}
                </span>
              </div>
              <p className="text-green-400 text-xs font-medium mb-6 pb-6 border-b border-slate-800">
                {isQuarterly ? `Equivale a ${PLANS.inner_circle.quarterlyEquiv}` : PLANS.inner_circle.biannualEquiv}
              </p>

              <ul className="space-y-3 mb-8">
                {PLANS.inner_circle.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={loadingPlan === "inner_circle"}
                onClick={() => handleSelectPlan("inner_circle")}
                className="w-full rounded-xl font-bold text-sm px-6 py-3.5 transition-all duration-200 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingPlan === "inner_circle" ? "Procesando..." : "Entrar a la formacion"}
                {loadingPlan !== "inner_circle" && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.div>
          </div>

          {/* Guarantee */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7} className="text-center mt-12">
            <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span>
                <strong className="text-white">7 días de acceso gratuito</strong> — sin costo y sin tarjeta. Explorá la plataforma y empezá a aprender.
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
