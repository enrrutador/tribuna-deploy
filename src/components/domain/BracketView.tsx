import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BracketData, BracketMatch, BracketTeam } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

/* --- MINI TEAM ROW --- */
function TeamMini({
  team,
  result,
  score,
  isChampion,
}: {
  team: BracketTeam;
  result: "winner" | "eliminated" | "pending";
  score: number | null;
  isChampion: boolean;
}) {
const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-[3px]",
        result === "eliminated" && "opacity-30 line-through decoration-slate-500 grayscale"
      )}
    >
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-black flex-shrink-0 border border-white/10"
        style={{ backgroundColor: `#${team.color}`, color: `#${team.textColor}` }}
      >
        {team.shortName.slice(0, 2).toUpperCase()}
      </div>
      <span
        className={cn(
          "flex-1 text-[10px] font-semibold truncate",
          result === "winner" ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-300)]"
        )}
      >
        {team.shortName}
      </span>
      {score !== null && result !== "pending" && (
        <span
          className={cn(
            "text-[10px] font-black tabular-nums",
            result === "winner" ? "text-[var(--color-lime-400)]" : "text-[var(--color-slate-600)]"
          )}
        >
          {score}
        </span>
      )}
      {isChampion && result === "winner" && (
        <Crown size={10} className="text-yellow-400 flex-shrink-0" />
      )}
    </div>
  );
}

/* --- MATCH CARD (compact) --- */
function MatchCardComp({
  match,
  stageIdx,
  matchIdx,
  isFinalStage,
  isActivePath,
}: {
  match: BracketMatch;
  stageIdx: number;
  matchIdx: number;
  isFinalStage: boolean;
  isActivePath: boolean;
}) {
  const isFinished = match.status === "finished";
  const homeResult = !isFinished
    ? "pending"
    : match.winner === 0
      ? "winner"
      : match.winner === 1
        ? "eliminated"
        : "pending";
  const awayResult = !isFinished
    ? "pending"
    : match.winner === 1
      ? "winner"
      : match.winner === 0
        ? "eliminated"
        : "pending";

  return (
    <Link href={`/match/${match.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stageIdx * 0.08 + matchIdx * 0.03 }}
        className={cn(
          "relative w-[128px] shrink-0 rounded-lg border overflow-hidden cursor-pointer transition-all duration-500",
          isActivePath
            ? "border-[var(--color-lime-400)]/40 bg-[var(--color-lime-400)]/[0.04] shadow-[0_0_15px_rgba(132,239,137,0.08)] z-10"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
        )}
      >
        <TeamMini
          team={match.homeTeam}
          result={homeResult as any}
          score={match.homeScore}
          isChampion={isFinalStage}
        />
        <div className="border-t border-white/[0.03]">
          <TeamMini
            team={match.awayTeam}
            result={awayResult as any}
            score={match.awayScore}
            isChampion={isFinalStage}
          />
        </div>
      </motion.div>
    </Link>
  );
}

/* --- SVG CONNECTORS --- */
function Connectors({ stages }: { stages: any[] }) {
  if (stages.length < 2) return null;
  const lines: { key: string; d: string; isActive: boolean }[] = [];
  const CARD_W = 128;
  const GAP = 24;
  const CARD_H = 44;
  const V_GAP = 16;
  const ROW = CARD_H + V_GAP;
  const totalHeight = Math.max(...stages.map((st: any) => st.matches.length)) * ROW;

  for (let s = 0; s < stages.length - 1; s++) {
    const currCount = stages[s].matches.length;
    const nextCount = stages[s + 1].matches.length;
    const currOffset = (totalHeight - currCount * ROW) / 2;
    const nextOffset = (totalHeight - nextCount * ROW) / 2;
    for (let i = 0; i < currCount; i++) {
      const nextMatchIdx = Math.floor(i / 2);
      if (nextMatchIdx >= nextCount) continue;
      const y1 = currOffset + i * ROW + CARD_H / 2;
      const y2 = nextOffset + nextMatchIdx * ROW + CARD_H / 2;
      const x1 = s * (CARD_W + GAP) + CARD_W;
      const x2 = (s + 1) * (CARD_W + GAP);
      const midX = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
      const isActive =
        stages[s].matches[i].winner !== -1 &&
        stages[s + 1].matches[nextMatchIdx]?.winner !== -1;
      lines.push({ key: `${s}-${i}`, d, isActive });
    }
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 0 }}
    >
      {lines.map((line) => (
        <motion.path
          key={line.key}
          d={line.d}
          fill="none"
          stroke={
            line.isActive
              ? "rgba(132,239,137,0.10)"
              : "rgba(255,255,255,0.03)"
          }
          strokeWidth={line.isActive ? 1.2 : 0.5}
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.5,
            delay: Number(line.key.split("-")[0]) * 0.2,
          }}
        />
      ))}
    </svg>
  );
}

/* --- CHAMPION PATH HOOK --- */
function useChampionPath(stages: any[]) {
  const [animating, setAnimating] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);

  const start = () => {
    if (animating) return;
    setAnimating(true);
    setActiveStage(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= stages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setAnimating(false);
          setActiveStage(-1);
        }, 3000);
      } else {
        setActiveStage(current);
      }
    }, 1200);
  };

  return { animating, activeStage, start };
}

/* --- MAIN BRACKET VIEW --- */
export default function BracketView({ data }: { data: BracketData }) {
  if (!data.stages || data.stages.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
        No hay llaves disponibles para este torneo.
      </div>
    );
  }

  const stages = data.stages;
  const { animating, activeStage, start } = useChampionPath(stages);
  const hasWinners = stages.some((s: any) =>
    s.matches.some((m: any) => m.winner !== -1)
  );

  const CARD_W = 128;
  const GAP = 24;
  const CARD_H = 44;
  const V_GAP = 16;
  const ROW = CARD_H + V_GAP;
  const totalHeight = Math.max(...stages.map((s: any) => s.matches.length)) * ROW;
  const totalWidth = stages.length * (CARD_W + GAP) - GAP;

  return (
    <div className="space-y-4">
      {/* Champion Path Button */}
      {hasWinners && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={start}
            disabled={animating}
            className={cn(
              "flex items-center gap-2 px-4cntr text-[11px] font-bold uppercase tracking-wider transition-all",
              "rounded-full border text-[var(--color-lime-400)]",
              animating
                ? "bg-[var(--color-lime-400)]/20 border-[var(--color-lime-400)]/40"
                : "bg-[var(--color-lime-400)]/10 border-[var(--color-lime-400)]/20 hover:bg-[var(--color-lime-400)]/20"
            )}
          >
            <Zap size={14} />
            {animating ? "Mostrando camino..." : "Ver camino del campeon"}
          </motion.button>
        </div>
      )}

      {/* Desktop: Horizontal Bracket */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div
          className="relative"
          style={{ minWidth: totalWidth, minHeight: totalHeight + 40 }}
        >
          <Connectors stages={stages} />
          <div className="flex gap-6 relative z-10" style={{ height: totalHeight + 40 }}>
            {stages.map((stage: any, sIdx: number) => {
              const matchCount = stage.matches.length;
              const stageHeight = matchCount * ROW;
              const offsetTop = (totalHeight - stageHeight) / 2 + 20;

              return (
                <div
                  key={stage.name}
                  className="flex flex-col justify-center flex-shrink-0"
                  style={{ width: CARD_W }}
                >
                  <div className="text-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {stage.matches.map((match: BracketMatch, mIdx: number) => (
                      <div
                        key={match.id}
                        style={{ height: CARD_H + V_GAP }}
                        className="flex items-center"
                      >
                        <MatchCardComp
                          match={match}
                          stageIdx={sIdx}
                          matchIdx={mIdx}
                          isFinalStage={sIdx === stages.length - 1}
                          isActivePath={animating && sIdx <= activeStage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Stacked by stage */}
      <div className="lg:hidden space-y-4">
        {stages.map((stage: any, sIdx: number) => (
          <div key={stage.name}>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
              {stage.name || `Etapa ${sIdx + 1}`}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {stage.matches.map((match: BracketMatch, j: number) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sIdx * 0.08 + j * 0.03 }}
                >
                  <MatchCardComp
                    match={match}
                    stageIdx={sIdx}
                    matchIdx={j}
                    isFinalStage={sIdx === stages.length - 1}
                    isActivePath={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
