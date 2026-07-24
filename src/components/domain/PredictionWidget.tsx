import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Match } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface PredictionWidgetProps {
  match: Match;
}

type Prediction = "home" | "draw" | "away" | null;

export default function PredictionWidget({ match }: PredictionWidgetProps) {
const { t } = useTranslation();
  const [prediction, setPrediction] = useState<Prediction>(null);
  const [voted, setVoted] = useState(false);

  // Simulated vote distribution
  const distributions = { home: 42, draw: 26, away: 32 };

  const handleVote = (choice: Prediction) => {
    if (voted) return;
    setPrediction(choice);
    setVoted(true);
  };

  return (
    <GlassCard variant="soft" className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-[var(--color-magenta-400)]" />
        <h4 className="text-sm font-bold text-[var(--color-slate-100)]">{t("Predicción")}</h4>
        {match.status === "live" && (
          <Badge tone="live" className="ml-auto text-[9px]">{t("En curso")}</Badge>
        )}
      </div>

      <div className="flex items-stretch gap-1 rounded-xl bg-white/[0.03] p-1">
        {/* Home win */}
        <button
          onClick={() => handleVote("home")}
          disabled={voted && match.status === "finished"}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-semibold transition-all",
            prediction === "home"
              ? "bg-[var(--color-lime-500)]/15 text-[var(--color-lime-400)] border border-[var(--color-lime-500)]/30"
              : "text-[var(--color-slate-400)] hover:bg-white/5 hover:text-[var(--color-slate-200)]"
          )}
        >
          <ThumbsUp size={14} />
          <span className="text-[10px] truncate max-w-full">{match.homeTeam.shortName}</span>
          {voted && <span className="font-bold tabular-nums">{distributions.home}%</span>}
        </button>

        {/* Draw */}
        <button
          onClick={() => handleVote("draw")}
          disabled={voted && match.status === "finished"}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-semibold transition-all",
            prediction === "draw"
              ? "bg-[var(--color-cyan-500)]/15 text-[var(--color-cyan-400)] border border-[var(--color-cyan-500)]/30"
              : "text-[var(--color-slate-400)] hover:bg-white/5 hover:text-[var(--color-slate-200)]"
          )}
        >
          <Minus size={14} />
          <span className="text-[10px]">{t("Empate")}</span>
          {voted && <span className="font-bold tabular-nums">{distributions.draw}%</span>}
        </button>

        {/* Away win */}
        <button
          onClick={() => handleVote("away")}
          disabled={voted && match.status === "finished"}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-semibold transition-all",
            prediction === "away"
              ? "bg-[var(--color-magenta-500)]/15 text-[var(--color-magenta-400)] border border-[var(--color-magenta-500)]/30"
              : "text-[var(--color-slate-400)] hover:bg-white/5 hover:text-[var(--color-slate-200)]"
          )}
        >
          <ThumbsDown size={14} />
          <span className="text-[10px] truncate max-w-full">{match.awayTeam.shortName}</span>
          {voted && <span className="font-bold tabular-nums">{distributions.away}%</span>}
        </button>
      </div>

      {/* Vote distribution bars */}
      <AnimatePresence>
        {voted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${distributions.home}%` }}
                className="bg-[var(--color-lime-500)]"
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${distributions.draw}%` }}
                className="bg-[var(--color-cyan-500)]"
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${distributions.away}%` }}
                className="bg-[var(--color-magenta-500)]"
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-center text-[var(--color-slate-500)]">
              ✨ Tu predicción fue registrada
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
