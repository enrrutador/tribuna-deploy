import { useState } from "react";
import { Trophy, CalendarDays, BarChart3, Target, Users, Info } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import MatchGroupCard from "@/components/domain/MatchGroupCard";
import StandingsTable from "@/components/domain/StandingsTable";
import ScorersList from "@/components/domain/ScorersList";
import RoundSelector from "@/components/domain/RoundSelector";
import TeamGrid from "@/components/domain/TeamGrid";
import TeamStats from "@/components/domain/TeamStats";
import {
  useTournament,
  useTournamentFixtures,
  useTournamentStandings,
  useTournamentScorers,
  useTournamentRounds,
  useTournamentTeamStats,
} from "@/lib/hooks";

export default function Tournament({ slug }: { slug: string }) {
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  const { data: tournament, isLoading: loadingT } = useTournament(slug);
  const { data: fixtures, isLoading: loadingF, error: errorF, refetch: refetchF } = useTournamentFixtures(slug);
  const { data: standings, isLoading: loadingS } = useTournamentStandings(slug);
  const { data: scorersData, isLoading: loadingSc } = useTournamentScorers(slug);
  const { data: roundsData } = useTournamentRounds(slug);
  const { data: teamStatsData, isLoading: loadingTS } = useTournamentTeamStats(slug);

  if (loadingT) return <PageLoader label="Cargando torneo" />;
  if (!tournament) {
    return <ErrorState title="Torneo no encontrado" description="El torneo que buscás no existe." />;
  }

  const rounds = roundsData?.rounds ?? [];
  const selectedRoundObj = rounds.find((r) => r.key === selectedRound);

  // Filter fixtures by selected round if available
  const filteredGroups = (() => {
    if (!fixtures?.groups) return [];
    if (!selectedRound || rounds.length === 0) return fixtures.groups;

    // If the round key matches a group's tournament round, filter
    return fixtures.groups;
  })();

  const tabs = [
    {
      id: "fixtures",
      label: "Fechas",
      icon: <CalendarDays size={16} />,
      content: (
        <div className="space-y-3">
          {rounds.length > 0 && (
            <RoundSelector
              rounds={rounds}
              selectedKey={selectedRound}
              onChange={setSelectedRound}
            />
          )}
          {loadingF ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass rounded-2xl p-5 space-y-3">
                  <div className="shimmer h-4 w-1/3 rounded" />
                  <div className="shimmer h-12 w-full rounded" />
                  <div className="shimmer h-12 w-full rounded" />
                </div>
              ))}
            </div>
          ) : errorF ? (
            <ErrorState onRetry={() => refetchF()} />
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group, i) => (
              <MatchGroupCard key={group.tournament.id} group={group} index={i} />
            ))
          ) : (
            <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
              No hay partidos disponibles para este torneo.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "standings",
      label: "Tabla",
      icon: <BarChart3 size={16} />,
      content: loadingS ? (
        <PageLoader label="Cargando tabla" />
      ) : standings?.groups ? (
        <StandingsTable groups={standings.groups} />
      ) : (
        <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
          Tabla de posiciones no disponible.
        </div>
      ),
    },
    {
      id: "teams",
      label: "Equipos",
      icon: <Users size={16} />,
      content: loadingS ? (
        <PageLoader label="Cargando equipos" />
      ) : standings?.groups?.[0]?.entries ? (
        <div className="space-y-4">
          <TeamGrid entries={standings.groups[0].entries} />
          {teamStatsData?.stats && teamStatsData.stats.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
                Estadísticas del Torneo
              </h3>
              <TeamStats stats={teamStatsData.stats} />
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
          Datos de equipos no disponibles.
        </div>
      ),
    },
    {
      id: "scorers",
      label: "Goleadores",
      icon: <Target size={16} />,
      content: loadingSc ? (
        <PageLoader label="Cargando goleadores" />
      ) : scorersData?.scorers ? (
        <ScorersList scorers={scorersData.scorers} />
      ) : (
        <div className="glass rounded-2xl p-10 text-center text-sm text-[var(--color-slate-400)]">
          Datos de goleadores no disponibles.
        </div>
      ),
    },
    {
      id: "info",
      label: "Info",
      icon: <Info size={16} />,
      content: (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--color-slate-100)]">{tournament.name}</h3>
            <p className="mt-2 text-sm text-[var(--color-slate-400)]">
              {tournament.flag} {tournament.country}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-[var(--color-slate-300)]">ID del torneo:</span>
                <span className="ml-2 text-[var(--color-slate-400)]">{tournament.id}</span>
              </div>
              <div>
                <span className="font-semibold text-[var(--color-slate-300)]">Tipo:</span>
                <span className="ml-2 text-[var(--color-slate-400)]">{tournament.type}</span>
              </div>
              {tournament.slug && (
                <div>
                  <span className="font-semibold text-[var(--color-slate-300)]">Slug:</span>
                  <span className="ml-2 text-[var(--color-slate-400)]">{tournament.slug}</span>
                </div>
              )}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-slate-400)]">
              Fuentes de datos
            </h4>
            <ul className="space-y-1 text-sm text-[var(--color-slate-400)]">
              <li>• ESPN API — Partidos en vivo y datos principales</li>
              <li>• Promiedos — Tabla de posiciones, goleadores y detalles de equipos</li>
              <li>• Tribuna — Interfaz de usuario y agregación de datos</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Tournament header */}
      <SectionTitle
        icon={<Trophy size={20} />}
        title={tournament.name}
        subtitle={`${tournament.flag} ${tournament.country}`}
        accent="cyan"
      />

      {/* Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
}
