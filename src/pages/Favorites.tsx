import { useMemo } from "react";
import { Star, Trash2, Zap, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/lib/favorites";
import { useTodayMatches, useLiveMatches } from "@/lib/hooks";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { formatKickoff } from "@/lib/utils";
import type { Match } from "@/lib/types";

export default function Favorites() {
  const { teams, tournaments, toggleTeam, toggleTournament, clear } = useFavorites();
  const { data: todayData } = useTodayMatches();
  const { data: liveData } = useLiveMatches();

  const allMatches = useMemo(() => {
    const today = todayData?.groups?.flatMap((g) => g.matches) ?? [];
    const live = liveData?.groups?.flatMap((g) => g.matches) ?? [];
    const merged = new Map<string, Match>();
    for (const m of [...live, ...today]) merged.set(m.id, m);
    return [...merged.values()];
  }, [todayData, liveData]);

  const favoriteTeamIds = useMemo(() => new Set(teams.map((t) => t.id)), [teams]);

  const favoriteMatches = useMemo(() => {
    return allMatches.filter(
      (m) => favoriteTeamIds.has(m.homeTeam.id) || favoriteTeamIds.has(m.awayTeam.id)
    );
  }, [allMatches, favoriteTeamIds]);

  const liveFavorites = favoriteMatches.filter((m) => m.status === "live");
  const upcomingFavorites = favoriteMatches.filter((m) => m.status === "upcoming");

  const hasContent = teams.length > 0 || tournaments.length > 0;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<Star size={20} />}
        title="Mis Favoritos"
        subtitle={hasContent ? `${teams.length} equipos · ${tournaments.length} torneos` : undefined}
        action={
          hasContent ? (
            <Button variant="ghost" size="sm" onClick={clear} className="text-[var(--color-slate-500)]">
              <Trash2 size={14} />
              Limpiar
            </Button>
          ) : undefined
        }
      />

      {!hasContent ? (
        <EmptyState
          icon="⭐"
          title="Sin favoritos"
          description="Agregá equipos y torneos a tus favoritos para verlos acá. Hacé click en la estrella al lado de cada torneo en el sidebar, o en las páginas de equipo."
        />
      ) : (
        <>
          {/* Live favorite matches */}
          {liveFavorites.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-[var(--color-live)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-live)]">
                  En vivo ahora
                </h3>
              </div>
              {liveFavorites.map((match) => (
                <FavoriteMatchCard key={match.id} match={match} favoriteTeamIds={favoriteTeamIds} />
              ))}
            </div>
          )}

          {/* Upcoming favorite matches */}
          {upcomingFavorites.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[var(--color-cyan-400)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
                  Próximos
                </h3>
              </div>
              {upcomingFavorites.map((match) => (
                <FavoriteMatchCard key={match.id} match={match} favoriteTeamIds={favoriteTeamIds} />
              ))}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Favorite teams */}
            {teams.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate-500)]">
                  Equipos
                </h3>
                {teams.map((team, i) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link href={`/team/${team.id}`}>
                      <GlassCard variant="soft" hover className="flex items-center gap-3 px-4 py-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-white/10"
                          style={{ backgroundColor: team.color, color: "#fff" }}
                        >
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-contain p-0.5" />
                          ) : (
                            team.shortName.slice(0, 3).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-slate-100)] truncate">{team.name}</p>
                          <p className="text-[11px] text-[var(--color-slate-500)]">{team.shortName}</p>
                        </div>
                        {favoriteTeamIds.has(team.id) && liveFavorites.some((m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id) && (
                          <Badge tone="live" pulse className="text-[8px]">LIVE</Badge>
                        )}
                        <button
                          onClick={(e) => { e.preventDefault(); toggleTeam(team); }}
                          className="text-[var(--color-warn)] hover:text-[var(--color-warn)]/70 transition-colors"
                        >
                          <Star size={16} className="fill-current" />
                        </button>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Favorite tournaments */}
            {tournaments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-slate-500)]">
                  Torneos
                </h3>
                {tournaments.map((slug, i) => (
                  <motion.div
                    key={slug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link href={`/tournament/${slug}`}>
                      <GlassCard variant="soft" hover className="flex items-center gap-3 px-4 py-3">
                        <Trophy size={16} className="text-[var(--color-lime-400)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-slate-100)] capitalize">{slug.replace(/-/g, " ")}</p>
                        </div>
                        <Badge tone="cyan" className="text-[9px]">Ver</Badge>
                        <button
                          onClick={(e) => { e.preventDefault(); toggleTournament(slug); }}
                          className="text-[var(--color-warn)] hover:text-[var(--color-warn)]/70 transition-colors"
                        >
                          <Star size={16} className="fill-current" />
                        </button>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FavoriteMatchCard({ match, favoriteTeamIds }: { match: Match; favoriteTeamIds: Set<string> }) {
  const isLive = match.status === "live";
  const isHome = favoriteTeamIds.has(match.homeTeam.id);

  return (
    <Link href={`/match/${match.id}`}>
      <GlassCard
        variant="soft"
        hover
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer",
          isLive && "border-[var(--color-live)]/20 bg-[var(--color-live)]/5"
        )}
      >
        {/* Tournament */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{match.tournamentFlag}</span>
          <span className="text-[10px] text-[var(--color-slate-500)] truncate hidden sm:inline">{match.tournamentName}</span>
        </div>

        {/* Teams */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <span className={cn(
            "text-xs font-semibold truncate",
            isHome && isLive && "text-[var(--color-lime-400)]",
            !isHome && "text-[var(--color-slate-300)]"
          )}>
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
          <span className="text-[var(--color-slate-600)] text-xs">
            {isLive || match.status === "finished" ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : "vs"}
          </span>
          <span className={cn(
            "text-xs font-semibold truncate",
            !isHome && isLive && "text-[var(--color-lime-400)]",
            isHome && "text-[var(--color-slate-300)]"
          )}>
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>

        {/* Status */}
        {isLive ? (
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <Badge tone="live" pulse className="text-[9px]">{match.minute ?? "LIVE"}</Badge>
          </motion.div>
        ) : match.status === "finished" ? (
          <Badge tone="default" className="text-[9px]">FT</Badge>
        ) : (
          <span className="text-[10px] font-bold text-[var(--color-cyan-400)]">{formatKickoff(match.kickoffTime)}</span>
        )}
      </GlassCard>
    </Link>
  );
}
