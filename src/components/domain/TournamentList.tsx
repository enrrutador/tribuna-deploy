import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Trophy, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTournaments } from "@/lib/hooks";
import { useFavorites } from "@/lib/favorites";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/lib/i18n";

const CATEGORY_META: { id: string; labelKey: string; accent: string }[] = [
  { id: "destacados", labelKey: "Destacados", accent: "lime" },
  { id: "argentina", labelKey: "Argentina", accent: "cyan" },
  { id: "sudamerica", labelKey: "Sudamérica", accent: "magenta" },
  { id: "world", labelKey: "Mundo", accent: "cyan" },
];

const ACCENT_TEXT: Record<string, string> = {
  lime: "text-[var(--color-lime-400)]",
  cyan: "text-[var(--color-cyan-400)]",
  magenta: "text-[var(--color-magenta-400)]",
};

const ACCENT_DOT: Record<string, string> = {
  lime: "bg-[var(--color-lime-500)]",
  cyan: "bg-[var(--color-cyan-500)]",
  magenta: "bg-[var(--color-magenta-500)]",
};

/** Lookup by id for O(1) accent resolution inside the loop. */
const ACCENT_BY_ID: Record<string, { text: string; dot: string }> =
  Object.fromEntries(
    CATEGORY_META.map((c) => [c.id, { text: ACCENT_TEXT[c.accent]!, dot: ACCENT_DOT[c.accent]! }])
  );

interface TournamentListProps {
  /** Called when a tournament link is clicked (e.g. to close a drawer). */
  onNavigate?: () => void;
}

/**
 * Compact, collapsible list of all leagues grouped by category.
 * Shared between the persistent Sidebar (desktop) and the mobile/overlay
 * LeaguesDrawer so both render the exact same navigation.
 */
export default function TournamentList({ onNavigate }: TournamentListProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [location] = useLocation();
  const { data: tournaments, isLoading } = useTournaments();
  const { isFavoriteTournament, toggleTournament } = useFavorites();

  const toggleCat = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size={20} />
      </div>
    );
  }

  if (!tournaments) return null;

  return (
    <div className="space-y-1">
      {CATEGORY_META.map((cat) => {
        const items = tournaments[cat.id as keyof typeof tournaments];
        if (!items || items.length === 0) return null;
        const isOpen = !collapsed[cat.id];
        const accent = ACCENT_BY_ID[cat.id]!;

        return (
          <div key={cat.id} className="mb-2">
            <button
              onClick={() => toggleCat(cat.id)}
              style={{ fontFamily: "var(--font-display)" }}
              className={cn(
                "flex w-full items-center gap-2 px-2 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-all",
                "font-bold",
                accent.text,
                "hover:brightness-125"
              )}
            >
              {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {t(cat.labelKey)}
              <span className={cn("ml-auto h-1.5 w-1.5 rounded-full", accent.dot)} />
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
                    <Link
                      key={t.slug}
                      href={`/tournament/${t.slug}`}
                      onClick={onNavigate}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all",
                          isActive
                            ? "bg-[var(--color-lime-500)]/10 text-[var(--color-lime-400)] font-semibold border-l-2 border-[var(--color-lime-500)]"
                            : "text-[var(--color-slate-300)] hover:bg-white/5 hover:text-[var(--color-slate-100)]"
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
  );
}
