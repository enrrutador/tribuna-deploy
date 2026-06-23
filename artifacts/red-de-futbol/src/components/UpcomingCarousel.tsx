import { useGetTodayMatches, getGetTodayMatchesQueryKey } from "@workspace/api-client-react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";
import { getTeamColor } from "@/utils/teamColors";

export default function UpcomingCarousel() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useGetTodayMatches({
    query: {
      queryKey: getGetTodayMatchesQueryKey(),
      refetchInterval: 60_000,
    },
  });

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⏰</span>
          <span className="font-bold text-gray-800 text-sm">Próximos Partidos</span>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shrink-0 w-[280px] h-[90px] bg-white/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const allGroups = data?.groups ?? [];
  const allMatches = allGroups.flatMap((g: any) => g.matches ?? []);
  const upcoming = allMatches
    .filter((m: any) => m.status === "upcoming")
    .sort((a: any, b: any) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime())
    .slice(0, 12);

  if (upcoming.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⏰</span>
        <span className="font-bold text-gray-800 text-sm">Próximos Partidos</span>
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-50 to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee" style={{ width: "max-content" }}>
        {[...upcoming, ...upcoming, ...upcoming].map((match: any, idx: number) => {
          const homeColor = getTeamColor(match.homeTeam?.name ?? "");
          const awayColor = getTeamColor(match.awayTeam?.name ?? "");
          const homeShort = match.homeTeam?.shortName ?? match.homeTeam?.name ?? "";
          const awayShort = match.awayTeam?.shortName ?? match.awayTeam?.name ?? "";
          const kickoff = format(new Date(match.kickoffTime), "HH:mm");
          const matchDate = new Date(match.kickoffTime);
          const isTodayMatch = isToday(matchDate);

          return (
            <div
              key={`${match.id}-${idx}`}
              onClick={() => navigate(`/partido/${match.id}`)}
              className="shrink-0 w-[280px] mr-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/40 p-3 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:bg-white/80 relative overflow-hidden group"
              style={{ "--team-color": homeColor.bg } as any}
            >
              <div className="team-accent-bar absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b rounded-full" style={{ background: `linear-gradient(to bottom, ${homeColor.bg}, ${awayColor.bg})` }} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isTodayMatch ? "Hoy" : format(matchDate, "d MMM", { locale: es })} • {match.tournamentName ?? ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-gray-100" style={{ backgroundColor: homeColor.bg + "20" }}>
                    {match.homeTeam?.logoUrl ? (
                      <img src={match.homeTeam.logoUrl} className="w-5 h-5 object-contain" alt="" />
                    ) : (
                      <span className="text-[8px] font-bold" style={{ color: homeColor.text }}>{homeShort.substring(0, 2)}</span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-gray-700 truncate">{homeShort}</span>
                </div>
                <span className="vs-pulse text-[11px] font-bold text-gray-300 shrink-0">VS</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span className="text-[12px] font-semibold text-gray-700 truncate">{awayShort}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-gray-100" style={{ backgroundColor: awayColor.bg + "20" }}>
                    {match.awayTeam?.logoUrl ? (
                      <img src={match.awayTeam.logoUrl} className="w-5 h-5 object-contain" alt="" />
                    ) : (
                      <span className="text-[8px] font-bold" style={{ color: awayColor.text }}>{awayShort.substring(0, 2)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full">{kickoff}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
