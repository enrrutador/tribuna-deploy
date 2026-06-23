import { Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/lib/favorites";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Link } from "wouter";

export default function Favorites() {
  const { teams, tournaments, toggleTeam, toggleTournament, clear } = useFavorites();

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
                  <GlassCard
                    variant="soft"
                    hover
                    className="flex items-center gap-3 px-4 py-3"
                  >
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
                    <button
                      onClick={() => toggleTeam(team)}
                      className="text-[var(--color-warn)] hover:text-[var(--color-warn)]/70 transition-colors"
                    >
                      <Star size={16} className="fill-current" />
                    </button>
                  </GlassCard>
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
                    <GlassCard
                      variant="soft"
                      hover
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--color-slate-100)] capitalize">{slug.replace(/-/g, " ")}</p>
                      </div>
                      <Badge tone="cyan" className="text-[9px]">Ver</Badge>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleTournament(slug);
                        }}
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
      )}
    </div>
  );
}
