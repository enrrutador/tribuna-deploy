import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Search,
  Star,
  Menu,
  X,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLiveMatches } from "@/lib/hooks";
import { Badge } from "@/components/ui/Badge";
import LeaguesDrawer from "./LeaguesDrawer";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

export default function Header() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  const { data: liveData } = useLiveMatches();
  const liveCount = liveData?.totalMatches ?? 0;
  const liveMatches = liveData?.groups.flatMap((g) => g.matches) ?? [];

  const isHome = location === "/";

  const navItems = [
    { href: "/", label: t("Inicio"), icon: <Activity size={18} /> },
    { href: "/live", label: t("En Vivo"), icon: <Radio size={18} />, badge: liveCount },
    { href: "/favorites", label: t("Favoritos"), icon: <Star size={18} /> },
  ];

  return (
    <>
      <header className="safe-top glass-strong sticky top-0 z-50 border-b border-white/5">
        {/* Live ticker strip */}
        <AnimatePresence>
          {liveCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 36, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative flex items-center overflow-hidden bg-[var(--color-live)]/10 border-b border-[var(--color-live)]/20"
            >
              <div className="flex shrink-0 items-center gap-2 bg-[var(--color-live)]/20 px-3 py-2 z-10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-live)] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-live)]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-live)]">
                  {liveCount} {t("EN VIVO")}
                </span>
              </div>
              <div className="relative overflow-hidden flex-1">
                <div className="flex gap-8 animate-ticker whitespace-nowrap px-4">
                  {[...liveMatches, ...liveMatches].map((m) => (
                    <Link
                      key={m.id}
                      href={`/match/${m.leagueId}:${m.id}`}
                      className="inline-flex items-center gap-2 text-[12px] text-[var(--color-slate-200)] hover:text-white transition-colors"
                    >
                      <span className="text-[var(--color-slate-400)]">{m.homeTeam.shortName}</span>
                      <span className="font-bold tabular-nums text-white">
                        {m.homeScore} – {m.awayScore}
                      </span>
                      <span className="text-[var(--color-live)] font-bold tabular-nums">
                        {m.minute}'
                      </span>
                      <span className="text-[var(--color-slate-400)]">{m.awayTeam.shortName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main header row */}
        <div className="flex h-14 items-center justify-between px-4 gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--color-lime-500)] via-[var(--color-cyan-500)] to-[var(--color-magenta-500)] animate-gradient opacity-90" />
              <div className="absolute inset-[2px] rounded-[10px] bg-[var(--color-carbon)] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--color-lime-400)]" fill="currentColor">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 14 L12 8 L16 14 Z" fill="currentColor" />
                  <circle cx="12" cy="12.5" r="1.5" fill="var(--color-carbon)" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-gradient-lime leading-none">
                TRIBUNA
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--color-slate-500)] leading-none mt-0.5">
                {t("Fútbol en vivo")}
              </span>
            </div>
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
                    location === item.href
                      ? "text-[var(--color-lime-400)]"
                      : "text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-white/5"
                  )}
                >
                  {location === item.href && (
                    <motion.div
                      layoutId="header-nav"
                      className="absolute inset-0 rounded-lg bg-[var(--color-lime-500)]/10 border border-[var(--color-lime-500)]/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge tone="live" pulse className="relative z-10 text-[9px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  ) : null}
                </div>
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                searchOpen
                  ? "bg-[var(--color-lime-500)] text-[var(--color-void)]"
                  : "text-[var(--color-slate-400)] hover:bg-white/5 hover:text-[var(--color-slate-200)]"
              )}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Leagues menu toggle — always visible, opens the slide-in drawer */}
            <motion.button
              onClick={() => setDrawerOpen((v) => !v)}
              whileTap={{ scale: 0.92 }}
              aria-label={t("Ver torneos")}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg transition-shadow",
                "bg-gradient-to-br from-[var(--color-lime-500)] via-[var(--color-cyan-500)] to-[var(--color-magenta-500)] animate-gradient",
                "shadow-[0_0_16px_var(--color-lime-glow)] hover:shadow-[0_0_22px_var(--color-cyan-glow)]"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {drawerOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[var(--color-void)]"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[var(--color-void)]"
                  >
                    <Menu size={18} strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 52, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <Search size={16} className="text-[var(--color-slate-500)] shrink-0" />
                <input
                  type="text"
                  placeholder={t("Buscar equipo, torneo o jugador")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[var(--color-slate-100)] placeholder:text-[var(--color-slate-500)] outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[11px] text-[var(--color-lime-400)] hover:text-[var(--color-lime-300)]"
                  >
                    {t("Limpiar")}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Slide-in leagues drawer (closes on Escape, backdrop, and navigation) */}
      <LeaguesDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
