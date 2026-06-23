import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatKickoff } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { Badge } from "@/components/ui/Badge";
import type { Match } from "@/lib/types";

interface MatchRowProps {
  match: Match;
  compact?: boolean;
}

export default function MatchRow({ match, compact = false }: MatchRowProps) {
  const { toggleTeam, isFavoriteTeam } = useFavorites();
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const homeFav = isFavoriteTeam(match.homeTeam.id);
  const awayFav = isFavoriteTeam(match.awayTeam.id);

  return (
    <Link href={`/match/${match.leagueId}:${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200",
          "hover:bg-white/[0.03] border border-transparent hover:border-white/5",
          isLive && "bg-[var(--color-live)]/[0.04] hover:bg-[var(--color-live)]/[0.07]",
          compact ? "py-2.5" : "sm:px-4 sm:py-3.5"
        )}
      >
        {/* Live glow accent */}
        {isLive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-full bg-[var(--color-live)] shadow-[var(--shadow-glow-live)]"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        )}

        {/* Time / Kickoff / Minute */}
        <div className="w-14 shrink-0 text-center">
          {isLive ? (
            <Badge tone="live" pulse>
              {match.minute ?? "LIVE"}
            </Badge>
          ) : isFinished ? (
            <span className="text-[11px] font-semibold text-[var(--color-slate-500)] uppercase">FT</span>
          ) : (
            <span className="text-sm font-bold tabular-nums text-[var(--color-cyan-400)]">
              {formatKickoff(match.kickoffTime)}
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {/* Home team */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamBadge team={match.homeTeam} size={compact ? "xs" : "sm"} />
            <div className="min-w-0 flex-1">
              <p className={cn(
                "text-sm font-semibold truncate transition-colors",
                isLive ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-300)] group-hover:text-[var(--color-slate-100)]"
              )}>
                {match.homeTeam.shortName ?? match.homeTeam.name}
              </p>
            </div>
          </div>

          {/* Score block */}
          <div className="flex shrink-0 items-center">
            {(isLive || isFinished) ? (
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5">
                <motion.span
                  key={`h-${match.homeScore}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-7 text-center text-lg font-black tabular-nums text-[var(--color-slate-100)]"
                >
                  {match.homeScore ?? 0}
                </motion.span>
                <span className="text-[var(--color-slate-600)] text-xs font-light">–</span>
                <motion.span
                  key={`a-${match.awayScore}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-7 text-center text-lg font-black tabular-nums text-[var(--color-slate-100)]"
                >
                  {match.awayScore ?? 0}
                </motion.span>
              </div>
            ) : (
              <span className="text-xs font-medium text-[var(--color-slate-500)]">vs</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="min-w-0 flex-1 text-right">
              <p className={cn(
                "text-sm font-semibold truncate transition-colors",
                isLive ? "text-[var(--color-slate-100)]" : "text-[var(--color-slate-300)] group-hover:text-[var(--color-slate-100)]"
              )}>
                {match.awayTeam.shortName ?? match.awayTeam.name}
              </p>
            </div>
            <TeamBadge team={match.awayTeam} size={compact ? "xs" : "sm"} />
          </div>
        </div>

        {/* Favorite star (right) */}
        {(homeFav || awayFav) && (
          <div className="absolute right-2 top-1">
            <span className="text-[9px] text-[var(--color-warn)]/60">★</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
