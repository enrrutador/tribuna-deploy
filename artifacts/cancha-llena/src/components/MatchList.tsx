import { useState } from "react";
import {
  useGetTodayMatches,
  getGetTodayMatchesQueryKey,
  useListMatches,
  getListMatchesQueryKey,
} from "@workspace/api-client-react";
import type { ListMatchesStatus } from "@workspace/api-client-react";
import { format, isToday, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, RefreshCw, Zap } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import MatchGroupCard from "./MatchGroupCard";
import { Link, useLocation } from "wouter";
import { useListTournaments, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { getTeamColor } from "@/utils/teamColors";
import { format as dateFnsFormat } from "date-fns";

type FilterTab = "Todos" | "Vivo" | "Finalizados" | "Próximos";

function FeaturedBanner() {
  const { data: tournamentsData } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() },
  });
  const featured = tournamentsData?.destacados?.[0];

  return (
    <div className="bg-[#1a1a2e] rounded-sm overflow-hidden flex items-center justify-between h-[64px] relative">
      <div className="absolute right-0 top-0 bottom-0 w-40 opacity-30 hex-pattern" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#1a9be6]/30 to-transparent" />
      <div className="flex items-center gap-3 px-4 z-10">
        <div className="w-9 h-9 bg-[#1a9be6] rounded-sm flex items-center justify-center text-xl shrink-0">
          {featured?.flagEmoji ?? "🌍"}
        </div>
        <span className="text-white font-bold text-[16px]">{featured?.name ?? "Mundial 2026"}</span>
      </div>
      <div className="flex items-center gap-2 px-4 z-10">
        <Link href={`/torneo/${featured?.slug ?? "mundial-2026"}`}>
          <div className="text-[13px] text-gray-300 border border-gray-600 hover:border-gray-400 hover:text-white px-4 py-1.5 rounded-sm transition-colors cursor-pointer">
            Competencia
          </div>
        </Link>
      </div>
    </div>
  );
}

function LiveMatchBanner({ groups }: { groups: Array<any> }) {
  const [, navigate] = useLocation();
  const liveGroups = groups.filter((g) => g.matches.some((m: any) => m.status === "live"));
  if (!liveGroups.length) return null;

  const liveMatches = liveGroups.flatMap((g: any) => g.matches.filter((m: any) => m.status === "live"));

  return (
    <div className="bg-[#1a1a2e] rounded-sm overflow-hidden border border-red-900/30">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-[#e53935] animate-pulse" />
        <span className="text-white font-bold text-[13px] uppercase tracking-wider">En Vivo</span>
        <span className="ml-1 bg-[#e53935] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
          {liveMatches.length}
        </span>
      </div>

      {/* Live match pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {liveMatches.map((match: any) => {
          const homeColor = getTeamColor(match.homeTeam.name);
          const awayColor = getTeamColor(match.awayTeam.name);
          return (
            <button
              key={match.id}
              onClick={() => navigate(`/partido/${match.id}`)}
              className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm px-3 py-2 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                {/* Home */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold overflow-hidden shrink-0"
                    style={{ backgroundColor: homeColor.bg, color: homeColor.text }}
                  >
                    {match.homeTeam.logoUrl
                      ? <img src={match.homeTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                      : (match.homeTeam.shortName ?? match.homeTeam.name).substring(0, 2).toUpperCase()
                    }
                  </div>
                  <span className="text-white text-[12px] font-semibold">
                    {match.homeTeam.shortName ?? match.homeTeam.name}
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-sm">
                  <span className="text-white font-black text-[14px] tabular-nums">{match.homeScore ?? 0}</span>
                  <span className="text-white/40 text-[11px]">–</span>
                  <span className="text-white font-black text-[14px] tabular-nums">{match.awayScore ?? 0}</span>
                </div>

                {/* Away */}
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[12px] font-semibold">
                    {match.awayTeam.shortName ?? match.awayTeam.name}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold overflow-hidden shrink-0"
                    style={{ backgroundColor: awayColor.bg, color: awayColor.text }}
                  >
                    {match.awayTeam.logoUrl
                      ? <img src={match.awayTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                      : (match.awayTeam.shortName ?? match.awayTeam.name).substring(0, 2).toUpperCase()
                    }
                  </div>
                </div>

                {/* Minute */}
                <span className="text-[#e53935] text-[11px] font-bold flex items-center gap-0.5">
                  {match.minute}'
                  <span className="w-1 h-1 rounded-full bg-[#e53935] animate-pulse" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MatchList() {
  const [filter, setFilter] = useState<FilterTab>("Todos");
  const [date, setDate] = useState<Date>(new Date());

  const isTodayDate = isToday(date);
  let statusParam: ListMatchesStatus | undefined;
  if (filter === "Vivo") statusParam = "live";
  if (filter === "Finalizados") statusParam = "finished";
  if (filter === "Próximos") statusParam = "upcoming";

  const dateParam = dateFnsFormat(date, "yyyy-MM-dd");
  const isDefaultView = isTodayDate && filter === "Todos";

  const {
    data: todayData,
    isLoading: loadingToday,
    isFetching: fetchingToday,
    dataUpdatedAt: updatedToday,
    refetch: refetchToday,
  } = useGetTodayMatches({
    query: {
      queryKey: getGetTodayMatchesQueryKey(),
      enabled: isDefaultView,
      refetchInterval: 30_000,
    },
  });

  const {
    data: filteredData,
    isLoading: loadingFiltered,
    isFetching: fetchingFiltered,
    dataUpdatedAt: updatedFiltered,
    refetch: refetchFiltered,
  } = useListMatches(
    { status: statusParam, date: dateParam },
    {
      query: {
        queryKey: getListMatchesQueryKey({ status: statusParam, date: dateParam }),
        enabled: !isDefaultView,
        refetchInterval: filter === "Vivo" ? 15_000 : 60_000,
      },
    }
  );

  const isLoading = isDefaultView ? loadingToday : loadingFiltered;
  const isFetching = isDefaultView ? fetchingToday : fetchingFiltered;
  const dataUpdatedAt = isDefaultView ? updatedToday : updatedFiltered;
  const matchGroups = isDefaultView ? todayData?.groups : filteredData?.groups;
  const liveCount = isDefaultView ? todayData?.liveCount : filteredData?.liveCount;

  const updatedAgo = dataUpdatedAt && !isLoading
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true, locale: es })
    : null;

  const handleRefresh = () => {
    if (isDefaultView) refetchToday();
    else refetchFiltered();
  };

  return (
    <div className="space-y-4">
      {/* Featured banner */}
      <FeaturedBanner />

      {/* Live matches banner — shown when there are live matches in default view */}
      {isDefaultView && !isLoading && matchGroups && liveCount != null && liveCount > 0 && (
        <LiveMatchBanner groups={matchGroups} />
      )}

      {/* Title row */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-gray-900">
          {isTodayDate ? "Partidos de hoy" : format(date, "d 'de' MMMM", { locale: es })}
        </h1>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 border border-gray-300 px-3 py-1.5 rounded-sm hover:bg-gray-50 transition-colors bg-white">
              {format(date, "d MMM", { locale: es })}
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { if (d) setDate(d); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-sm overflow-hidden">
          {(["Todos", "Vivo", "Finalizados", "Próximos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 flex items-center gap-1.5 ${
                filter === tab
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab === "Vivo" && (
                <span className={`w-1.5 h-1.5 rounded-full ${filter === "Vivo" ? "bg-white animate-pulse" : liveCount ? "bg-[#e53935] animate-pulse" : "bg-gray-300"}`} />
              )}
              {tab}
              {tab === "Vivo" && liveCount != null && liveCount > 0 && filter !== "Vivo" && (
                <span className="ml-0.5 bg-[#e53935] text-white text-[9px] font-bold px-1 py-0.5 rounded-sm leading-none">
                  {liveCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {updatedAgo && (
            <span className="text-[11px] text-gray-400 hidden sm:block">
              {isFetching ? (
                <span className="flex items-center gap-1 text-[#1a9be6]">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  Actualizando…
                </span>
              ) : (
                `Act. ${updatedAgo}`
              )}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={`p-1.5 rounded-sm border border-gray-200 bg-white transition-colors ${isFetching ? "text-[#1a9be6]" : "text-gray-500 hover:bg-gray-100"}`}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Match groups */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-sm p-4 space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </>
        ) : matchGroups?.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-sm p-12 text-center">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-gray-700 font-semibold">No hay partidos para mostrar.</p>
            <p className="text-gray-400 text-sm mt-1">Probá con otro filtro o fecha.</p>
          </div>
        ) : (
          matchGroups?.map((group) => (
            <MatchGroupCard key={group.tournament.id} group={group} showLink />
          ))
        )}
      </div>
    </div>
  );
}
