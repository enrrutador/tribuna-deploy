import { motion } from "framer-motion";
import { Trophy, Medal, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { cn } from "@/lib/utils";
import type { ScorerEntry } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface ScorersListProps {
  scorers: ScorerEntry[];
  maxRows?: number;
}

export default function ScorersList({ scorers, maxRows }: ScorersListProps) {
const { t } = useTranslation();
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
      {rows.map((scorer, i) => {
        const isTop3 = scorer.rank <= 3;
        const rankColors = {
          1: "from-yellow-500/20 to-amber-600/10 border-yellow-500/30",
          2: "from-slate-300/10 to-slate-400/5 border-slate-400/20",
          3: "from-amber-700/10 to-amber-800/5 border-amber-700/20",
        };

        return (
          <motion.div
            key={scorer.playerName + i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <GlassCard
              variant={isTop3 ? "strong" : "soft"}
              hover
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                isTop3 && "bg-gradient-to-r border",
                isTop3 && rankColors[scorer.rank as keyof typeof rankColors]
              )}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {scorer.rank === 1 && <Trophy size={16} className="text-yellow-400" />}
                {scorer.rank === 2 && <Medal size={16} className="text-slate-300" />}
                {scorer.rank === 3 && <Medal size={16} className="text-amber-600" />}
                {scorer.rank > 3 && (
                  <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-[var(--color-slate-500)]">
                    {scorer.rank}
                  </span>
                )}
              </div>

              {/* Player avatar placeholder */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-lime-400)]/10 to-[var(--color-cyan-400)]/10 flex items-center justify-center flex-shrink-0 ring-1 ring-white/5">
                {scorer.teamLogoUrl ? (
                  <img src={scorer.teamLogoUrl} alt="" className="w-5 h-5 object-contain" width="20" height="20" />
                ) : (
                  <Target size={14} className="text-[var(--color-lime-400)]/40" />
                )}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <p className={cn("font-semibold text-[var(--color-slate-100)] truncate", isTop3 ? "text-sm" : "text-xs")}>
                  {scorer.playerName}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-[var(--color-slate-500)] truncate">{scorer.teamName}</p>
                  {scorer.played > 0 && (
                    <span className="text-[9px] text-[var(--color-slate-600)]">· {scorer.played}PJ</span>
                  )}
                </div>
              </div>

              {/* Goals + assists */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {scorer.assists > 0 && (
                  <span className="text-[11px] font-bold text-[var(--color-cyan-400)]">
                    {scorer.assists}A
                  </span>
                )}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg",
                  isTop3 ? "bg-[var(--color-lime-400)]/15" : "bg-white/[0.04]"
                )}>
                  <Target size={10} className={isTop3 ? "text-[var(--color-lime-400)]" : "text-[var(--color-slate-500)]"} />
                  <span className={cn(
                    "text-xs font-black tabular-nums",
                    isTop3 ? "text-[var(--color-lime-400)]" : "text-[var(--color-slate-300)]"
                  )}>
                    {scorer.goals}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
