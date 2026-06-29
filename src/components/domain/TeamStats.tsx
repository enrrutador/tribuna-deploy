import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TeamStatEntry } from "@/lib/types";

interface TeamStatsProps {
  stats: TeamStatEntry[];
}

interface StatCardProps {
  title: string;
  stats: TeamStatEntry[];
  getValue: (s: TeamStatEntry) => number | string;
  format?: "number" | "percent" | "decimal";
  accent?: "lime" | "cyan" | "magenta" | "default";
  maxShow?: number;
}

function StatCard({ title, stats, getValue, format = "number", accent = "lime", maxShow = 6 }: StatCardProps) {
  const sorted = [...stats].sort((a, b) => {
    const va = Number(getValue(a));
    const vb = Number(getValue(b));
    return vb - va;
  }).slice(0, maxShow);

  const formatValue = (v: number | string) => {
    if (format === "percent") return `${v}%`;
    if (format === "decimal") return String(v);
    return String(v);
  };

  const accentColors = {
    lime: "text-[var(--color-lime-400)]",
    cyan: "text-[var(--color-cyan-400)]",
    magenta: "text-[var(--color-magenta-400)]",
    default: "text-[var(--color-slate-200)]",
  };

  return (
    <GlassCard variant="soft" className="overflow-hidden p-0">
      <div className="px-4 py-3 border-b border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate-400)]">{title}</h4>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {sorted.map((entry, i) => (
          <div
            key={entry.teamId}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
          >
            <span className="w-5 text-center text-xs font-bold text-[var(--color-slate-500)]">{i + 1}</span>
            {entry.teamLogoUrl && (
              <img src={entry.teamLogoUrl} alt="" className="h-5 w-5 object-contain" loading="lazy" />
            )}
            <span className="flex-1 truncate text-xs font-semibold text-[var(--color-slate-200)]">
              {entry.teamShortName || entry.teamName}
            </span>
            <span className={cn("text-xs font-bold tabular-nums", accentColors[accent])}>
              {formatValue(getValue(entry))}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function TeamStats({ stats }: TeamStatsProps) {
  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <StatCard title="Goles a favor" stats={stats} getValue={(s) => s.goalsFor} accent="lime" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <StatCard title="Goles por partido" stats={stats} getValue={(s) => s.goalsPerGame} format="decimal" accent="lime" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <StatCard title="Goles recibidos" stats={stats} getValue={(s) => s.goalsAgainst} accent="magenta" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <StatCard title="% Victoria" stats={stats} getValue={(s) => s.winRate} format="percent" accent="cyan" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <StatCard title="Menos goles recibidos" stats={stats} getValue={(s) => s.goalsAgainst} accent="cyan" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <StatCard title="Diferencia de goles" stats={stats} getValue={(s) => s.goalDiff} accent="lime" />
      </motion.div>
    </div>
  );
}
