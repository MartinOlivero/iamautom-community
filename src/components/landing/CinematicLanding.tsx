"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Bot, Zap, Network, TerminalSquare } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// --------------------------------------------------------
// NOISE OVERLAY COMPONENT
// --------------------------------------------------------
const GlobalNoise = () => (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="n" x="0" y="0">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#n)" />
        </svg>
    </div>
);

// --------------------------------------------------------
// NAVBAR - "The Floating Island"
// --------------------------------------------------------
const Navbar = () => {
    const navRef = useRef<HTMLElement>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-[3rem] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${scrolled
                ? "w-[90vw] max-w-4xl bg-[#04080f]/70 backdrop-blur-2xl border border-[#38bdf8]/20 shadow-glow-blue"
                : "w-[90vw] max-w-6xl bg-transparent border border-transparent"
                }`}
        >
            <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Zap size={16} className="text-white fill-current" />
                </div>
                <span className="font-display font-semibold text-xl text-white tracking-tight">IamAutom</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8b9ab8]">
                <a href="#features" className="hover:text-white transition-colors duration-300 hover:-translate-y-px">Ecosistema</a>
                <a href="#philosophy" className="hover:text-white transition-colors duration-300 hover:-translate-y-px">Filosofía</a>
                <a href="#protocol" className="hover:text-white transition-colors duration-300 hover:-translate-y-px">Protocolo</a>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/login" className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors hover:-translate-y-px">
                    Ingresar
                </Link>
                <Link
                    href="/planes"
                    className="relative overflow-hidden px-6 py-2.5 rounded-[2rem] text-sm font-semibold text-white bg-white/5 border border-white/10 hover:border-[#38bdf8]/50 transition-all duration-300 hover:scale-[1.03] group"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Unirse <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-aurora opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
            </div>
        </nav>
    );
};

// --------------------------------------------------------
// HERO - "The Opening Shot"
// --------------------------------------------------------
const Hero = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".hero-text",
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 }
            );
        }, container);
        return () => ctx.revert();
    }, { scope: container });

    return (
        <section ref={container} className="relative h-[100dvh] w-full flex items-end pb-24 md:pb-32 px-6 lg:px-20 overflow-hidden">
            {/* Background Image & Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-hero bg-cover bg-center scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-[#04080f]/80 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.15),transparent_50%)]" />
            </div>

            <div className="relative z-10 max-w-4xl flex flex-col gap-6">
                <div className="hero-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-xs font-mono text-[#10b981] uppercase tracking-wider">Acceso Beta Abierto</span>
                </div>

                <h1 className="hero-text text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter">
                    <span className="block font-display font-bold text-white mb-2">Automatización </span>
                    <span className="block font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#a78bfa] to-[#f97316]">
                        más allá del límite.
                    </span>
                </h1>

                <p className="hero-text text-lg md:text-xl text-[#8b9ab8] max-w-xl leading-relaxed mt-4">
                    La comunidad élite para fundadores, operadores y creadores. Transforma días de trabajo manual en sistemas autónomos usando IA y código no-code.
                </p>

                <div className="hero-text mt-4 flex items-center gap-6">
                    <Link href="/planes" className="relative overflow-hidden px-8 py-4 rounded-[2rem] text-sm font-semibold text-white bg-gradient-accent shadow-glow-accent hover:scale-[1.03] transition-transform duration-300 flex items-center gap-2 group">
                        <span className="relative z-10">Explorar Protocolos</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                    <div className="flex items-center gap-3 text-xs font-mono text-white/50">
                        <span className="w-8 h-[1px] bg-white/20" />
                        V 2.0.4 ONLINE
                    </div>
                </div>
            </div>
        </section>
    );
};

// --------------------------------------------------------
// FEATURES - "Functional Artifacts"
// --------------------------------------------------------
const Features = () => {
    const container = useRef<HTMLDivElement>(null);

    // Typewriter effect state
    const [text, setText] = useState("");
    const fullText = "> Iniciando secuencia de soporte...\n> Usuario: ¿Cómo conecto Make con OpenAI?\n> IamAutom_Agent: Aquí tienes el blueprint en JSON:\n{ \"blueprint\": \"✅\" }\n> Mentoría en vivo programada.";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    // Shuffler state
    const [activeCard, setActiveCard] = useState(0);
    useEffect(() => {
        const shuffle = setInterval(() => setActiveCard((p) => (p + 1) % 3), 3000);
        return () => clearInterval(shuffle);
    }, []);

    return (
        <section id="features" ref={container} className="py-32 px-6 lg:px-12 bg-[#04080f] relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">Ingeniería<br /><span className="text-[#8b9ab8] italic font-serif">de Ecosistema</span></h2>
                    <p className="text-[#8b9ab8] max-w-md">Tres pilares fundamentales diseñados no como contenido estático, sino como una máquina de crecimiento continuo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Card 1: Diagnostic Shuffler */}
                    <div className="glass rounded-[2rem] p-8 aspect-square flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 hover:border-[#38bdf8]/40">
                        <div className="flex items-center gap-3 mb-auto relative z-10">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#38bdf8]">
                                <Bot size={20} />
                            </div>
                            <h3 className="font-semibold text-white">Librería Dinámica</h3>
                        </div>

                        <div className="relative h-48 w-full mt-8 flex justify-center items-center">
                            {[0, 1, 2].map((i) => {
                                const diff = (i - activeCard + 3) % 3;
                                return (
                                    <div
                                        key={i}
                                        className="absolute w-full max-w-[240px] p-4 rounded-2xl bg-[#0a101e] border border-white/10 shadow-xl transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                        style={{
                                            transform: `translateY(${diff * 15}px) scale(${1 - diff * 0.05})`,
                                            opacity: 1 - diff * 0.3,
                                            zIndex: 3 - diff,
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                                            <span className="text-xs font-mono text-white/50">Módulo 0{i + 1}</span>
                                        </div>
                                        <div className="h-2 w-3/4 bg-white/10 rounded-full mb-2" />
                                        <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                                    </div>
                                )
                            })}
                        </div>
                        <p className="text-sm text-[#8b9ab8] mt-6 relative z-10">Cursos de prompt engineering, flujos en Make, y agentes IA autónomos actualizados semanalmente.</p>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#38bdf8]/10 blur-[80px] rounded-full pointer-events-none" />
                    </div>

                    {/* Card 2: Telemetry Typewriter */}
                    <div className="glass rounded-[2rem] p-8 aspect-square flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 hover:border-[#a78bfa]/40">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#a78bfa]">
                                    <TerminalSquare size={20} />
                                </div>
                                <h3 className="font-semibold text-white">Soporte IA</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#10b981]/20 bg-[#10b981]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                <span className="text-[10px] uppercase font-mono tracking-widest text-[#10b981]">Live</span>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#04080f] rounded-2xl p-4 border border-white/5 overflow-hidden relative font-mono text-xs text-[#a78bfa] leading-relaxed">
                            <pre className="whitespace-pre-wrap font-mono relative z-10">
                                {text}<span className="inline-block w-1.5 h-3 bg-[#a78bfa] ml-1 animate-pulse" />
                            </pre>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] h-full w-full opacity-60 pointer-events-none" />
                        </div>

                        <p className="text-sm text-[#8b9ab8] mt-6 relative z-10">Resolución de bloqueos técnicos en tiempo real por la comunidad y soporte directo de Tincho.</p>
                    </div>

                    {/* Card 3: Cursor Protocol Scheduler */}
                    <div className="glass rounded-[2rem] p-8 aspect-square flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 hover:border-[#f97316]/40">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#f97316]">
                                <Network size={20} />
                            </div>
                            <h3 className="font-semibold text-white">Live Sessions</h3>
                        </div>

                        <div className="flex-1 grid grid-cols-5 grid-rows-3 gap-2 relative z-10">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={i} className={`rounded-lg border border-white/5 ${i === 7 ? 'bg-[#f97316]/20 border-[#f97316]/50 shadow-glow-accent' : 'bg-white/5'} transition-colors duration-500`} />
                            ))}
                            {/* Fake cursor animating */}
                            <div className="absolute w-4 h-4 text-white z-20 animate-[float_4s_infinite]" style={{ left: '50%', top: '50%' }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth="1" className="drop-shadow-lg"><path d="M4 2v20l5.5-5.5H20z" /></svg>
                            </div>
                        </div>

                        <p className="text-sm text-[#8b9ab8] mt-6 relative z-10">Mentorías grupales semanales, análisis de modelos de negocio y networking de alto nivel.</p>
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#f97316]/10 blur-[80px] rounded-full pointer-events-none" />
                    </div>

                </div>
            </div>
        </section >
    );
};

// --------------------------------------------------------
// PHILOSOPHY - "The Manifesto"
// --------------------------------------------------------
const Philosophy = () => {
    const container = useRef<HTMLDivElement>(null);
    const textRef1 = useRef<HTMLDivElement>(null);
    const textRef2 = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const ctx = gsap.context(() => {
            gsap.from(textRef1.current, {
                scrollTrigger: { trigger: container.current, start: "top 70%" },
                opacity: 0, y: 30, duration: 1, ease: "power3.out"
            });
            gsap.from(textRef2.current, {
                scrollTrigger: { trigger: container.current, start: "top 50%" },
                opacity: 0, y: 50, duration: 1.2, ease: "power3.out", delay: 0.2
            });
        }, container);
        return () => ctx.revert();
    }, { scope: container });

    return (
        <section ref={container} className="py-40 px-6 lg:px-12 bg-[#04080f] relative overflow-hidden flex items-center justify-center min-h-[80vh]">
            {/* Texture bg */}
            <div className="absolute inset-0 opacity-[0.15] bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed grayscale mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#04080f] via-transparent to-[#04080f]" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <div ref={textRef1} className="text-[#8b9ab8] text-lg md:text-2xl font-medium tracking-wide mb-8">
                    La mayoría de las academias se enfocan en: <span className="line-through opacity-50">teoría superficial.</span>
                </div>
                <div ref={textRef2} className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-white leading-tight">
                    Nosotros nos enfocamos en: <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#a78bfa] not-italic font-display font-bold">sistemas escalables.</span>
                </div>
            </div>
        </section>
    );
};

// --------------------------------------------------------
// PROTOCOL - "Sticky Archive"
// --------------------------------------------------------
const Protocol = () => {
    const container = useRef<HTMLDivElement>(null);

    const steps = [
        { num: "01", title: "Integra", desc: "Aprende e implementa las APIs del mañana hoy mismo.", color: "from-[#38bdf8] to-transparent" },
        { num: "02", title: "Automatiza", desc: "Conecta plataformas para eliminar tareas repetitivas 100%.", color: "from-[#a78bfa] to-transparent" },
        { num: "03", title: "Escala", desc: "Multiplica tu output operativo sin sumar horas hombre.", color: "from-[#f97316] to-transparent" }
    ];

    return (
        <section ref={container} className="py-32 px-6 lg:px-12 bg-[#04080f] relative z-10">
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                {steps.map((step, i) => (
                    <div key={i} className="sticky top-24 w-full glass rounded-[3rem] p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 transform transition-all duration-700 hover:scale-[1.01] hover:border-white/20">
                        <div className="text-6xl md:text-8xl font-serif italic text-white/5">{step.num}</div>
                        <div className="flex-1">
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{step.title}</h3>
                            <p className="text-xl text-[#8b9ab8]">{step.desc}</p>
                        </div>
                        {/* Visual Abstract Motif */}
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} blur-2xl opacity-50 animate-pulse-glow flex-shrink-0`} />
                    </div>
                ))}
            </div>
        </section>
    );
};

// --------------------------------------------------------
// FOOTER
// --------------------------------------------------------
const Footer = () => (
    <footer className="bg-[#0a101e] mt-20 pt-20 pb-10 px-6 rounded-t-[4rem] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">⚡</span>
                    <span className="font-display text-2xl font-bold text-white">IamAutom</span>
                </div>
                <p className="text-[#8b9ab8] max-w-sm text-sm">Escalando el potencial humano mediante IA y automatización. Desarrollado por Tincho Olivero.</p>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 text-sm font-medium">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="font-mono text-[#8b9ab8] tracking-widest uppercase text-[10px]">Systems Operational</span>
                </div>
                <Link href="/login" className="text-white/60 hover:text-white transition-colors">Volver a plataforma →</Link>
            </div>
        </div>
    </footer>
);

// --------------------------------------------------------
// MAIN COMPONENT EXPORT
// --------------------------------------------------------
export default function CinematicLanding() {
    return (
        <div className="bg-[#04080f] min-h-screen text-white selection:bg-[#38bdf8]/30">
            <GlobalNoise />
            <Navbar />
            <Hero />
            <Features />
            <Philosophy />
            <Protocol />
            <Footer />
        </div>
    );
}
