import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { StandingEntry, StandingsGroup } from "@/lib/types";

interface StandingsTableProps {
  groups: StandingsGroup[];
  maxRows?: number;
}

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: "bg-[var(--color-success)]/20 text-[var(--color-success)]",
    D: "bg-[var(--color-warn)]/20 text-[var(--color-warn)]",
    L: "bg-[var(--color-danger)]/20 text-[var(--color-danger)]",
  };
  const labels: Record<string, string> = { W: "G", D: "E", L: "P" };

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold",
        colors[result] ?? "bg-white/5 text-[var(--color-slate-400)]"
      )}
    >
      {labels[result] ?? result}
    </span>
  );
}

function GroupTable({ group, maxRows }: { group: StandingsGroup; maxRows?: number }) {
  const rows = maxRows ? group.entries.slice(0, maxRows) : group.entries;

  return (
    <div className={group.name ? "mb-6" : ""}>
      {group.name && (
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
          {group.name}
        </h4>
      )}
      <GlassCard variant="soft" className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate-500)]">
              <th className="w-8 py-2.5 text-center">#</th>
              <th className="py-2.5 text-left pl-3">Equipo</th>
              <th className="py-2.5 text-center hidden sm:table-cell">PJ</th>
              <th className="py-2.5 text-center hidden sm:table-cell">G</th>
              <th className="py-2.5 text-center hidden sm:table-cell">E</th>
              <th className="py-2.5 text-center hidden sm:table-cell">P</th>
              <th className="py-2.5 text-center hidden md:table-cell">GF</th>
              <th className="py-2.5 text-center hidden md:table-cell">GC</th>
              <th className="py-2.5 text-center hidden md:table-cell">DG</th>
              <th className="py-2.5 text-center font-bold text-[var(--color-lime-400)]">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {rows.map((entry, i) => {
              const isTop4 = entry.position <= 4;
              const isBottom3 = entry.position > rows.length - 3;
              return (
                <motion.tr
                  key={entry.teamId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="group transition-colors hover:bg-white/[0.02]"
                >
                  <td
                    className={cn(
                      "py-2.5 text-center text-xs font-bold tabular-nums",
                      isTop4 && "text-[var(--color-lime-400)]",
                      isBottom3 && "text-[var(--color-danger)]",
                      !isTop4 && !isBottom3 && "text-[var(--color-slate-500)]"
                    )}
                  >
                    {entry.position}
                  </td>
                  <td className="py-2.5 pl-3">
                    <div className="flex items-center gap-2">
                      {entry.teamLogoUrl && (
                        <img
                          src={entry.teamLogoUrl}
                          alt={entry.teamName}
                          className="h-5 w-5 object-contain"
                          loading="lazy"
                        />
                      )}
                      <span className="font-semibold text-[var(--color-slate-200)] group-hover:text-white truncate max-w-[140px]">
                        {entry.teamShortName ?? entry.teamName}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center text-[var(--color-slate-400)] tabular-nums hidden sm:table-cell">{entry.played}</td>
                  <td className="py-2.5 text-center text-[var(--color-success)] tabular-nums hidden sm:table-cell">{entry.won}</td>
                  <td className="py-2.5 text-center text-[var(--color-slate-400)] tabular-nums hidden sm:table-cell">{entry.drawn}</td>
                  <td className="py-2.5 text-center text-[var(--color-danger)] tabular-nums hidden sm:table-cell">{entry.lost}</td>
                  <td className="py-2.5 text-center text-[var(--color-slate-400)] tabular-nums hidden md:table-cell">{entry.goalsFor}</td>
                  <td className="py-2.5 text-center text-[var(--color-slate-400)] tabular-nums hidden md:table-cell">{entry.goalsAgainst}</td>
                  <td className="py-2.5 text-center tabular-nums hidden md:table-cell">
                    <span className={cn(
                      entry.goalDiff.startsWith("+") ? "text-[var(--color-success)]" : entry.goalDiff.startsWith("-") ? "text-[var(--color-danger)]" : "text-[var(--color-slate-400)]"
                    )}>
                      {entry.goalDiff}
                    </span>
                  </td>
                  <td className="py-2.5 text-center text-sm font-black tabular-nums text-[var(--color-lime-400)]">
                    {entry.points}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

export default function StandingsTable({ groups, maxRows }: StandingsTableProps) {
  return (
    <div>
      {groups.map((g, i) => (
        <GroupTable key={g.name || i} group={g} maxRows={maxRows} />
      ))}
    </div>
  );
}
