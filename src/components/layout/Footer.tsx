import { Link } from "wouter";
import { Heart, Radio, Trophy, Shield, ExternalLink, Mail, MessageCircle } from "lucide-react";

const tournaments = [
  { slug: "mundial-2026", name: "Mundial 2026" },
  { slug: "copa-libertadores", name: "Libertadores" },
  { slug: "liga-profesional", name: "Liga Profesional" },
  { slug: "champions-league", name: "Champions League" },
  { slug: "premier-league", name: "Premier League" },
  { slug: "la-liga", name: "La Liga" },
];

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/live", label: "En Vivo" },
  { href: "/tournaments", label: "Torneos" },
  { href: "/favorites", label: "Favoritos" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5">
      {/* Main footer */}
      <div className="glass-soft">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--color-lime-500)] via-[var(--color-cyan-500)] to-[var(--color-magenta-500)] animate-gradient opacity-90" />
                  <div className="absolute inset-[2px] rounded-[6px] bg-[var(--color-carbon)] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-lime-400)]" fill="currentColor">
                      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 14 L12 8 L16 14 Z" fill="currentColor" />
                      <circle cx="12" cy="12.5" r="1.5" fill="var(--color-carbon)" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tighter text-gradient-lime leading-none">
                    TRIBUNA
                  </span>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--color-slate-500)] leading-none mt-0.5">
                    Fútbol en vivo
                  </span>
                </div>
              </Link>
              <p className="mt-4 max-w-xs text-xs leading-relaxed text-[var(--color-slate-500)]">
                Resultados en vivo, fixture, tablas, estadísticas y favoritos del fútbol argentino y mundial.
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <Radio size={12} className="text-[var(--color-live)]" />
                <span className="text-[10px] font-semibold text-[var(--color-slate-500)]">
                  Datos en tiempo real
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
                Navegación
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-slate-500)] transition-colors hover:text-[var(--color-lime-400)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Torneos */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
                Torneos
              </h4>
              <ul className="space-y-2">
                {tournaments.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/tournament/${t.slug}`}
                      className="flex items-center gap-1.5 text-sm text-[var(--color-slate-500)] transition-colors hover:text-[var(--color-lime-400)]"
                    >
                      <Trophy size={10} className="shrink-0 text-[var(--color-slate-600)]" />
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
                Información
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="/sitemap.xml" target="_blank" className="flex items-center gap-1.5 text-sm text-[var(--color-slate-500)] transition-colors hover:text-[var(--color-lime-400)]">
                    <ExternalLink size={10} className="shrink-0 text-[var(--color-slate-600)]" />
                    Sitemap
                  </a>
                </li>
                <li>
                  <span className="flex items-start gap-1.5 text-sm text-[var(--color-slate-500)]">
                    <Shield size={10} className="mt-1 shrink-0 text-[var(--color-slate-600)]" />
                    Datos de terceros obtenidos de fuentes públicas.
                  </span>
                </li>
                <li>
                  <span className="flex items-start gap-1.5 text-sm text-[var(--color-slate-500)]">
                    <ExternalLink size={10} className="mt-1 shrink-0 text-[var(--color-slate-600)]" />
                    Los derechos de las imágenes y contenidos pertenecen a sus respectivos dueños.
                  </span>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
                Contacto
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="mailto:tribunafutbolcontacto@gmail.com"
                    className="flex items-center gap-2 text-sm text-[var(--color-slate-500)] transition-colors hover:text-[var(--color-lime-400)]"
                  >
                    <Mail size={12} className="shrink-0 text-[var(--color-slate-600)]" />
                    tribunafutbolcontacto@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[var(--color-slate-500)] transition-colors hover:text-[var(--color-lime-400)]"
                  >
                    <MessageCircle size={12} className="shrink-0 text-[var(--color-slate-600)]" />
                    @tribuna_futbol
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 bg-[var(--color-void)]/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-[11px] text-[var(--color-slate-600)]">
            © {new Date().getFullYear()} Tribuna. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1 text-[11px] text-[var(--color-slate-600)]">
            Hecho con <Heart size={10} className="text-[var(--color-magenta-500)]" /> en Argentina
          </p>
        </div>
      </div>
    </footer>
  );
}
