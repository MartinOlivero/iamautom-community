"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Users, BookOpen, Trophy, ArrowRight, Star, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

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

/**
 * Public landing page at "/".
 * Full redesign with glassmorphism, animations, and modern UI.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Iamautom Lab</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/login">
              <Button size="sm" className="glow-orange-sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">Iamautom Lab</span>
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
