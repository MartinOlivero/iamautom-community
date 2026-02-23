import Link from "next/link";

/**
 * Public landing page at "/".
 * Minimal, premium design driving visitors to join or log in.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-dark text-brand-text relative overflow-hidden flex flex-col transition-colors duration-500">
      {/* 3D Animated Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-80 dark:opacity-60">
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark animate-blob" />
        <div className="absolute inset-0 backdrop-blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* ── Header ───────────────────────────────── */}
        <header className="flex items-center justify-between px-6 lg:px-12 py-6 glass dark:glass-dark mx-4 lg:mx-8 mt-4 rounded-2xl shadow-glass border border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-display text-xl">IamAutom</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium rounded-input
                     border border-white/20 hover:bg-white/10 transition-colors"
          >
            Miembros
          </Link>
        </header>

        {/* ── Hero ─────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill
                          bg-white/10 text-sm text-white/70 border border-white/10 shadow-glow-neon">
              <span>🚀</span>
              <span>Comunidad Premium de IA & Automatización</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl leading-[1.1] tracking-tight">
              Aprende.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-electric-blue to-brand-violet">Automatiza.</span>{" "}
              Crece.
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-lg mx-auto leading-relaxed">
              Únete a la comunidad donde creamos negocios con inteligencia
              artificial, automatizaciones y las tecnologías más nuevas del mercado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/planes"
                className="px-8 py-3.5 text-base font-semibold rounded-input
                         bg-gradient-to-r from-brand-accent to-brand-electric-blue text-white
                         hover:shadow-glow-neon
                         active:scale-[0.98] transition-all"
              >
                Ver Planes →
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 text-base font-medium rounded-input
                         border border-white/20 hover:bg-white/10 transition-all"
              >
                Ya soy miembro
              </Link>
            </div>

            {/* Social proof */}
            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-white/40">
              <div className="flex items-center gap-1.5">
                <span>📚</span>
                <span>Cursos exclusivos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🔴</span>
                <span>Sesiones en vivo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>💬</span>
                <span>Comunidad activa</span>
              </div>
            </div>
          </div>
        </main>

        {/* ── Footer minimal ──────────────────────── */}
        <footer className="text-center py-6 text-xs text-white/30">
          © {new Date().getFullYear()} IamAutom — Tincho Olivero
        </footer>
      </div>
    </div>
  );
}
