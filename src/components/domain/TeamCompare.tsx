import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Shield } from "lucide-react";
import { useMatchSummary } from "@/lib/hooks";
import { GlassCard } from "@/components/ui/GlassCard";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { PageLoader } from "@/components/ui/PageLoader";

interface TeamCompareProps {
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo?: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo?: string;
  matchId: string;
}

function CompareBar({ label, home, away }: { label: string; home: string | number; away: string | number }) {
  const hVal = typeof home === "string" ? parseFloat(home) || 0 : home;
  const aVal = typeof away === "string" ? parseFloat(away) || 0 : away;
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
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${hPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-[var(--color-lime-400)]/40"
        />
      </div>
    </div>
  );
}

export default function TeamCompare({ homeTeamId, homeTeamName, homeTeamLogo, awayTeamId, awayTeamName, awayTeamLogo, matchId }: TeamCompareProps) {
  const { data: summary, isLoading } = useMatchSummary(matchId);

  if (isLoading) {
    return (
      <GlassCard variant="soft" className="p-4 text-center">
        <p className="text-xs text-[var(--color-slate-400)]">Cargando comparación...</p>
      </GlassCard>
    );
  }

  const boxscore = summary?.boxscore;
  const headToHead = summary?.headToHead || [];

  return (
    <GlassCard variant="soft" className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[var(--color-magenta-400)]" />
          <h4 className="text-sm font-bold text-[var(--color-slate-100)]">Comparación</h4>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2">
          <TeamBadge team={{ name: homeTeamName, shortName: homeTeamName.slice(0, 3), logoUrl: homeTeamLogo ?? "" }} size="md" />
          <span className="text-[11px] font-semibold text-[var(--color-slate-200)] text-center max-w-[80px]">{homeTeamName}</span>
        </div>
        <span className="text-lg font-black text-[var(--color-slate-600)]">VS</span>
        <div className="flex flex-col items-center gap-2">
          <TeamBadge team={{ name: awayTeamName, shortName: awayTeamName.slice(0, 3), logoUrl: awayTeamLogo ?? "" }} size="md" />
          <span className="text-[11px] font-semibold text-[var(--color-slate-200)] text-center max-w-[80px]">{awayTeamName}</span>
        </div>
      </div>

      {/* Stats comparison */}
      {boxscore && (
        <div className="space-y-2.5">
          <CompareBar label="Posesión" home={boxscore.home.possession} away={boxscore.away.possession} />
          <CompareBar label="Tiros" home={boxscore.home.shots} away={boxscore.away.shots} />
          <CompareBar label="Tiros al arco" home={boxscore.home.shotsOnTarget} away={boxscore.away.shotsOnTarget} />
          <CompareBar label="Córners" home={boxscore.home.corners} away={boxscore.away.corners} />
          <CompareBar label="Fueras de juego" home={boxscore.home.offsides} away={boxscore.away.offsides} />
          <CompareBar label="Faltas" home={boxscore.home.fouls} away={boxscore.away.fouls} />
          <CompareBar label="Tarjetas amarillas" home={boxscore.home.yellowCards} away={boxscore.away.yellowCards} />
        </div>
      )}

      {/* Head to Head */}
      {headToHead.length > 0 && (
        <div className="pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield size={12} className="text-[var(--color-lime-400)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate-500)]">Historial reciente</span>
          </div>
          <div className="space-y-1.5">
            {headToHead.slice(0, 3).map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] py-1">
                <span className="w-14 text-[var(--color-slate-500)]">{g.date.slice(5, 10)}</span>
                <span className="flex-1 text-right text-[var(--color-slate-400)] truncate">{g.homeTeam}</span>
                <span className="w-10 text-center font-bold text-[var(--color-lime-400)]">{g.homeScore}-{g.awayScore}</span>
                <span className="flex-1 text-[var(--color-slate-400)] truncate">{g.awayTeam}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!boxscore && headToHead.length === 0 && (
        <p className="text-xs text-[var(--color-slate-500)] text-center py-2">
          Datos de comparación disponibles durante o después del partido
        </p>
      )}
    </GlassCard>
  );
}
