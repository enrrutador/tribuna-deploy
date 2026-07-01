import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Radio, Tv, Clock,
  ChevronRight, Users, History, ArrowLeftRight,
} from "lucide-react";
import { useMatch, useMatchSummary } from "@/lib/hooks";
import { formatKickoff, parseMinute } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import EventTimeline from "@/components/domain/EventTimeline";
import StatsChart from "@/components/domain/StatsChart";
import TeamCompare from "@/components/domain/TeamCompare";
import { useTranslation } from "@/lib/i18n";

function Lineup({ teamName, formation, players }: { teamName: string; formation: string | null; players: { name: string; jerseyNumber: string | null; position: string | null; starter: boolean }[] }) {
const { t } = useTranslation();
  const starters = players.filter((p) => p.starter);
  const subs = players.filter((p) => !p.starter);

  return (
    <GlassCard variant="soft" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[var(--color-slate-100)]">{teamName}</h4>
        {formation && <span className="text-[10px] font-bold text-[var(--color-cyan-400)]">{formation}</span>}
      </div>
      <div className="space-y-1">
        {starters.map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-1 text-xs">
            <span className="w-6 text-center font-bold text-[var(--color-slate-500)]">{p.jerseyNumber ?? "-"}</span>
            <span className="flex-1 text-[var(--color-slate-200)]">{p.name}</span>
            <span className="text-[10px] text-[var(--color-slate-500)]">{p.position ?? ""}</span>
          </div>
        ))}
      </div>
      {subs.length > 0 && (
        <>
          <div className="mt-3 mb-2 border-t border-white/5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate-500)]">{t("Suplentes")}</span>
          </div>
          <div className="space-y-1">
            {subs.map((p, i) => (
              <div key={i} className="flex items-center gap-2 py-0.5 text-[11px]">
                <span className="w-6 text-center text-[var(--color-slate-600)]">{p.jerseyNumber ?? "-"}</span>
                <span className="text-[var(--color-slate-400)]">{p.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}

function HeadToHead({ games }: { games: { date: string; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; competition: string }[] }) {
  const { t } = useTranslation();
  if (games.length === 0) return null;
  return (
    <GlassCard variant="soft" className="p-4">
      <h4 className="text-sm font-bold text-[var(--color-slate-100)] mb-3">{t("Historial entre ambos")}</h4>
      <div className="space-y-2">
        {games.slice(0, 5).map((g, i) => (
          <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.03] last:border-0">
            <span className="w-20 text-[var(--color-slate-500)]">{g.date.slice(0, 10)}</span>
            <span className="flex-1 text-right text-[var(--color-slate-300)] truncate">{g.homeTeam}</span>
            <span className="w-12 text-center font-bold text-[var(--color-lime-400)]">{g.homeScore} - {g.awayScore}</span>
            <span className="flex-1 text-[var(--color-slate-300)] truncate">{g.awayTeam}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function BoxscoreBar({ label, home, away }: { label: string; home: string; away: string }) {
  const hVal = parseFloat(home) || 0;
  const aVal = parseFloat(away) || 0;
  const total = hVal + aVal;
  const hPct = total > 0 ? (hVal / total) * 100 : 50;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-[var(--color-lime-400)]">{home}</span>
        <span className="text-[var(--color-slate-400)] text-[10px] uppercase">{label}</span>
        <span className="font-bold text-[var(--color-cyan-400)]">{away}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-[var(--color-lime-400)]/40" style={{ width: `${hPct}%` }} />
      </div>
    </div>
  );
}

export default function MatchDetail({ id: matchId }: { id: string }) {
  const { t } = useTranslation();
  const { data: match, isLoading, error, refetch } = useMatch(matchId);
  const { data: summary } = useMatchSummary(matchId);

  if (isLoading) return <PageLoader label="Cargando partido" />;
  if (error || !match) {
    return <ErrorState title="Partido no encontrado" description="No pudimos encontrar este partido." onRetry={() => refetch()} />;
  }

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasLineups = summary?.rosters && summary.rosters.length > 0;
  const hasH2H = summary?.headToHead && summary.headToHead.length > 0;
  const hasBoxscore = summary?.boxscore;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-slate-500)]">
        <Link href="/" className="hover:text-[var(--color-lime-400)] transition-colors">{t("Inicio")}</Link>
        <ChevronRight size={12} />
        <Link href={`/tournament/${match.tournamentSlug}`} className="hover:text-[var(--color-lime-400)] transition-colors truncate max-w-[160px]">
          {match.tournamentName}
        </Link>
        <ChevronRight size={12} />
        <span className="text-[var(--color-slate-300)] truncate">
          {match.homeTeam.shortName} vs {match.awayTeam.shortName}
        </span>
      </nav>

      {/* Score Card */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <GlassCard variant="strong" glow={isLive ? "magenta" : "none"} className={cn("relative overflow-hidden p-6 sm:p-8", isLive && "border-[var(--color-live)]/25")}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-[var(--color-lime-500)]/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[var(--color-magenta-500)]/5 blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-base">{match.tournamentFlag}</span>
              <span className="text-xs font-semibold text-[var(--color-slate-400)]">{match.tournamentName}</span>
              {match.round && <span className="text-[10px] text-[var(--color-slate-600)]">· {match.round}</span>}
            </div>
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <TeamBadge team={match.homeTeam} size="xl" />
                <Link href={`/team/${match.homeTeam.id}`} className="hover:text-[var(--color-lime-400)] transition-colors">
                  <p className="text-sm font-bold text-[var(--color-slate-100)] max-w-[120px] truncate sm:max-w-none">{match.homeTeam.shortName ?? match.homeTeam.name}</p>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-2">
                {isLive && (
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                    <Badge tone="live" pulse>{match.minute ?? "LIVE"}</Badge>
                  </motion.div>
                )}
                {isFinished && <Badge tone="default" className="text-[var(--color-slate-400)]">{t("Final")}</Badge>}
                {!isLive && !isFinished && (
                  <div className="flex items-center gap-1.5 text-[var(--color-cyan-400)]">
                    <Clock size={12} />
                    <span className="text-xs font-bold">{formatKickoff(match.kickoffTime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.span key={`h-${match.homeScore}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl sm:text-6xl font-black tabular-nums text-[var(--color-slate-100)]">{match.homeScore ?? 0}</motion.span>
                  <span className="text-2xl font-light text-[var(--color-slate-600)]">–</span>
                  <motion.span key={`a-${match.awayScore}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl sm:text-6xl font-black tabular-nums text-[var(--color-slate-100)]">{match.awayScore ?? 0}</motion.span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <TeamBadge team={match.awayTeam} size="xl" />
                <Link href={`/team/${match.awayTeam.id}`} className="hover:text-[var(--color-lime-400)] transition-colors">
                  <p className="text-sm font-bold text-[var(--color-slate-100)] max-w-[120px] truncate sm:max-w-none">{match.awayTeam.shortName ?? match.awayTeam.name}</p>
                </Link>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--color-slate-500)]">
              {match.venue && <div className="flex items-center gap-1"><MapPin size={11} />{match.venue}</div>}
              {match.broadcastChannel && <div className="flex items-center gap-1"><Tv size={11} />{match.broadcastChannel}</div>}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Boxscore stats (possession, shots, etc.) */}
      {hasBoxscore && (
        <GlassCard variant="soft" className="p-4 space-y-3">
          <h4 className="text-sm font-bold text-[var(--color-slate-100)] mb-2">{t("Estadísticas del partido")}</h4>
          <BoxscoreBar label="Posesión" home={summary.boxscore!.home.possession} away={summary.boxscore!.away.possession} />
          <BoxscoreBar label="Tiros" home={summary.boxscore!.home.shots} away={summary.boxscore!.away.shots} />
          <BoxscoreBar label="Tiros al arco" home={summary.boxscore!.home.shotsOnTarget} away={summary.boxscore!.away.shotsOnTarget} />
          <BoxscoreBar label="Tiros libres" home={summary.boxscore!.home.fouls} away={summary.boxscore!.away.fouls} />
          <BoxscoreBar label="Córners" home={summary.boxscore!.home.corners} away={summary.boxscore!.away.corners} />
          <BoxscoreBar label="Fueras de juego" home={summary.boxscore!.home.offsides} away={summary.boxscore!.away.offsides} />
          <BoxscoreBar label="Tarjetas amarillas" home={summary.boxscore!.home.yellowCards} away={summary.boxscore!.away.yellowCards} />
          <BoxscoreBar label="Tarjetas rojas" home={summary.boxscore!.home.redCards} away={summary.boxscore!.away.redCards} />
        </GlassCard>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {/* Events */}
          <SectionTitle icon={<Radio size={18} />} title="Eventos del partido" accent="magenta" />
          <EventTimeline events={match.events} match={match} />

          {/* Lineups */}
          {hasLineups && (
            <>
              <SectionTitle icon={<Users size={18} />} title="Alineaciones" accent="cyan" />
              <div className="grid gap-3 sm:grid-cols-2">
                {summary.rosters.map((r) => (
                  <Lineup key={r.teamId} teamName={r.teamName} formation={r.formation} players={r.players} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-5">
          {/* Team Compare */}
          <SectionTitle icon={<ArrowLeftRight size={18} />} title="Comparación" accent="cyan" />
          <TeamCompare
            homeTeamId={match.homeTeam.id}
            homeTeamName={match.homeTeam.shortName || match.homeTeam.name}
            homeTeamLogo={match.homeTeam.logoUrl}
            awayTeamId={match.awayTeam.id}
            awayTeamName={match.awayTeam.shortName || match.awayTeam.name}
            awayTeamLogo={match.awayTeam.logoUrl}
            matchId={matchId}
          />

          {/* H2H */}
          {hasH2H && (
            <>
              <SectionTitle icon={<History size={18} />} title="Historial" accent="lime" />
              <HeadToHead games={summary.headToHead} />
            </>
          )}

          {/* Quick info */}
          <GlassCard variant="soft" className="p-4 space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-slate-100)]">{t("Info del partido")}</h4>
            <div className="space-y-2 text-xs text-[var(--color-slate-400)]">
              {match.round && <div className="flex justify-between"><span>{t("Ronda")}</span><span className="font-semibold text-[var(--color-slate-200)]">{match.round}</span></div>}
              {match.venue && <div className="flex justify-between"><span>{t("Estadio")}</span><span className="font-semibold text-[var(--color-slate-200)] truncate max-w-[140px]">{match.venue}</span></div>}
              <div className="flex justify-between"><span>{t("Estado")}</span><Badge tone={isLive ? "live" : isFinished ? "default" : "cyan"} className="text-[9px]">{isLive ? "En vivo" : isFinished ? "Finalizado" : "Por jugar"}</Badge></div>
              <div className="flex justify-between"><span>{t("Horario")}</span><span className="font-semibold text-[var(--color-cyan-400)]">{formatKickoff(match.kickoffTime)} hs</span></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
