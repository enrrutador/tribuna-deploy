import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTournamentFixtures } from "@/lib/hooks";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";

interface FixtureGridProps {
  slug: string;
  round?: string | null;
}

export default function FixtureGrid({ slug, round }: FixtureGridProps) {
  const { data: response, isLoading } = useTournamentFixtures(slug, round);
  const [weekOffset, setWeekOffset] = useState(0);

  const fixtures = useMemo(() => {
    if (!response?.groups) return [];
    return response.groups.flatMap((g) => g.matches);
  }, [response]);

  const weeks = useMemo(() => {
    if (!fixtures.length) return [];

    const grouped: { label: string; date: string; matches: Match[] }[] = [];
    const byDate = new Map<string, Match[]>();

    for (const m of fixtures) {
      const key = m.kickoffTime ? m.kickoffTime.slice(0, 10) : "sin-fecha";
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(m);
    }

    const sorted = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [dateKey, matches] of sorted) {
      if (dateKey === "sin-fecha") {
        grouped.push({ label: "Por definir", date: dateKey, matches });
        continue;
      }
      const d = new Date(dateKey + "T12:00:00");
      const label = format(d, "EEEE d 'de' MMMM", { locale: es });
      grouped.push({ label: label.charAt(0).toUpperCase() + label.slice(1), date: dateKey, matches });
    }

    return grouped;
  }, [fixtures]);

  const currentWeek = weeks.length > 0 ? weeks[weeks.length - 1 + weekOffset] : undefined;

  if (isLoading) {
    return (
      <GlassCard variant="soft" className="p-6 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">Cargando fixture...</p>
      </GlassCard>
    );
  }

  if (!weeks.length) {
    return (
      <GlassCard variant="soft" className="p-6 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">No hay fechas disponibles</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Week navigator */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setWeekOffset((o) => Math.min(o + 1, weeks.length - 1))}
          disabled={weekOffset >= weeks.length - 1}
          className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} className="text-[var(--color-slate-400)]" />
        </button>
        <div className="text-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-slate-200)]">
            <Calendar size={12} />
            <span>{currentWeek?.label}</span>
          </div>
        </div>
        <button
          onClick={() => setWeekOffset((o) => Math.max(o - 1, 0))}
          disabled={weekOffset <= 0}
          className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} className="text-[var(--color-slate-400)]" />
        </button>
      </div>

      {/* Matches grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWeek?.date}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {currentWeek?.matches.map((match) => (
            <FixtureRow key={match.id} match={match} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Week dots */}
      {weeks.length > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          {weeks.slice(Math.max(0, weeks.length - 20)).map((_, i) => {
            const idx = Math.max(0, weeks.length - 20) + i;
            return (
              <button
                key={idx}
                onClick={() => setWeekOffset(weeks.length - 1 - idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === weeks.length - 1 + weekOffset
                    ? "bg-[var(--color-lime-400)] w-4"
                    : "bg-white/10 hover:bg-white/20"
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function FixtureRow({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "upcoming";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
        isLive ? "bg-[var(--color-live)]/10 border border-[var(--color-live)]/20" : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03]"
      )}
    >
      {/* Time / Status */}
      <div className="w-14 text-center flex-shrink-0">
        {isLive && (
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <Badge tone="live" pulse className="text-[9px]">{match.minute ?? "VIVO"}</Badge>
          </motion.div>
        )}
        {isFinished && <span className="text-[10px] font-bold text-[var(--color-slate-500)]">FT</span>}
        {isScheduled && <span className="text-xs font-bold text-[var(--color-cyan-400)]">{match.kickoffTime ? format(new Date(match.kickoffTime), "HH:mm") : "?"}</span>}
      </div>

      {/* Home */}
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        <span className={cn("text-xs font-semibold truncate text-right", isFinished && match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-300)]")}>
          {match.homeTeam.shortName || match.homeTeam.name}
        </span>
        <TeamBadge team={match.homeTeam} size="xs" />
      </div>

      {/* Score */}
      <div className="w-14 text-center flex-shrink-0">
        {isScheduled ? (
          <span className="text-[10px] text-[var(--color-slate-600)]">vs</span>
        ) : (
          <span className="text-sm font-black tabular-nums text-[var(--color-slate-100)]">
            {match.homeScore ?? 0} – {match.awayScore ?? 0}
          </span>
        )}
      </div>

      {/* Away */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <TeamBadge team={match.awayTeam} size="xs" />
        <span className={cn("text-xs font-semibold truncate", isFinished && match.awayScore != null && match.homeScore != null && match.awayScore > match.homeScore ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-300)]")}>
          {match.awayTeam.shortName || match.awayTeam.name}
        </span>
      </div>
    </div>
  );
}
