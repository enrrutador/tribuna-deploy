import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Radio, Tv, Clock,
  ChevronRight,
} from "lucide-react";
import { useMatch } from "@/lib/hooks";
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
import PredictionWidget from "@/components/domain/PredictionWidget";

export default function MatchDetail({ id: matchId }: { id: string }) {
  const {
    data: match,
    isLoading,
    error,
    refetch,
  } = useMatch(matchId);

  if (isLoading) return <PageLoader label="Cargando partido" />;
  if (error || !match) {
    return <ErrorState title="Partido no encontrado" description="No pudimos encontrar este partido." onRetry={() => refetch()} />;
  }

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const minute = parseMinute(match.minute);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-slate-500)]">
        <Link href="/" className="hover:text-[var(--color-lime-400)] transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link href={`/tournament/${match.tournamentSlug}`} className="hover:text-[var(--color-lime-400)] transition-colors truncate max-w-[160px]">
          {match.tournamentName}
        </Link>
        <ChevronRight size={12} />
        <span className="text-[var(--color-slate-300)] truncate">
          {match.homeTeam.shortName} vs {match.awayTeam.shortName}
        </span>
      </nav>

      {/* Score Card — the hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard
          variant="strong"
          glow={isLive ? "magenta" : "none"}
          className={cn(
            "relative overflow-hidden p-6 sm:p-8",
            isLive && "border-[var(--color-live)]/25"
          )}
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-[var(--color-lime-500)]/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-[var(--color-magenta-500)]/5 blur-3xl" />
          </div>

          <div className="relative">
            {/* Tournament + status */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-base">{match.tournamentFlag}</span>
              <span className="text-xs font-semibold text-[var(--color-slate-400)]">
                {match.tournamentName}
              </span>
              {match.round && (
                <span className="text-[10px] text-[var(--color-slate-600)]">· {match.round}</span>
              )}
            </div>

            {/* Teams + Score */}
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              {/* Home team */}
              <div className="flex flex-col items-center gap-3 text-center">
                <TeamBadge team={match.homeTeam} size="xl" />
                <Link href={`/team/${match.homeTeam.id}`} className="hover:text-[var(--color-lime-400)] transition-colors">
                  <p className="text-sm font-bold text-[var(--color-slate-100)] max-w-[120px] truncate sm:max-w-none">
                    {match.homeTeam.shortName ?? match.homeTeam.name}
                  </p>
                </Link>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center gap-2">
                {isLive && (
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    <Badge tone="live" pulse>
                      {match.minute ?? "LIVE"}
                    </Badge>
                  </motion.div>
                )}
                {isFinished && (
                  <Badge tone="default" className="text-[var(--color-slate-400)]">
                    Final
                  </Badge>
                )}
                {!isLive && !isFinished && (
                  <div className="flex items-center gap-1.5 text-[var(--color-cyan-400)]">
                    <Clock size={12} />
                    <span className="text-xs font-bold">{formatKickoff(match.kickoffTime)}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.span
                    key={`detail-h-${match.homeScore}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl sm:text-6xl font-black tabular-nums text-[var(--color-slate-100)]"
                  >
                    {match.homeScore ?? 0}
                  </motion.span>
                  <span className="text-2xl font-light text-[var(--color-slate-600)]">–</span>
                  <motion.span
                    key={`detail-a-${match.awayScore}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl sm:text-6xl font-black tabular-nums text-[var(--color-slate-100)]"
                  >
                    {match.awayScore ?? 0}
                  </motion.span>
                </div>
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-3 text-center">
                <TeamBadge team={match.awayTeam} size="xl" />
                <Link href={`/team/${match.awayTeam.id}`} className="hover:text-[var(--color-lime-400)] transition-colors">
                  <p className="text-sm font-bold text-[var(--color-slate-100)] max-w-[120px] truncate sm:max-w-none">
                    {match.awayTeam.shortName ?? match.awayTeam.name}
                  </p>
                </Link>
              </div>
            </div>

            {/* Match info */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--color-slate-500)]">
              {match.venue && (
                <div className="flex items-center gap-1">
                  <MapPin size={11} />
                  {match.venue}
                </div>
              )}
              {match.broadcastChannel && (
                <div className="flex items-center gap-1">
                  <Tv size={11} />
                  {match.broadcastChannel}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Two-column content: stats + events + prediction */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Events */}
          <SectionTitle
            icon={<Radio size={18} />}
            title="Eventos del partido"
            accent="magenta"
          />
          <EventTimeline events={match.events} match={match} />

          {/* Stats */}
          <SectionTitle
            icon={<span className="text-sm">📊</span>}
            title="Estadísticas"
            accent="cyan"
          />
          <StatsChart stats={match.stats} />
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          <PredictionWidget match={match} />

          {/* Quick match info */}
          <GlassCard variant="soft" className="p-4 space-y-3">
            <h4 className="text-sm font-bold text-[var(--color-slate-100)]">Info del partido</h4>
            <div className="space-y-2 text-xs text-[var(--color-slate-400)]">
              {match.round && (
                <div className="flex justify-between">
                  <span>Ronda</span>
                  <span className="font-semibold text-[var(--color-slate-200)]">{match.round}</span>
                </div>
              )}
              {match.venue && (
                <div className="flex justify-between">
                  <span>Estadio</span>
                  <span className="font-semibold text-[var(--color-slate-200)] truncate max-w-[140px]">{match.venue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estado</span>
                <Badge tone={isLive ? "live" : isFinished ? "default" : "cyan"} className="text-[9px]">
                  {isLive ? "En vivo" : isFinished ? "Finalizado" : "Por jugar"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Horario</span>
                <span className="font-semibold text-[var(--color-cyan-400)]">{formatKickoff(match.kickoffTime)} hs</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
