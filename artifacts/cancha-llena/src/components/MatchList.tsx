import { useState } from "react";
import {
  useGetTodayMatches,
  getGetTodayMatchesQueryKey,
  useListMatches,
  getListMatchesQueryKey,
} from "@workspace/api-client-react";
import type { ListMatchesStatus } from "@workspace/api-client-react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart2, Settings, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import MatchGroupCard from "./MatchGroupCard";
import { Link } from "wouter";
import { useListTournaments, getListTournamentsQueryKey } from "@workspace/api-client-react";

type FilterTab = "Todos" | "Vivo" | "Finalizados" | "Próximos";

function FeaturedBanner() {
  const { data: tournamentsData } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() },
  });
  const featured = tournamentsData?.destacados?.[0];

  return (
    <div className="bg-[#1a1a2e] rounded-sm overflow-hidden flex items-center justify-between h-[64px] relative">
      {/* Decorative pattern right side */}
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
        <Link href={`/torneo/${featured?.slug ?? "mundial-2026"}`}>
          <div className="text-[13px] text-white bg-[#1a9be6] hover:bg-[#1585ca] px-4 py-1.5 rounded-sm transition-colors cursor-pointer font-medium">
            Simular llaves
          </div>
        </Link>
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

  const dateParam = format(date, "yyyy-MM-dd");
  const isDefaultView = isTodayDate && filter === "Todos";

  const {
    data: todayData,
    isLoading: loadingToday,
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
  const matchGroups = isDefaultView ? todayData?.groups : filteredData?.groups;
  const liveCount = isDefaultView ? todayData?.liveCount : filteredData?.liveCount;

  const handleRefresh = () => {
    if (isDefaultView) refetchToday();
    else refetchFiltered();
  };

  return (
    <div className="space-y-4">
      {/* Featured banner */}
      <FeaturedBanner />

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
              className={`px-4 py-2 text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                filter === tab
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {liveCount != null && liveCount > 0 && (
            <div className="flex items-center gap-1.5 text-[#e53935] text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#e53935] animate-pulse" />
              {liveCount} en vivo
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-sm border border-gray-200 bg-white transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-sm border border-gray-200 bg-white transition-colors">
            <Settings className="w-4 h-4" />
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
          <div className="bg-white border border-gray-200 rounded-sm p-10 text-center">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-gray-600 font-medium">No hay partidos para mostrar.</p>
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
