import { useGetTournamentStandings, getGetTournamentStandingsQueryKey, useListTournaments, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { getTeamColor } from "@/utils/teamColors";

const ALL_LEAGUE_IDS = [
  "conmebol.libertadores", "conmebol.sudamericana", "fifa.worldq.conmebol", "fifa.world",
  "uefa.champions", "uefa.europa", "uefa.conference",
  "arg.1", "arg.copa", "arg.2",
  "uru.1", "chi.1", "col.1", "bol.1", "par.1", "ecu.1", "per.1", "ven.1", "mex.1", "usa.1",
  "eng.1", "esp.1", "ger.1", "ita.1", "fra.1", "ned.1", "por.1",
];

function StandingsCard({ leagueId }: { leagueId: string }) {
  const { data, isLoading } = useGetTournamentStandings(leagueId as any, {
    query: {
      queryKey: getGetTournamentStandingsQueryKey(leagueId as any),
      staleTime: 5 * 60_000,
    },
  });

  if (isLoading) {
    return (
      <div className="shrink-0 w-[320px] h-[180px] bg-white/20 rounded-[1.5rem] animate-pulse border border-white/10" />
    );
  }

  const standings = data?.standings ?? [];
  if (standings.length === 0) return null;

  const tournamentName = data?.tournament?.name ?? leagueId;
  const topEntries = standings.slice(0, 10);

  return (
    <div className="shrink-0 w-[320px] bg-white/30 backdrop-blur-sm rounded-[1.5rem] border border-white/20 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="px-4 pt-3 pb-2">
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">{tournamentName}</span>
      </div>
      <div className="px-3 pb-3 space-y-0.5">
        {topEntries.map((entry: any, idx: number) => {
          const color = getTeamColor(entry.team?.name ?? "");
          const positionBg = idx === 0 ? "bg-amber-100" : idx === 1 ? "bg-gray-100" : idx === 2 ? "bg-orange-50" : "";
          return (
            <div key={entry.team?.id ?? idx} className={`flex items-center gap-2 px-2 py-1.5 rounded-xl ${positionBg} hover:bg-white/50 transition-colors`}>
              <span className="w-5 text-center text-[11px] font-bold text-gray-500">{entry.position}</span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: color.bg + "20" }}
              >
                {entry.team?.logoUrl ? (
                  <img src={entry.team.logoUrl} className="w-4 h-4 object-contain" alt="" />
                ) : (
                  <span className="text-[7px] font-bold" style={{ color: color.text }}>{(entry.team?.shortName ?? entry.team?.name ?? "").substring(0, 2)}</span>
                )}
              </div>
              <span className="flex-1 text-[12px] font-medium text-gray-700 truncate">{entry.team?.shortName ?? entry.team?.name}</span>
              <span className="text-[12px] font-bold text-gray-900 tabular-nums">{entry.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StandingsCarousel() {
  const { data: tournamentsData } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() },
  });

  const leagueIds = tournamentsData
    ? ALL_LEAGUE_IDS.filter((id) => {
        const all = [
          ...(tournamentsData.destacados ?? []),
          ...(tournamentsData.argentina ?? []),
          ...(tournamentsData.sudamerica ?? []),
          ...(tournamentsData.world ?? []),
        ];
        return all.some((t: any) => t.id === id);
      })
    : ALL_LEAGUE_IDS;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-200/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🏆</span>
        <span className="font-bold text-gray-800 text-sm">Tabla de Posiciones</span>
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee" style={{ width: "max-content" }}>
        {[...leagueIds, ...leagueIds, ...leagueIds].map((id, idx) => (
          <div key={`${id}-${idx}`} className="shrink-0 mr-3">
            <StandingsCard leagueId={id} />
          </div>
        ))}
      </div>
    </div>
  );
}
