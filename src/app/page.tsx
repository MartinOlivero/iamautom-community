import Link from "next/link";

/**
 * Public landing page at "/".
 * Minimal, premium design driving visitors to join or log in.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* ── Header ───────────────────────────────── */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5">
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
                          bg-white/10 text-sm text-white/70 border border-white/10">
            <span>🚀</span>
            <span>Comunidad Premium de IA & Automatización</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl leading-[1.1] tracking-tight">
            Aprende.{" "}
            <span className="text-gradient-accent">Automatiza.</span>{" "}
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
                         bg-gradient-to-r from-brand-accent to-brand-accent-hover
                         hover:shadow-lg hover:shadow-brand-accent/25
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
  );
}
