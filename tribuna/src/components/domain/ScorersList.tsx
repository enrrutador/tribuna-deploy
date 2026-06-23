import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { ScorerEntry } from "@/lib/types";

interface ScorersListProps {
  scorers: ScorerEntry[];
  maxRows?: number;
}

export default function ScorersList({ scorers, maxRows }: ScorersListProps) {
  const rows = maxRows ? scorers.slice(0, maxRows) : scorers;

  if (rows.length === 0) {
    return (
      <GlassCard variant="soft" className="p-8 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">No hay datos de goleadores disponibles.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((scorer, i) => (
        <motion.div
          key={scorer.playerName + i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <GlassCard
            variant="soft"
            hover
            className="flex items-center gap-3 px-4 py-3"
          >
            {/* Rank */}
            <span className="w-7 text-center text-sm font-black tabular-nums text-[var(--color-slate-500)]">
              {scorer.rank}
            </span>

            {/* Player */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-slate-100)] truncate">
                {scorer.playerName}
              </p>
              <p className="text-[11px] text-[var(--color-slate-500)] truncate">
                {scorer.teamName}
              </p>
            </div>

            {/* Goals badge */}
            <div className="flex items-center gap-1.5">
              {scorer.assists > 0 && (
                <span className="text-[11px] text-[var(--color-cyan-400)]">
                  {scorer.assists}A
                </span>
              )}
              <Badge tone="lime" className="tabular-nums">
                {scorer.goals} {scorer.goals === 1 ? "gol" : "goles"}
              </Badge>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
