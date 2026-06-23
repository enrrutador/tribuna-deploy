import { GlassCard } from "@/components/ui/GlassCard";
import { StatBar } from "@/components/ui/StatBar";
import type { MatchStats, StatKey } from "@/lib/types";

interface StatsChartProps {
  stats: MatchStats | null;
}

const STAT_CONFIG: { key: StatKey; label: string; isPercent?: boolean }[] = [
  { key: "possession", label: "Posesión", isPercent: true },
  { key: "totalShots", label: "Tiros" },
  { key: "shotsOnTarget", label: "Al arco" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Faltas" },
  { key: "yellowCards", label: "Amarillas" },
  { key: "redCards", label: "Rojas" },
  { key: "offsides", label: "Offsides" },
  { key: "saves", label: "Atajadas" },
  { key: "passes", label: "Pases" },
];

export default function StatsChart({ stats }: StatsChartProps) {
  if (!stats) {
    return (
      <GlassCard variant="soft" className="p-8 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">Estadísticas no disponibles.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="soft" className="p-5 space-y-3">
      {STAT_CONFIG.map((cfg) => {
        const home = stats.home[cfg.key] ?? 0;
        const away = stats.away[cfg.key] ?? 0;
        if (home === 0 && away === 0) return null;
        return (
          <StatBar
            key={cfg.key}
            label={cfg.label}
            home={home}
            away={away}
            isPercent={cfg.isPercent}
          />
        );
      })}
    </GlassCard>
  );
}
