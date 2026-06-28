import { motion } from "framer-motion";
import { Star, MapPin, Users, Trophy, Calendar, ArrowLeftRight } from "lucide-react";
import { useTeam } from "@/lib/hooks";
import { useFavorites } from "@/lib/favorites";
import { GlassCard } from "@/components/ui/GlassCard";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Team({ id: teamId }: { id: string }) {
  const { toggleTeam, isFavoriteTeam } = useFavorites();
  const { data: team, isLoading, error } = useTeam(teamId);

  if (isLoading) return <PageLoader label="Cargando equipo" />;

  if (error || !team) {
    return (
      <EmptyState
        icon="🤔"
        title="Equipo no encontrado"
        description="No se encontró información detallada de este equipo. Puede que no esté disponible en Promiedos todavía."
      />
    );
  }

  const isFav = isFavoriteTeam(team.id);
  const teamForBadge = { name: team.name, shortName: team.shortName, logoUrl: team.logoUrl };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard variant="strong" className="relative overflow-hidden p-6 sm:p-8">
          <div
            className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: `#${team.color}` }}
          />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <TeamBadge team={teamForBadge} size="xl" className="!h-24 !w-24 !text-2xl" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black text-[var(--color-slate-50)] sm:text-3xl">
                {team.name}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-slate-400)]">
                {team.mainLeague?.name}
              </p>
              {team.info.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  {team.info.slice(0, 4).map((item) => (
                    <span key={item.label} className="text-xs text-[var(--color-slate-500)]">
                      <span className="text-[var(--color-slate-400)]">{item.label}:</span>{" "}
                      {item.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant={isFav ? "secondary" : "outline"}
              onClick={() =>
                toggleTeam({
                  id: team.id,
                  name: team.name,
                  shortName: team.shortName,
                  logoUrl: team.logoUrl,
                  color: `#${team.color}`,
                })
              }
            >
              <Star size={16} className={isFav ? "fill-current text-[var(--color-warn)]" : ""} />
              {isFav ? "Favorito" : "Agregar"}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Estadio */}
      {team.stadium && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionTitle icon={<MapPin size={14} />} title="Estadio" accent="cyan" />
          <GlassCard variant="soft">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--color-slate-100)]">{team.stadium.name}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--color-slate-400)]">
                {team.stadium.capacity && (
                  <span>Capacidad: <strong className="text-[var(--color-slate-200)]">{team.stadium.capacity}</strong></span>
                )}
                {team.stadium.city && (
                  <span>Ciudad: <strong className="text-[var(--color-slate-200)]">{team.stadium.city}</strong></span>
                )}
              </div>
              {team.stadium.address && (
                <p className="text-xs text-[var(--color-slate-500)]">{team.stadium.address}</p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Plantel */}
      {team.squad.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SectionTitle icon={<Users size={14} />} title="Plantel" accent="lime" />
          <div className="space-y-4">
            {team.squad.map((group) => (
              <GlassCard key={group.position} variant="soft">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-cyan-400)]">
                  {group.position}
                </h4>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {group.players.map((player) => (
                    <div
                      key={player.name}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.03]"
                    >
                      {player.number && (
                        <span className="w-6 text-center text-xs font-bold text-[var(--color-slate-500)]">
                          {player.number}
                        </span>
                      )}
                      <span className="flex-1 truncate text-[var(--color-slate-200)]">{player.name}</span>
                      {player.age && (
                        <span className="text-xs text-[var(--color-slate-500)]">{player.age} años</span>
                      )}
                      {player.height && (
                        <span className="text-xs text-[var(--color-slate-500)]">{player.height}</span>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Goleadores */}
      {team.topScorers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionTitle icon={<Trophy size={14} />} title="Goleadores" accent="magenta" />
          <GlassCard variant="soft">
            <div className="space-y-1">
              {team.topScorers.map((scorer, i) => (
                <div
                  key={scorer.name}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/[0.03]"
                >
                  <span className="w-5 text-center text-xs font-bold text-[var(--color-slate-500)]">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[var(--color-slate-200)]">{scorer.name}</span>
                  <Badge tone="lime">{scorer.goals} gol{scorer.goals !== 1 ? "es" : ""}</Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Próximos partidos */}
      {team.nextMatches.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionTitle icon={<Calendar size={14} />} title="Próximos partidos" accent="cyan" />
          <GlassCard variant="soft">
            <div className="space-y-1">
              {team.nextMatches.map((m, i) => (
                <div
                  key={`${m.date}-${i}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
                >
                  <span className="w-20 shrink-0 text-xs text-[var(--color-slate-500)]">{m.date}</span>
                  <Badge tone={m.homeAway === "L" ? "cyan" : "default"} className="shrink-0">
                    {m.homeAway === "L" ? "Local" : "Visita"}
                  </Badge>
                  <span className="flex-1 truncate font-semibold text-[var(--color-slate-200)]">{m.opponent}</span>
                  {m.time && <span className="text-xs text-[var(--color-slate-500)]">{m.time}</span>}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Últimos partidos */}
      {team.lastMatches.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionTitle icon={<ArrowLeftRight size={14} />} title="Últimos partidos" accent="lime" />
          <GlassCard variant="soft">
            <div className="space-y-1">
              {team.lastMatches.map((m, i) => (
                <div
                  key={`${m.date}-${i}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
                >
                  <span className="w-20 shrink-0 text-xs text-[var(--color-slate-500)]">{m.date}</span>
                  <Badge tone={m.homeAway === "L" ? "cyan" : "default"} className="shrink-0">
                    {m.homeAway === "L" ? "Local" : "Visita"}
                  </Badge>
                  <span className="flex-1 truncate text-[var(--color-slate-200)]">{m.opponent}</span>
                  {m.result && (
                    <span className="font-bold text-[var(--color-lime-400)]">{m.result}</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
