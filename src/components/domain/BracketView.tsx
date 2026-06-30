import { motion } from "framer-motion";
import { Link } from "wouter";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { BracketData, BracketMatch, BracketStage } from "@/lib/types";

interface BracketViewProps {
  data: BracketData;
}

function MatchCard({ match }: { match: BracketMatch }) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const card = (
    <div className="w-[160px] flex-shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden text-[10px] hover:border-[var(--color-lime-400)]/20 transition-colors cursor-pointer">
      {/* Status */}
      <div
        className={cn(
          "px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-center",
          isFinished && "bg-[var(--color-success)]/10 text-[var(--color-success)]",
          isLive && "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
          !isFinished && !isLive && "bg-white/5 text-[var(--color-slate-500)]"
        )}
      >
        {isFinished ? "Final" : isLive ? match.statusText || "VIVO" : match.statusText || "Pendiente"}
      </div>

      {/* Home */}
      <div className={cn("flex items-center gap-1.5 px-2 py-1.5", match.winner === 1 && "bg-[var(--color-success)]/5", match.winner === 2 && "opacity-40")}>
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black flex-shrink-0"
          style={{ backgroundColor: `#${match.homeTeam.color}`, color: `#${match.homeTeam.textColor}` }}
        >
          {match.homeTeam.shortName.slice(0, 2)}
        </div>
        <span className="flex-1 font-semibold text-[var(--color-slate-200)] truncate text-[10px]">{match.homeTeam.shortName}</span>
        {match.homeScore !== null && <span className="font-black tabular-nums text-[var(--color-slate-100)] text-[11px]">{match.homeScore}</span>}
        {match.winner === 1 && <span className="text-[var(--color-success)] text-[8px]">&#9654;</span>}
      </div>

      {/* Away */}
      <div className={cn("flex items-center gap-1.5 border-t border-white/[0.03] px-2 py-1.5", match.winner === 2 && "bg-[var(--color-success)]/5", match.winner === 1 && "opacity-40")}>
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black flex-shrink-0"
          style={{ backgroundColor: `#${match.awayTeam.color}`, color: `#${match.awayTeam.textColor}` }}
        >
          {match.awayTeam.shortName.slice(0, 2)}
        </div>
        <span className="flex-1 font-semibold text-[var(--color-slate-200)] truncate text-[10px]">{match.awayTeam.shortName}</span>
        {match.awayScore !== null && <span className="font-black tabular-nums text-[var(--color-slate-100)] text-[11px]">{match.awayScore}</span>}
        {match.winner === 2 && <span className="text-[var(--color-success)] text-[8px]">&#9654;</span>}
      </div>

      {/* Time */}
      {match.startTime && !isFinished && (
        <div className="border-t border-white/[0.03] px-2 py-0.5 text-center text-[8px] text-[var(--color-slate-500)]">
          {match.startTime}
        </div>
      )}
    </div>
  );

  return <Link href={`/match/${match.id}`}>{card}</Link>;
}

export default function BracketView({ data }: BracketViewProps) {
  if (!data.stages || data.stages.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
        No hay llaves disponibles para este torneo.
      </div>
    );
  }

  const stageCount = data.stages.length;

  return (
    <div className="space-y-4">
      {/* Desktop: horizontal bracket */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div className="flex items-stretch gap-4 min-w-max">
          {data.stages.map((stage, i) => {
            const matchCount = stage.matches.length;
            const prevMatches = i > 0 ? data.stages[i - 1].matches.length : 1;
            const gapMultiplier = prevMatches;

            return (
              <div
                key={stage.name}
                className="flex flex-col"
                style={{
                  marginTop: i === 0 ? 0 : `${(gapMultiplier - matchCount) * 42 / 2}px`,
                }}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-cyan-400)] text-center mb-1.5 px-1">
                  {stage.name}
                </div>
                <div className="flex flex-col gap-2.5 justify-center flex-1">
                  {stage.matches.map((match, j) => (
                    <motion.div
                      key={match.id || `${stage.name}-${j}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 + j * 0.03 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: stacked by stage */}
      <div className="lg:hidden space-y-4">
        {data.stages.map((stage, i) => (
          <div key={stage.name}>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
              {stage.name}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {stage.matches.map((match, j) => (
                <motion.div
                  key={match.id || `${stage.name}-${j}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + j * 0.03 }}
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
