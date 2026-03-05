"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap, Users, BookOpen, Trophy, ArrowRight, Star, CheckCircle, Shield, Clock, Sparkles, Crown } from "lucide-react";
import Button from "@/components/ui/Button";
import { PLANS } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

const benefits = [
  {
    icon: BookOpen,
    title: "IA & Automatización",
    description: "Aprende a dominar la Inteligencia Artificial y herramientas digitales para optimizar tu trabajo.",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Conecta con emprendedores y profesionales que comparten tu visión de automatizar.",
  },
  {
    icon: Zap,
    title: "Negocios Digitales",
    description: "Domina las herramientas necesarias para montar y escalar un negocio digital desde cero.",
  },
  {
    icon: Trophy,
    title: "Liderazgo en Automatización",
    description: "Posiciónate como un experto en el uso de herramientas tecnológicas avanzadas.",
  },
];

const testimonials = [
  {
    name: "Carlos M.",
    role: "Founder, AutomateX",
    text: "IamAutom transformó mi forma de trabajar. Automaticé el 80% de mis procesos en 3 meses.",
    avatar: "CM",
  },
  {
    name: "Laura G.",
    role: "Marketing Manager",
    text: "La comunidad es increíble. Siempre hay alguien dispuesto a ayudar y compartir conocimiento.",
    avatar: "LG",
  },
  {
    name: "Diego R.",
    role: "Freelancer",
    text: "Los cursos son prácticos y al grano. Cada lección tiene aplicación directa en mi trabajo.",
    avatar: "DR",
  },
];

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

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"quarterly" | "biannual">("quarterly");
  const isQuarterly = billingCycle === "quarterly";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="relative flex items-center">
            <div className="absolute inset-0 -inset-x-4 -inset-y-2 bg-white/15 rounded-2xl blur-xl" />
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Image src="/logo.png" alt="IamAutom Lab" width={480} height={106} className="h-10 w-auto" priority />
            </motion.div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#planes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planes
            </a>
            <Link href="/login">
              <Button size="sm" className="glow-orange-sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[120px] animate-float-2" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] animate-float-2" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Tu comunidad de crecimiento con IA</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">Aprende.</span>{" "}
              <span className="gradient-text">Evoluciona.</span>{" "}
              <span className="text-foreground">Crece.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Aprende a usar la Inteligencia Artificial para crecer profesionalmente, emprender y llevar tus ideas al siguiente nivel.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="text-base px-8 glow-orange animate-pulse-glow">
                  Iniciar Sesión
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://chat.whatsapp.com/G9L2rU7Z7H76k84C6S4W5G" target="_blank">
                <Button variant="outline" size="lg" className="text-base px-8 glass border-border/50">
                  Comunidad de WhatsApp
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" /> Acceso inmediato</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" /> +100 miembros</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" /> Potenciado por IA</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-5xl font-bold mb-4">
              Todo lo que necesitas para <span className="gradient-text">crecer con IA</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Recursos, comunidad y herramientas diseñadas para llevar tu negocio al siguiente nivel.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass-hover rounded-2xl p-6 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-5xl font-bold mb-4">
              Lo que dicen nuestros <span className="gradient-text">miembros</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="py-20 md:py-32 relative bg-[#0d0d18]">
        {/* Decorative blur */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/[0.08] blur-3xl rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-10">
            <motion.span variants={fadeUp} custom={0} className="text-indigo-400 text-xs font-semibold tracking-widest uppercase">
              Planes
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-black text-white mt-3">
              Elegí el plan que{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                se adapte a vos
              </span>
            </motion.h2>
          </motion.div>

          {/* Countdown */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="flex flex-col items-center gap-4 mb-10">
            <p className="text-amber-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Precio de lanzamiento disponible hasta el cierre del primer trimestre
            </p>
            <Countdown targetDate="2026-04-01T00:00:00" />
          </motion.div>

          {/* Billing toggle */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="flex flex-col items-center gap-3 mb-12">
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
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="border border-slate-800 bg-[#0f0f1e] rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-white">{PLANS.member.name}</h3>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="text-slate-500 text-lg line-through">
                  ${isQuarterly ? PLANS.member.quarterlyOriginal.toLocaleString() : PLANS.member.biannualOriginal.toLocaleString()}
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

              <Link href="/login?plan=member">
                <button className="w-full rounded-xl font-bold text-sm px-6 py-3.5 transition-all duration-200 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 flex items-center justify-center gap-2">
                  Entrar a la formacion
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            {/* Inner Circle */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
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
                <h3 className="text-lg font-bold text-white">{PLANS.inner_circle.name}</h3>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="text-slate-500 text-lg line-through">
                  ${isQuarterly ? PLANS.inner_circle.quarterlyOriginal.toLocaleString() : PLANS.inner_circle.biannualOriginal.toLocaleString()}
                </span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-semibold">
                  LANZAMIENTO
                </span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-black text-white">
                  ${isQuarterly ? PLANS.inner_circle.quarterlyPrice.toLocaleString() : PLANS.inner_circle.biannualPrice.toLocaleString()}
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

              <Link href="/login?plan=inner_circle">
                <button className="w-full rounded-xl font-bold text-sm px-6 py-3.5 transition-all duration-200 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2">
                  Entrar a la formacion
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Guarantee */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="text-center mt-12">
            <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>
                <strong className="text-white">Garantia de 14 dias</strong> — si no es lo que esperabas, devolvemos el dinero. Sin preguntas.
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-orange-500/10" />
            <div className="relative z-10">
              <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-5xl font-bold mb-4">
                ¿Listo para <span className="gradient-text">crecer con IA</span>?
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Únete hoy y accede a cursos, comunidad y herramientas que transformarán tu negocio.
              </motion.p>
              <motion.div variants={fadeUp} custom={2}>
                <Link href="/login">
                  <Button size="lg" className="text-base px-10 glow-orange">
                    Iniciar Sesión
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <Image src="/logo.png" alt="IamAutom Lab" width={400} height={125} className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
              <span>© {new Date().getFullYear()} Iamautom Lab</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
