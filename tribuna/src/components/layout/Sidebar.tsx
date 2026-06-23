import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTournaments, useFavorites } from "@/lib/hooks";
import { Spinner } from "@/components/ui/Spinner";

const CATEGORY_LABELS: Record<string, string> = {
  destacados: "⭐ Destacados",
  argentina: "🇦🇷 Argentina",
  sudamerica: "🌎 Sudamérica",
  world: "🌍 Mundo",
};

const CATEGORY_ORDER = ["destacados", "argentina", "sudamerica", "world"];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [location] = useLocation();
  const { data: tournaments, isLoading } = useTournaments();
  const { isFavoriteTournament, toggleTournament } = useFavorites();

  const toggleCat = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-[var(--color-carbon)]/60 backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3">
        {/* Live shortcut */}
        <Link href="/live">
          <motion.div
            whileHover={{ x: 3 }}
            className="mb-3 flex items-center gap-2.5 rounded-xl bg-[var(--color-live)]/8 border border-[var(--color-live)]/15 px-3 py-2.5 text-sm font-semibold text-[var(--color-live)] transition-all hover:bg-[var(--color-live)]/15"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-live)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-live)]" />
            </span>
            En Vivo
          </motion.div>
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size={20} />
          </div>
        ) : tournaments ? (
          <div className="space-y-1">
            {CATEGORY_ORDER.map((cat) => {
              const items = tournaments[cat as keyof typeof tournaments];
              if (!items || items.length === 0) return null;
              const isOpen = !collapsed[cat];

              return (
                <div key={cat} className="mb-2">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)] transition-colors"
                  >
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5">
                      {items.map((t) => {
                        const isActive = location === `/tournament/${t.slug}`;
                        const isFav = isFavoriteTournament(t.slug);

                        return (
                          <Link key={t.slug} href={`/tournament/${t.slug}`}>
                            <motion.div
                              whileHover={{ x: 4 }}
                              className={cn(
                                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all",
                                isActive
                                  ? "bg-[var(--color-lime-500)]/10 text-[var(--color-lime-400)] font-semibold border-l-2 border-[var(--color-lime-500)]"
                                  : "text-[var(--color-slate-400)] hover:bg-white/5 hover:text-[var(--color-slate-200)]"
                              )}
                            >
                              <span className="text-base leading-none">{t.flag}</span>
                              <span className="flex-1 truncate">{t.name}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleTournament(t.slug);
                                }}
                                className={cn(
                                  "transition-opacity",
                                  isFav
                                    ? "opacity-80 text-[var(--color-warn)]"
                                    : "opacity-0 group-hover:opacity-40 hover:!opacity-100"
                                )}
                              >
                                <Trophy size={12} className={isFav ? "fill-current" : ""} />
                              </button>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
