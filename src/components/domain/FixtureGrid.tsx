import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useTournamentFixtures } from "@/lib/hooks";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface FixtureGridProps {
  slug: string;
}

interface RoundGroup {
  name: string;
  matches: Match[];
}

interface DateGroup {
  label: string;
  date: string;
  matches: Match[];
}

function parseRoundNumber(name: string): number {
  const m = name.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 9999;
}

function formatDateHeader(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const label = format(d, "EEEE d 'de' MMMM", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function FixtureGrid({ slug }: FixtureGridProps) {
const { t } = useTranslation();
  const { data: response, isLoading } = useTournamentFixtures(slug);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { rounds, currentRound, matchesByDate } = useMemo(() => {
    if (!response?.groups) return { rounds: [], currentRound: null, matchesByDate: [] };

    const fixtures = response.groups.flatMap((g) => g.matches);

    const byRound = new Map<string, Match[]>();
    for (const m of fixtures) {
      const key = m.round || "Sin fecha";
      if (!byRound.has(key)) byRound.set(key, []);
      byRound.get(key)!.push(m);
    }

    const sortedRounds: RoundGroup[] = [...byRound.entries()]
      .sort((a, b) => parseRoundNumber(a[0]) - parseRoundNumber(b[0]))
      .map(([name, matches]) => ({
        name,
        matches: matches.sort(
          (a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()
        ),
      }));

    const current = sortedRounds[selectedIndex] ?? sortedRounds[sortedRounds.length - 1] ?? null;

    const byDate = new Map<string, Match[]>();
    if (current) {
      for (const m of current.matches) {
        const key = m.kickoffTime ? m.kickoffTime.slice(0, 10) : "sin-fecha";
        if (!byDate.has(key)) byDate.set(key, []);
        byDate.get(key)!.push(m);
      }
    }

    const dateGroups: DateGroup[] = [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateKey, matches]) => ({
        label: dateKey === "sin-fecha" ? "Por definir" : formatDateHeader(dateKey),
        date: dateKey,
        matches,
      }));

    return { rounds: sortedRounds, currentRound: current, matchesByDate: dateGroups };
  }, [response, selectedIndex]);

  useEffect(() => {
    if (rounds.length > 0 && selectedIndex >= rounds.length) {
      setSelectedIndex(rounds.length - 1);
    }
  }, [rounds.length, selectedIndex]);

  if (isLoading) {
    return (
      <GlassCard variant="soft" className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-slate-400)]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Calendar size={16} />
          </motion.div>
          <span>Cargando fixture...</span>
        </div>
      </GlassCard>
    );
  }

  if (!rounds.length) {
    return (
      <GlassCard variant="soft" className="p-6 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">{t("No hay fechas disponibles")}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Fecha dropdown */}
      <div className="relative">
        <select
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="glass w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-[var(--color-slate-100)] outline-none transition-colors hover:border-[var(--color-lime-400)]/30 focus:border-[var(--color-lime-400)]/50 cursor-pointer"
        >
          {rounds.map((r, i) => (
            <option key={r.name} value={i} className="bg-[#1a1d23] text-[var(--color-slate-100)]">
              {r.name} — {r.matches.length} partido{r.matches.length !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown size={16} className="text-[var(--color-slate-400)]" />
        </div>
      </div>

      {/* Arrows + round info */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setSelectedIndex((i) => Math.min(i + 1, rounds.length - 1))}
          disabled={selectedIndex >= rounds.length - 1}
          className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={18} className="text-[var(--color-slate-400)]" />
        </button>

        <div className="text-center min-w-0">
          <motion.div
            key={currentRound?.name}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-bold text-[var(--color-slate-100)]">
              {currentRound?.name}
            </p>
            <p className="text-[11px] text-[var(--color-slate-500)]">
              {currentRound?.matches.length} partido{currentRound?.matches.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        </div>

        <button
          onClick={() => setSelectedIndex((i) => Math.max(i - 1, 0))}
          disabled={selectedIndex <= 0}
          className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 transition-colors"
        >
          <ChevronRight size={18} className="text-[var(--color-slate-400)]" />
        </button>
      </div>

      {/* Matches grouped by date */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRound?.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {matchesByDate.map((dateGroup) => (
            <div key={dateGroup.date}>
              <div className="flex items-center gap-2 px-1 mb-2">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate-500)] whitespace-nowrap">
                  {dateGroup.label}
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="space-y-1">
                {dateGroup.matches.map((match) => (
                  <FixtureRow key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {rounds.length > 1 && (
        <div className="flex items-center justify-center gap-1 pt-1">
          {rounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "rounded-full transition-all duration-200",
                i === selectedIndex
                  ? "bg-[var(--color-lime-400)] w-4 h-1.5"
                  : "bg-white/10 hover:bg-white/20 w-1.5 h-1.5"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FixtureRow({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "upcoming";

  const kickoffDate = match.kickoffTime ? new Date(match.kickoffTime) : null;
  const dayStr = kickoffDate ? format(kickoffDate, "EEE d/M", { locale: es }) : "";
  const timeStr = kickoffDate ? format(kickoffTime(kickoffDate), "HH:mm") : "?";

  return (
    <Link href={`/match/${match.leagueId}:${match.id}`}>
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
          "hover:bg-white/[0.04] border border-transparent hover:border-white/5",
          isLive && "bg-[var(--color-live)]/[0.06] border-[var(--color-live)]/20 hover:bg-[var(--color-live)]/10"
        )}
      >
        {/* Date + Time column */}
        <div className="w-[52px] sm:w-16 shrink-0 text-center">
          {isLive ? (
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
              <Badge tone="live" pulse className="text-[9px]">
                {match.minute ?? "VIVO"}
              </Badge>
            </motion.div>
          ) : isFinished ? (
            <div>
              <span className="text-[10px] font-bold text-[var(--color-slate-500)] uppercase">FT</span>
              {dayStr && (
                <p className="text-[9px] text-[var(--color-slate-600)] leading-tight mt-0.5">{dayStr}</p>
              )}
            </div>
          ) : (
            <div>
              <span className="text-sm font-bold tabular-nums text-[var(--color-cyan-400)]">
                {timeStr}
              </span>
              {dayStr && (
                <p className="text-[9px] text-[var(--color-slate-600)] leading-tight mt-0.5">{dayStr}</p>
              )}
            </div>
          )}
        </div>

        {/* Home team */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span
            className={cn(
              "text-xs sm:text-sm font-semibold truncate text-right",
              isFinished && match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore
                ? "text-[var(--color-slate-100)]"
                : "text-[var(--color-slate-300)]"
            )}
          >
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
          <TeamBadge team={match.homeTeam} size="xs" />
        </div>

        {/* Score */}
        <div className="w-16 sm:w-20 shrink-0 text-center">
          {isScheduled ? (
            <span className="text-[11px] font-medium text-[var(--color-slate-600)]">vs</span>
          ) : (
            <div className="flex items-center justify-center gap-1 rounded-lg bg-white/[0.04] px-2 py-1">
              <span className="text-sm sm:text-base font-black tabular-nums text-[var(--color-slate-100)] w-5 text-center">
                {match.homeScore ?? 0}
              </span>
              <span className="text-[var(--color-slate-600)] text-xs">–</span>
              <span className="text-sm sm:text-base font-black tabular-nums text-[var(--color-slate-100)] w-5 text-center">
                {match.awayScore ?? 0}
              </span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <TeamBadge team={match.awayTeam} size="xs" />
          <span
            className={cn(
              "text-xs sm:text-sm font-semibold truncate",
              isFinished && match.awayScore != null && match.homeScore != null && match.awayScore > match.homeScore
                ? "text-[var(--color-slate-100)]"
                : "text-[var(--color-slate-300)]"
            )}
          >
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>

        {/* Broadcast */}
        {match.broadcastChannel && (
          <div className="hidden sm:block shrink-0">
            <span className="text-[9px] text-[var(--color-slate-600)] bg-white/[0.03] rounded px-1.5 py-0.5">
              {match.broadcastChannel}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function kickoffTime(d: Date): Date {
  return d;
}
