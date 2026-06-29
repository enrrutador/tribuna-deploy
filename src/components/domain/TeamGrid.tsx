import { motion } from "framer-motion";
import { Link } from "wouter";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTeamColors } from "@/lib/teamColors";
import type { StandingEntry } from "@/lib/types";

interface TeamGridProps {
  entries: StandingEntry[];
}

export default function TeamGrid({ entries }: TeamGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {entries.map((entry, i) => {
        const colors = getTeamColors(entry.teamName);
        return (
          <motion.div
            key={entry.teamId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link href={`/team/${entry.teamId}`}>
              <GlassCard
                variant="soft"
                hover
                className="group flex flex-col items-center gap-3 p-4 text-center transition-all hover:border-white/10"
              >
                {/* Team logo or initials */}
                <div
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10"
                  style={{ backgroundColor: colors.bg }}
                >
                  {entry.teamLogoUrl ? (
                    <img
                      src={entry.teamLogoUrl}
                      alt={entry.teamName}
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-lg font-black" style={{ color: colors.text }}>
                      {entry.teamShortName?.slice(0, 3).toUpperCase() ?? entry.teamName.slice(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Team name */}
                <div>
                  <p className="text-xs font-bold text-[var(--color-slate-100)] group-hover:text-[var(--color-lime-400)] transition-colors line-clamp-2">
                    {entry.teamShortName || entry.teamName}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--color-slate-500)]">
                    {entry.points} pts · {entry.played} PJ
                  </p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
