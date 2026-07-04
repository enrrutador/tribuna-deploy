import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, CalendarDays, Radio } from "lucide-react";
import { Link } from "wouter";
import { useTournamentBrackets, useTournamentFixtures } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { format, parse } from "date-fns";
import { es, type Locale } from "date-fns/locale";
import type { BracketMatch, Match } from "@/lib/types";

const WORLD_CUP_SLUG = "mundial-2026";

function parseBracketTime(startTime: string | null): Date | null {
  if (!startTime) return null;
  try {
    const parsed = parse(startTime, "dd-MM-yyyy HH:mm", new Date());
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  } catch {
    return null;
  }
}

function formatBracketTime(startTime: string | null): string {
  const d = parseBracketTime(startTime);
  return d ? format(d, "HH:mm") : "";
}

function formatBracketDay(startTime: string | null, locale: Locale): string {
  const d = parseBracketTime(startTime);
  return d ? format(d, "EEE d 'de' MMMM", { locale }) : "";
}

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findEspnMatchId(
  bracketMatch: BracketMatch,
  espnMatches: Match[]
): string | null {
  const homeNorm = normalizeTeamName(bracketMatch.homeTeam.name);
  const awayNorm = normalizeTeamName(bracketMatch.awayTeam.name);

  // Try to find by team names
  for (const m of espnMatches) {
    const mHome = normalizeTeamName(m.homeTeam.name ?? m.homeTeam.shortName ?? "");
    const mAway = normalizeTeamName(m.awayTeam.name ?? m.awayTeam.shortName ?? "");
    // Check direct match
    if (
      (mHome.includes(homeNorm) || homeNorm.includes(mHome)) &&
      (mAway.includes(awayNorm) || awayNorm.includes(mAway))
    ) {
      return m.id;
    }
    // Check swapped (ESPN might swap home/away)
    if (
      (mHome.includes(awayNorm) || awayNorm.includes(mHome)) &&
      (mAway.includes(homeNorm) || homeNorm.includes(mAway))
    ) {
      return m.id;
    }
  }
  return null;
}

export default function WorldCupBanner() {
  const { t } = useTranslation();
  const { data: brackets, isLoading: loadingBrackets } = useTournamentBrackets(WORLD_CUP_SLUG);
  const { data: fixtures } = useTournamentFixtures(WORLD_CUP_SLUG);

  const allEspnMatches = useMemo(
    () => fixtures?.groups?.flatMap((g) => g.matches) ?? [],
    [fixtures]
  );

  const octavosByDay = useMemo(() => {
    const stage = brackets?.stages?.find(
      (s) => s.name.toLowerCase().includes("octavos")
    );
    if (!stage || stage.matches.length === 0) return [];

    const byDay = new Map<string, BracketMatch[]>();
    for (const m of stage.matches) {
      const dayKey = parseBracketTime(m.startTime);
      if (!dayKey) continue;
      const key = format(dayKey, "yyyy-MM-dd");
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(m);
    }

    return [...byDay.entries()]
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([day, matches]) => ({
        day,
        dayLabel: formatBracketDay(matches[0].startTime, es),
        matches: matches.sort((a, b) => {
          const ta = parseBracketTime(a.startTime);
          const tb = parseBracketTime(b.startTime);
          if (ta && tb) return ta.getTime() - tb.getTime();
          return 0;
        }),
      }));
  }, [brackets]);

  const bracketToEspnId = useMemo(() => {
    const map = new Map<string, string>();
    const allMatches = brackets?.stages?.flatMap((s) => s.matches) ?? [];
    for (const bm of allMatches) {
      const espnId = findEspnMatchId(bm, allEspnMatches);
      if (espnId) map.set(bm.id, espnId);
    }
    return map;
  }, [brackets, allEspnMatches]);

  if (loadingBrackets || octavosByDay.length === 0) return null;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayBlock = octavosByDay.find((d) => d.day === todayStr);
  const upcomingBlock = octavosByDay.find((d) => new Date(d.day) >= new Date(todayStr));
  const activeBlock = todayBlock ?? upcomingBlock ?? octavosByDay[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-purple-500/20 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.10),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(168,85,247,0.08),transparent_50%)]" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-indigo-400/20" />
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500/0 via-violet-400/20 to-indigo-500/0 opacity-50 blur-sm animate-gradient" />

      <div className="relative p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400/20 to-violet-500/20 ring-1 ring-indigo-400/30"
            >
              <Trophy size={22} className="text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </motion.div>
            <div>
              <h2 className="text-lg font-black tracking-tight sm:text-xl text-white">
                Mundial 2026 · Octavos de Final
              </h2>
              <p className="text-[11px] text-indigo-200/60 font-medium">
                {t("La instancia más emocionante del fútbol mundial")}
              </p>
            </div>
          </div>
          <Link href={`/tournament/${WORLD_CUP_SLUG}`}>
            <button className="group flex items-center gap-1 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-200 ring-1 ring-indigo-400/20 transition-all hover:bg-indigo-500/20 hover:ring-indigo-400/40">
              {t("Ver torneo")}
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Day tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {octavosByDay.map((block) => {
            const isToday = block.day === todayStr;
            const isActive = block.day === activeBlock.day;
            return (
              <div
                key={block.day}
                className={`flex-shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40"
                    : "bg-white/[0.03] text-[var(--color-slate-500)] ring-1 ring-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={11} />
                  <span className="capitalize">{block.dayLabel}</span>
                  {isToday && (
                    <Badge tone="live" pulse className="text-[8px] px-1 py-0">
                      {t("Hoy")}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Matches for the active day */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBlock.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {activeBlock.matches.map((match, idx) => {
              const isLive = match.status === "live";
              const isFinished = match.status === "finished";
              const kickoff = formatBracketTime(match.startTime);
              const homeWon = isFinished && match.winner === 1;
              const awayWon = isFinished && match.winner === 2;
              const espnId = bracketToEspnId.get(match.id) ?? null;
              const matchPath = espnId
                ? `/match/${espnId}`
                : `/tournament/${WORLD_CUP_SLUG}`;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.35 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="group relative"
                >
                  <Link href={matchPath}>
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-400/20 to-violet-500/0 opacity-0 blur transition-opacity group-hover:opacity-100" />

                    <div className={`relative rounded-xl border bg-[var(--color-carbon)]/60 backdrop-blur-md p-3 transition-all ${
                      isLive
                        ? "border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        : "border-white/[0.06] group-hover:border-indigo-400/20"
                    }`}>
                      {/* Status + time */}
                      <div className="mb-2.5 flex items-center justify-between">
                        {isLive ? (
                          <Badge tone="live" pulse className="text-[8px]">
                            <Radio size={9} className="mr-1" /> {t("En vivo")}
                          </Badge>
                        ) : isFinished ? (
                          <Badge tone="default" className="text-[8px]">{t("Finalizado")}</Badge>
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-300/80">{kickoff} hs</span>
                        )}
                        <span className="text-[9px] text-[var(--color-slate-600)]">Octavos</span>
                      </div>

                      {/* Teams */}
                      <div className="space-y-2">
                        {/* Home team */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-1 ring-white/10"
                              style={{ backgroundColor: `#${match.homeTeam.color}`, color: `#${match.homeTeam.textColor}` }}
                            >
                              {match.homeTeam.symbolName?.slice(0, 2) ?? "?"}
                            </span>
                            <span className={`truncate text-sm font-semibold ${
                              homeWon ? "text-indigo-300" : "text-[var(--color-slate-200)]"
                            }`}>
                              {match.homeTeam.name}
                            </span>
                          </div>
                          <span className={`text-base font-black tabular-nums ${
                            isFinished ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-600)]"
                          }`}>
                            {match.homeScore ?? "-"}
                          </span>
                        </div>

                        {/* Away team */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-1 ring-white/10"
                              style={{ backgroundColor: `#${match.awayTeam.color}`, color: `#${match.awayTeam.textColor}` }}
                            >
                              {match.awayTeam.symbolName?.slice(0, 2) ?? "?"}
                            </span>
                            <span className={`truncate text-sm font-semibold ${
                              awayWon ? "text-indigo-300" : "text-[var(--color-slate-200)]"
                            }`}>
                              {match.awayTeam.name}
                            </span>
                          </div>
                          <span className={`text-base font-black tabular-nums ${
                            isFinished ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-600)]"
                          }`}>
                            {match.awayScore ?? "-"}
                          </span>
                        </div>
                      </div>

                      {/* Extra info */}
                      {isFinished && match.homeScore !== null && match.awayScore !== null && (
                        <div className="mt-2.5 flex items-center gap-2 text-[10px] text-indigo-300/60">
                          <span>{match.homeScore === match.awayScore ? "Empate" : homeWon ? "Ganador" : ""}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
