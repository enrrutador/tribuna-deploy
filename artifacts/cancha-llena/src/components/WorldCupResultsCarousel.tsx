import { useGetTournamentFixtures, getGetTournamentFixturesQueryKey } from "@workspace/api-client-react";
import { format as dateFnsFormat } from "date-fns";
import { useLocation } from "wouter";
import { getTeamColor } from "@/utils/teamColors";

const WC_LEAGUE_ID = "fifa.world" as any;

function buildDateRange(): string {
  const today = new Date();
  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  const from = dateFnsFormat(fourDaysAgo, "yyyyMMdd");
  const to = dateFnsFormat(today, "yyyyMMdd");
  return `${from}-${to}`;
}

export default function WorldCupResultsCarousel() {
  const [, navigate] = useLocation();
  const dates = buildDateRange();

  const { data, isLoading } = useGetTournamentFixtures(WC_LEAGUE_ID, { dates }, {
    query: {
      queryKey: getGetTournamentFixturesQueryKey(WC_LEAGUE_ID, { dates }),
      staleTime: 5 * 60_000,
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-amber-200/30 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-amber-900 text-sm">Mundial 2026</span>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shrink-0 w-[260px] h-[52px] bg-white/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const allGroups = data?.groups ?? [];
  const allMatches = allGroups.flatMap((g: any) => g.matches ?? []);

  if (allMatches.length === 0) return null;

  const finished = allMatches
    .filter((m: any) => m.status === "finished")
    .sort((a: any, b: any) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime());

  const upcoming = allMatches
    .filter((m: any) => m.status === "upcoming")
    .sort((a: any, b: any) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

  const displayMatches = [...finished.slice(0, 8), ...upcoming.slice(0, 4)];

  if (displayMatches.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-amber-200/30 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span className="text-xl">🌍</span>
        <span className="font-bold text-amber-900 text-sm">Mundial 2026 — Resultados</span>
      </div>
      <div className="relative overflow-hidden pb-3">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[...displayMatches, ...displayMatches, ...displayMatches].map((match: any, idx: number) => {
            const homeShort = match.homeTeam?.shortName ?? match.homeTeam?.name ?? "";
            const awayShort = match.awayTeam?.shortName ?? match.awayTeam?.name ?? "";
            const isFinished = match.status === "finished";
            const kickoffTime = dateFnsFormat(new Date(match.kickoffTime), "HH:mm");

            return (
              <div
                key={`${match.id}-${idx}`}
                onClick={() => navigate(`/partido/${match.id}`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/70 border border-amber-200/30 cursor-pointer transition-all shrink-0 hover:scale-[1.02] hover:shadow-sm min-w-fit mr-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-amber-200/30 shrink-0"
                    style={{ backgroundColor: getTeamColor(match.homeTeam?.name ?? "").bg + "30" }}
                  >
                    {match.homeTeam?.logoUrl ? (
                      <img src={match.homeTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <span className="text-[6px] font-bold text-amber-800">{homeShort.substring(0, 2)}</span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-amber-900 truncate max-w-[70px]">{homeShort}</span>
                </div>

                {isFinished ? (
                  <div className="flex items-center gap-1 font-mono font-black shrink-0">
                    <span className="text-[13px] text-amber-800">{match.homeScore}</span>
                    <span className="text-[9px] text-amber-400/50">-</span>
                    <span className="text-[13px] text-amber-800">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-full shrink-0">
                    {kickoffTime}
                  </span>
                )}

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] font-semibold text-amber-900 truncate max-w-[70px]">{awayShort}</span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-amber-200/30 shrink-0"
                    style={{ backgroundColor: getTeamColor(match.awayTeam?.name ?? "").bg + "30" }}
                  >
                    {match.awayTeam?.logoUrl ? (
                      <img src={match.awayTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <span className="text-[6px] font-bold text-amber-800">{awayShort.substring(0, 2)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
