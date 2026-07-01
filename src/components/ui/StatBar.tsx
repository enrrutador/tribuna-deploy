import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface StatBarProps {
  label: string;
  home: number;
  away: number;
  /** When true, treats values as percentages that sum to 100 (e.g. possession). */
  isPercent?: boolean;
  higherIsBetter?: boolean;
  format?: (n: number) => string;
}

export function StatBar({
  label,
  home,
  away,
  isPercent = false,
  format = (n) => String(n),
}: StatBarProps) {
  const total = home + away;
  const homePct = total === 0 ? 50 : (home / total) * 100;
  const awayPct = total === 0 ? 50 : (away / total) * 100;
  const homeWins = home > away;
  const awayWins = away > home;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span
          className={cn(
            "w-10 text-right font-bold tabular-nums",
            homeWins ? "text-[var(--color-lime-400)]" : "text-[var(--color-slate-300)]"
          )}
        >
          {isPercent ? `${home}%` : format(home)}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-slate-500)]">
          {label}
        </span>
        <span
          className={cn(
            "w-10 text-left font-bold tabular-nums",
            awayWins ? "text-[var(--color-lime-400)]" : "text-[var(--color-slate-300)]"
          )}
        >
          {isPercent ? `${away}%` : format(away)}
        </span>
      </div>
      <div className="flex h-1.5 items-center gap-1">
        <motion.div
          className="h-full rounded-l-full bg-gradient-to-r from-[var(--color-cyan-500)] to-[var(--color-lime-500)]"
          initial={{ width: 0 }}
          animate={{ width: `${homePct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="h-3 w-px shrink-0 bg-white/10" />
        <motion.div
          className="h-full rounded-r-full bg-gradient-to-l from-[var(--color-magenta-500)] to-[var(--color-magenta-400)]"
          initial={{ width: 0 }}
          animate={{ width: `${awayPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
