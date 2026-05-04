import React, { useState } from "react";
import {
  useGetTodayMatches,
  getGetTodayMatchesQueryKey,
  useListMatches,
  getListMatchesQueryKey,
} from "@workspace/api-client-react";
import type { ListMatchesStatus } from "@workspace/api-client-react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart2, Settings, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import MatchGroupCard from "./MatchGroupCard";
import { Link } from "wouter";

type FilterTab = "Todos" | "Vivo" | "Finalizados" | "Próximos";

export default function MatchList() {
  const [filter, setFilter] = useState<FilterTab>("Todos");
  const [date, setDate] = useState<Date>(new Date());

  const isTodayDate = isToday(date);

  let statusParam: ListMatchesStatus | undefined = undefined;
  if (filter === "Vivo") statusParam = "live";
  if (filter === "Finalizados") statusParam = "finished";
  if (filter === "Próximos") statusParam = "upcoming";

  const dateParam = format(date, "yyyy-MM-dd");
  const isDefaultView = isTodayDate && filter === "Todos";

  const { data: todayMatchesData, isLoading: isLoadingToday, refetch: refetchToday, dataUpdatedAt: updatedToday } = useGetTodayMatches({
    query: {
      queryKey: getGetTodayMatchesQueryKey(),
      enabled: isDefaultView,
      refetchInterval: 30_000,
    }
  });

  const { data: filteredMatchesData, isLoading: isLoadingFiltered, refetch: refetchFiltered, dataUpdatedAt: updatedFiltered } = useListMatches(
    { status: statusParam, date: dateParam },
    {
      query: {
        queryKey: getListMatchesQueryKey({ status: statusParam, date: dateParam }),
        enabled: !isDefaultView,
        refetchInterval: filter === "Vivo" ? 15_000 : 60_000,
      }
    }
  );

  const isLoading = isDefaultView ? isLoadingToday : isLoadingFiltered;
  const matchGroups = isDefaultView ? todayMatchesData?.groups : filteredMatchesData?.groups;
  const totalMatches = isDefaultView ? todayMatchesData?.totalMatches : filteredMatchesData?.totalMatches;
  const liveCount = isDefaultView ? todayMatchesData?.liveCount : filteredMatchesData?.liveCount;
  const updatedAt = isDefaultView ? updatedToday : updatedFiltered;

  const handleRefresh = () => {
    if (isDefaultView) refetchToday();
    else refetchFiltered();
  };

  return (
    <div className="space-y-4">
      {/* Featured banner */}
      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden text-white relative">
        <div className="h-28 bg-gradient-to-r from-[#1a9be6] via-blue-700 to-blue-900 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="px-6 py-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 -mt-10">
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg border border-gray-200">
              <span className="text-3xl">⚽</span>
            </div>
            <div className="pt-8">
              <h2 className="text-xl font-bold">Mundial 2026</h2>
              <p className="text-sm text-gray-400">Torneo Destacado</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/torneo/mundial-2026">
              <div className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                Ver torneo
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900">
            {isTodayDate ? "Partidos de hoy" : format(date, "d 'de' MMMM", { locale: es })}
          </h1>
          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-white border px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm">
                {format(date, "d MMM", { locale: es })} <CalendarIcon className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { if (d) setDate(d); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {liveCount != null && liveCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 text-[#e53935] border border-red-200 px-2 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#e53935] animate-pulse" />
              {liveCount} en vivo
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-full p-1 shadow-sm border overflow-x-auto no-scrollbar">
            {(["Todos", "Vivo", "Finalizados", "Próximos"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === tab ? "bg-[#1e1e1e] text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors bg-white border shadow-sm"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors bg-white border shadow-sm" title="Configurar">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {totalMatches != null && (
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{totalMatches} partido{totalMatches !== 1 ? "s" : ""}</span>
          {updatedAt > 0 && (
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Actualizado {format(new Date(updatedAt), "HH:mm:ss")}
            </span>
          )}
        </div>
      )}

      {/* Match groups */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : matchGroups?.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-lg border">
            <p className="text-3xl mb-3">⚽</p>
            <p className="text-gray-500 font-medium">No hay partidos para mostrar.</p>
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
