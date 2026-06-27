import { Trophy, CalendarDays, BarChart3, Target } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import MatchGroupCard from "@/components/domain/MatchGroupCard";
import StandingsTable from "@/components/domain/StandingsTable";
import ScorersList from "@/components/domain/ScorersList";
import {
  useTournament,
  useTournamentFixtures,
  useTournamentStandings,
  useTournamentScorers,
} from "@/lib/hooks";

export default function Tournament({ slug }: { slug: string }) {
  const { data: tournament, isLoading: loadingT } = useTournament(slug);
  const { data: fixtures, isLoading: loadingF, error: errorF, refetch: refetchF } = useTournamentFixtures(slug);
  const { data: standings, isLoading: loadingS } = useTournamentStandings(slug);
  const { data: scorersData, isLoading: loadingSc } = useTournamentScorers(slug);

  if (loadingT) return <PageLoader label="Cargando torneo" />;
  if (!tournament) {
    return <ErrorState title="Torneo no encontrado" description="El torneo que buscás no existe." />;
  }

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
      <Tabs
        tabs={[
          {
            id: "fixtures",
            label: "Partidos",
            icon: <CalendarDays size={16} />,
            content: (
              <div className="space-y-3">
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
                ) : fixtures?.groups && fixtures.groups.length > 0 ? (
                  fixtures.groups.map((group, i) => (
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
        ]}
      />
    </div>
  );
}
