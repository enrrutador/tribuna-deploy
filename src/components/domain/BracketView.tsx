import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { BracketData, BracketMatch, BracketStage } from "@/lib/types";

interface BracketViewProps {
  data: BracketData;
}

function MatchCard({ match, isLast }: { match: BracketMatch; isLast?: boolean }) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  return (
    <GlassCard variant="soft" className="overflow-hidden p-0 min-w-[220px]">
      {/* Status bar */}
      <div
        className={cn(
          "px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
          isFinished && "bg-[var(--color-success)]/10 text-[var(--color-success)]",
          isLive && "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
          !isFinished && !isLive && "bg-white/5 text-[var(--color-slate-400)]"
        )}
      >
        {isFinished ? "Finalizado" : isLive ? `En vivo ${match.statusText}` : match.statusText || "Programado"}
      </div>

      {/* Home team */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 transition-colors",
          match.winner === 1 && "bg-[var(--color-success)]/5",
          match.winner === 2 && "opacity-50"
        )}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-black"
          style={{ backgroundColor: `#${match.homeTeam.color}`, color: `#${match.homeTeam.textColor}` }}
        >
          {match.homeTeam.symbolName.slice(0, 3)}
        </div>
        <span className="flex-1 text-sm font-semibold text-[var(--color-slate-100)]">
          {match.homeTeam.shortName}
        </span>
        {match.homeScore !== null && (
          <span className="text-lg font-black tabular-nums text-[var(--color-slate-100)]">
            {match.homeScore}
          </span>
        )}
        {match.winner === 1 && <span className="text-[var(--color-success)]">▸</span>}
      </div>

      {/* Away team */}
      <div
        className={cn(
          "flex items-center gap-2 border-t border-white/[0.03] px-3 py-2.5 transition-colors",
          match.winner === 2 && "bg-[var(--color-success)]/5",
          match.winner === 1 && "opacity-50"
        )}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-black"
          style={{ backgroundColor: `#${match.awayTeam.color}`, color: `#${match.awayTeam.textColor}` }}
        >
          {match.awayTeam.symbolName.slice(0, 3)}
        </div>
        <span className="flex-1 text-sm font-semibold text-[var(--color-slate-100)]">
          {match.awayTeam.shortName}
        </span>
        {match.awayScore !== null && (
          <span className="text-lg font-black tabular-nums text-[var(--color-slate-100)]">
            {match.awayScore}
          </span>
        )}
        {match.winner === 2 && <span className="text-[var(--color-success)]">▸</span>}
      </div>

      {/* Date/time */}
      {match.startTime && !isFinished && (
        <div className="border-t border-white/[0.03] px-3 py-1.5 text-center text-[10px] text-[var(--color-slate-500)]">
          {match.startTime}
        </div>
      )}
    </GlassCard>
  );
}

function StageColumn({ stage, index }: { stage: BracketStage; index: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
        {stage.name}
      </h4>
      <div className="flex flex-col gap-3">
        {stage.matches.map((match, i) => (
          <motion.div
            key={match.id || `${stage.name}-${i}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + i * 0.05 }}
          >
            <MatchCard match={match} isLast={index === 2} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BracketView({ data }: BracketViewProps) {
  if (!data.stages || data.stages.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
        No hay llaves disponibles para este torneo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop: horizontal bracket */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div className="flex items-start gap-8 min-w-max">
          {data.stages.map((stage, i) => (
            <div
              key={stage.name}
              className="flex flex-col gap-3"
              style={{
                marginTop: i > 0 ? `${Math.pow(2, i - 1) * 40}px` : 0,
              }}
            >
              <StageColumn stage={stage} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: stacked by stage */}
      <div className="lg:hidden space-y-6">
        {data.stages.map((stage, i) => (
          <div key={stage.name}>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
              {stage.name}
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stage.matches.map((match, j) => (
                <motion.div
                  key={match.id || `${stage.name}-${j}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + j * 0.03 }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
