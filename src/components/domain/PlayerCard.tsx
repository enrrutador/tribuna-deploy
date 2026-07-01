import { motion } from "framer-motion";
import { Trophy, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface PlayerCardProps {
  name: string;
  jerseyNumber?: string | null;
  position?: string | null;
  team?: string;
  teamLogo?: string;
  stats?: {
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    matchesPlayed?: number;
    minutesPlayed?: number;
  };
  size?: "sm" | "md";
}

export default function PlayerCard({ name, jerseyNumber, position, team, teamLogo, stats, size = "md" }: PlayerCardProps) {
const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition-all hover:border-[var(--color-lime-400)]/20",
        size === "sm" && "p-2"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with jersey number */}
        <div className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-lime-400)]/10 to-[var(--color-cyan-400)]/10 flex-shrink-0",
          size === "sm" ? "w-10 h-10" : "w-12 h-12"
        )}>
          {teamLogo ? (
            <img src={teamLogo} alt="" className="w-6 h-6 object-contain" width="24" height="24" />
          ) : (
            <span className="text-lg font-black text-[var(--color-lime-400)]/60">{jerseyNumber ?? "?"}</span>
          )}
          {jerseyNumber && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-lime-400)] text-[8px] font-black text-black flex items-center justify-center">
              {jerseyNumber}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-bold text-[var(--color-slate-100)] truncate", size === "sm" ? "text-[11px]" : "text-xs")}>{name}</p>
          <div className="flex items-center gap-1.5">
            {position && <span className="text-[9px] text-[var(--color-cyan-400)]">{position}</span>}
            {team && <span className="text-[9px] text-[var(--color-slate-500)]">· {team}</span>}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {stats.goals != null && stats.goals > 0 && (
              <div className="flex items-center gap-0.5">
                <Target size={10} className="text-[var(--color-lime-400)]" />
                <span className="text-[10px] font-bold text-[var(--color-lime-400)]">{stats.goals}</span>
              </div>
            )}
            {stats.assists != null && stats.assists > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold text-[var(--color-cyan-400)]">{stats.assists}A</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed stats row */}
      {stats && stats.matchesPlayed != null && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.03] text-[9px] text-[var(--color-slate-500)]">
          <span>{stats.matchesPlayed} partidos</span>
          {stats.minutesPlayed != null && <span>{stats.minutesPlayed}'</span>}
          {stats.yellowCards != null && stats.yellowCards > 0 && <span className="text-yellow-400">🟡 {stats.yellowCards}</span>}
          {stats.redCards != null && stats.redCards > 0 && <span className="text-red-400">🔴 {stats.redCards}</span>}
        </div>
      )}
    </motion.div>
  );
}
