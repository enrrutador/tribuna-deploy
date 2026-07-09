import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, CalendarDays, Radio } from "lucide-react";
import { Link } from "wouter";
import { useTournamentBrackets, useTournamentFixtures } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { es, type Locale } from "date-fns/locale";
import type { BracketMatch, Match } from "@/lib/types";

const WORLD_CUP_SLUG = "mundial-2026";

const ART_OFFSET_MS = -3 * 60 * 60 * 1000;

function toArtDate(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60_000 + ART_OFFSET_MS);
}

function artNow(): Date {
  return toArtDate(new Date());
}

function artTodayStr(): string {
  const d = artNow();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function artTomorrowStr(): string {
  const d = artNow();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseBracketTime(startTime: string | null): Date | null {
  if (!startTime) return null;
  try {
    const [datePart, timePart] = startTime.split(" ");
    if (!datePart || !timePart) return null;
    const [dd, mm, yyyy] = datePart.split("-");
    if (!dd || !mm || !yyyy) return null;
    const iso = `${yyyy}-${mm}-${dd}T${timePart}:00-03:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function formatBracketTime(startTime: string | null): string {
  if (!startTime) return "";
  const [, timePart] = startTime.split(" ");
  return timePart ?? "";
}

function formatBracketDay(startTime: string | null, locale: Locale): string {
  if (!startTime) return "";
  const [datePart] = startTime.split(" ");
  if (!datePart) return "";
  const [dd, mm, yyyy] = datePart.split("-");
  if (!dd || !mm || !yyyy) return "";
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0);
  return format(d, "EEE d 'de' MMMM", { locale });
}

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const TEAM_NAME_MAP: Record<string, string[]> = {
  alemania: ["germany", "alemania"],
  francia: ["france", "francia"],
  espana: ["spain", "espana"],
  portugal: ["portugal"],
  holanda: ["netherlands", "holanda", "paises bajos", "paisesbajos"],
  "paises bajos": ["netherlands", "holanda", "paises bajos", "paisesbajos"],
  brasil: ["brazil", "brasil"],
  argentina: ["argentina"],
  uruguay: ["uruguay"],
  colombia: ["colombia"],
  chile: ["chile"],
  ecuador: ["ecuador"],
  paraguay: ["paraguay"],
  peru: ["peru", "perú"],
  mexico: ["mexico", "méxico"],
  "estados unidos": ["united states", "estados unidos", "eeuu", "usa"],
  canada: ["canada", "canadá"],
  belgica: ["belgium", "bélgica"],
  italia: ["italy", "italia"],
  croacia: ["croatia", "croacia"],
  inglaterra: ["england", "inglaterra"],
  marruecos: ["morocco", "marruecos"],
  suiza: ["switzerland", "suiza"],
  japon: ["japan", "japón"],
  "corea del sur": ["south korea", "corea del sur"],
  "arabia saudita": ["saudi arabia", "arabia saudita"],
  iran: ["iran", "irán"],
  tunez: ["tunisia", "túnez"],
  senegal: ["senegal"],
  ghana: ["ghana"],
  polonia: ["poland", "polonia"],
  serbia: ["serbia"],
  nigeria: ["nigeria"],
  camerun: ["cameroon", "camerún"],
  "costa de marfil": ["ivory coast", "costa de marfil"],
  "costa marfil": ["ivory coast", "costa de marfil"],
  australia: ["australia"],
  dinamarca: ["denmark", "dinamarca"],
  suecia: ["sweden", "suecia"],
  noruega: ["norway", "noruega"],
  egipto: ["egypt", "egipto"],
  austria: ["austria"],
  "bosnia y herzegovina": ["bosnia-herzegovina", "bosnia herzegovina", "bosnia"],
  "republica democratica del congo": ["congo dr", "republica democratica del congo"],
  congo: ["congo dr", "congo"],
  hungria: ["hungary", "hungría"],
  escocia: ["scotland", "escocia"],
  gales: ["wales", "gales"],
};

function matchTeamNames(bracketName: string, espnName: string): boolean {
  const bn = normalizeTeamName(bracketName);
  const en = normalizeTeamName(espnName);
  if (bn === en) return true;
  const bnVars = TEAM_NAME_MAP[bn];
  if (bnVars && bnVars.some((v) => en === v)) return true;
  const enVars = TEAM_NAME_MAP[en];
  if (enVars && enVars.some((v) => bn === v)) return true;
  return false;
}

function findEspnMatchId(
  bracketMatch: BracketMatch,
  espnMatches: Match[]
): { id: string; leagueId: string } | null {
  const bracketHome = bracketMatch.homeTeam.name;
  const bracketAway = bracketMatch.awayTeam.name;
  let best: { id: string; leagueId: string } | null = null;

  for (const m of espnMatches) {
    const mHome = m.homeTeam.name ?? m.homeTeam.shortName ?? "";
    const mAway = m.awayTeam.name ?? m.awayTeam.shortName ?? "";

    const homeOk =
      matchTeamNames(bracketHome, mHome) ||
      matchTeamNames(bracketHome, mAway);
    const awayOk =
      matchTeamNames(bracketAway, mAway) ||
      matchTeamNames(bracketAway, mHome);

    if (homeOk && awayOk) {
      if (/^\d+$/.test(m.id)) return { id: m.id, leagueId: m.leagueId };
      if (!best) best = { id: m.id, leagueId: m.leagueId };
    }
  }
  return best;
}

const ROUND_ORDER = ["final", "semifinal", "cuartos", "octavos", "16avos"];

function roundPriority(name: string): number {
  const lower = name.toLowerCase();
  for (let i = 0; i < ROUND_ORDER.length; i++) {
    if (lower.includes(ROUND_ORDER[i])) return i;
  }
  return ROUND_ORDER.length;
}

function roundDisplayName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("final") && !lower.includes("semi") && !lower.includes("cuarto") && !lower.includes("octavo") && !lower.includes("16avo")) return "Final";
  if (lower.includes("semifinal") || lower.includes("semi-final")) return "Semifinal";
  if (lower.includes("cuartos")) return "Cuartos de Final";
  if (lower.includes("octavos")) return "Octavos de Final";
  if (lower.includes("16avos")) return "16avos de Final";
  return name;
}

function roundTitleKey(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("final") && !lower.includes("semi") && !lower.includes("cuarto") && !lower.includes("octavo") && !lower.includes("16avo")) return "La gran final del Mundial";
  if (lower.includes("semifinal") || lower.includes("semi-final")) return "Semifinales del Mundial";
  if (lower.includes("cuartos")) return "Cuartos de Final";
  if (lower.includes("octavos")) return "Octavos de Final";
  if (lower.includes("16avos")) return "16avos de Final";
  return name;
}

interface DayBlock {
  day: string;
  dayLabel: string;
  matches: BracketMatch[];
}

function buildDayBlocks(matches: BracketMatch[]): DayBlock[] {
  const byDay = new Map<string, BracketMatch[]>();
  for (const m of matches) {
    const dayKey = parseBracketTime(m.startTime);
    if (!dayKey) continue;
    const key = format(dayKey, "yyyy-MM-dd");
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([day, ms]) => ({
      day,
      dayLabel: formatBracketDay(ms[0].startTime, es),
      matches: ms.sort((a, b) => {
        const ta = parseBracketTime(a.startTime);
        const tb = parseBracketTime(b.startTime);
        if (ta && tb) return ta.getTime() - tb.getTime();
        return 0;
      }),
    }));
}

function pickActiveStage(
  stages: { name: string; matches: BracketMatch[] }[],
  todayStr: string
): { name: string; matches: BracketMatch[] } | null {
  if (stages.length === 0) return null;

  let best: { name: string; matches: BracketMatch[] } | null = null;
  let bestScore = -Infinity;

  for (const stage of stages) {
    if (stage.matches.length === 0) continue;
    const hasLive = stage.matches.some((m) => m.status === "live");
    const hasUpcoming = stage.matches.some((m) => m.status === "upcoming");
    const hasToday = stage.matches.some((m) => {
      const d = parseBracketTime(m.startTime);
      return d && format(d, "yyyy-MM-dd") === todayStr;
    });
    const allFinished = stage.matches.every((m) => m.status === "finished");
    const rp = roundPriority(stage.name);

    let score = 0;
    if (hasLive) score = 1000 + (ROUND_ORDER.length - rp);
    else if (hasToday) score = 800 + (ROUND_ORDER.length - rp);
    else if (hasUpcoming) {
      const nextDate = stage.matches
        .filter((m) => m.status === "upcoming")
        .map((m) => parseBracketTime(m.startTime)?.getTime() ?? Infinity)
        .sort((a, b) => a - b)[0];
      const daysAway = nextDate < Infinity ? (nextDate - new Date(todayStr).getTime()) / 86400000 : 30;
      score = 500 - daysAway + (ROUND_ORDER.length - rp);
    } else if (allFinished) {
      score = 100 + (ROUND_ORDER.length - rp);
    }

    if (score > bestScore) {
      bestScore = score;
      best = stage;
    }
  }

  return best;
}

export default function WorldCupBanner() {
  const { t } = useTranslation();
  const { data: brackets, isLoading: loadingBrackets } = useTournamentBrackets(WORLD_CUP_SLUG);
  const { data: fixtures } = useTournamentFixtures(WORLD_CUP_SLUG);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const allEspnMatches = useMemo(
    () => fixtures?.groups?.flatMap((g) => g.matches) ?? [],
    [fixtures]
  );

  const activeStage = useMemo(() => {
    if (!brackets?.stages) return null;
    const knockoutStages = brackets.stages.filter((s) => {
      const n = s.name.toLowerCase();
      return n.includes("octavos") || n.includes("cuartos") || n.includes("semifinal") || n.includes("semi-final") || n.includes("final") || n.includes("16avos");
    });
    return pickActiveStage(knockoutStages, artTodayStr());
  }, [brackets]);

  const dayBlocks = useMemo(() => {
    if (!activeStage) return [];
    return buildDayBlocks(activeStage.matches);
  }, [activeStage]);

  const bracketToMatchPath = useMemo(() => {
    const map = new Map<string, string>();
    const allMatches = brackets?.stages?.flatMap((s) => s.matches) ?? [];
    for (const bm of allMatches) {
      const found = findEspnMatchId(bm, allEspnMatches);
      if (found) {
        map.set(bm.id, `/match/${found.leagueId}:${found.id}`);
      } else if (bm.id) {
        map.set(bm.id, `/match/fifa.world:pm-${bm.id}`);
      }
    }
    return map;
  }, [brackets, allEspnMatches]);

  if (loadingBrackets || !activeStage || dayBlocks.length === 0) return null;

  const todayStr = artTodayStr();
  const tomorrowStr = artTomorrowStr();
  const todayBlock = dayBlocks.find((d) => d.day === todayStr);
  const upcomingBlock = dayBlocks.find((d) => new Date(d.day) >= new Date(todayStr));
  const autoDay = todayBlock?.day ?? upcomingBlock?.day ?? dayBlocks[0]?.day;
  const activeDay = selectedDay && dayBlocks.some((d) => d.day === selectedDay)
    ? selectedDay
    : autoDay;
  const activeBlock = dayBlocks.find((d) => d.day === activeDay) ?? dayBlocks[0];

  const stageLabel = roundDisplayName(activeStage.name);
  const stageTitle = roundTitleKey(activeStage.name);

  const liveCount = activeStage.matches.filter((m) => m.status === "live").length;

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
                Mundial 2026 · {stageLabel}
              </h2>
              <p className="text-[11px] text-indigo-200/60 font-medium">
                {liveCount > 0 ? (
                  <span className="flex items-center gap-1">
                    <Radio size={9} className="text-[var(--color-live)]" />
                    {liveCount} {liveCount === 1 ? "partido en vivo" : "partidos en vivo"}
                  </span>
                ) : (
                  t("La instancia más emocionante del fútbol mundial")
                )}
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
        {dayBlocks.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {dayBlocks.map((block) => {
              const isToday = block.day === todayStr;
              const isTomorrow = block.day === tomorrowStr;
              const isActive = block.day === activeBlock.day;
              return (
                <button
                  key={block.day}
                  onClick={() => setSelectedDay(selectedDay === block.day ? null : block.day)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/40"
                      : "bg-white/[0.03] text-[var(--color-slate-500)] ring-1 ring-white/5 hover:bg-white/[0.06]"
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
                    {isTomorrow && !isToday && (
                      <Badge tone="default" className="text-[8px] px-1 py-0 bg-indigo-500/20">
                        {t("Mañana")}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

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
              const matchPath = bracketToMatchPath.get(match.id) ?? `/tournament/${WORLD_CUP_SLUG}`;

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
                        <span className="text-[9px] text-[var(--color-slate-600)]">{stageLabel}</span>
                      </div>

                      {/* Teams */}
                      <div className="space-y-2">
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

                      {/* Winner highlight */}
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
