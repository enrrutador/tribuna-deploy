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
import { Bell, BarChart2, Settings, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

export default function MatchList() {
  const [filter, setFilter] = useState<"Todos" | "Vivo" | "Finalizados" | "Próximos">("Todos");
  const [date, setDate] = useState<Date>(new Date());

  const isTodayDate = isToday(date);
  
  let statusParam: ListMatchesStatus | undefined = undefined;
  if (filter === "Vivo") statusParam = "live";
  if (filter === "Finalizados") statusParam = "finished";
  if (filter === "Próximos") statusParam = "upcoming";

  const dateParam = format(date, "yyyy-MM-dd");

  const isDefaultView = isTodayDate && filter === "Todos";

  const { data: todayMatchesData, isLoading: isLoadingToday } = useGetTodayMatches({
    query: { 
      queryKey: getGetTodayMatchesQueryKey(),
      enabled: isDefaultView 
    }
  });

  const { data: filteredMatchesData, isLoading: isLoadingFiltered } = useListMatches(
    { status: statusParam, date: dateParam },
    { query: { 
        queryKey: getListMatchesQueryKey({ status: statusParam, date: dateParam }),
        enabled: !isDefaultView
      } 
    }
  );

  const isLoading = isDefaultView ? isLoadingToday : isLoadingFiltered;
  const matchGroups = isDefaultView ? todayMatchesData?.groups : filteredMatchesData?.groups;

  return (
    <div className="space-y-6">
      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden text-white relative">
        <div className="h-32 bg-gradient-to-r from-[#1a9be6] to-blue-900 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-6 py-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 -mt-10">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg border border-gray-200">
              <span className="text-3xl text-black">⚽</span>
            </div>
            <div className="pt-8">
              <h2 className="text-2xl font-bold">Mundial 2026</h2>
              <p className="text-sm text-gray-400">Torneo Destacado</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-md text-sm font-medium">Competencia</button>
            <button className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-md text-sm font-medium">Simular llaves</button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Partidos de hoy</h1>
            <Popover>
              <PopoverTrigger asChild>
                <button className="bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-300 transition-colors">
                  {format(date, "d MMM", { locale: es })} <CalendarIcon className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => { if (newDate) setDate(newDate); }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex bg-white rounded-full p-1 shadow-sm border overflow-x-auto no-scrollbar">
              {(["Todos", "Vivo", "Finalizados", "Próximos"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === tab
                      ? "bg-[#1e1e1e] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors bg-white border shadow-sm">
                <BarChart2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors bg-white border shadow-sm">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : matchGroups?.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border">
              <p className="text-gray-500">No hay partidos para mostrar con los filtros seleccionados.</p>
            </div>
          ) : (
            matchGroups?.map((group) => (
              <div key={group.tournament.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="bg-[#f8f8f8] px-4 py-3 border-b flex justify-between items-center group/header hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center gap-3">
                    {group.tournament.logoUrl ? (
                      <img src={group.tournament.logoUrl} alt={group.tournament.name} className="w-6 h-6 object-contain" />
                    ) : group.tournament.flagEmoji ? (
                      <span className="text-lg leading-none">{group.tournament.flagEmoji}</span>
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    )}
                    <span className="font-bold text-gray-900">{group.tournament.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover/header:text-gray-600 transition-colors" />
                  </div>
                  {group.round && (
                    <span className="text-sm text-gray-500 font-medium">{group.round}</span>
                  )}
                </div>

                <div className="divide-y">
                  {group.matches.map((match) => (
                    <div key={match.id} className="flex items-center p-3 hover:bg-gray-50 transition-colors group/match">
                      <div className="w-20 shrink-0 text-sm text-gray-500 flex flex-col items-center justify-center border-r mr-3 pr-3 border-gray-100">
                        {match.status === "live" ? (
                          <div className="flex items-center gap-1.5 text-[#e53935] font-bold">
                            {match.minute}'
                            <span className="w-2 h-2 rounded-full bg-[#e53935] animate-pulse" />
                          </div>
                        ) : match.status === "finished" ? (
                          "FT"
                        ) : (
                          format(new Date(match.kickoffTime), "HH:mm")
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center pr-4">
                          <div className="flex items-center gap-3">
                            {match.homeTeam.logoUrl ? (
                              <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded-full" />
                            )}
                            <span className={`font-medium ${match.homeScore != null && match.homeScore > (match.awayScore ?? 0) ? 'text-gray-900' : 'text-gray-600'}`}>
                              {match.homeTeam.name}
                            </span>
                          </div>
                          {match.homeScore != null && (
                            <span className={`font-bold text-lg w-6 text-center ${match.homeScore > (match.awayScore ?? 0) ? 'text-gray-900' : 'text-gray-500'}`}>{match.homeScore}</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center pr-4">
                          <div className="flex items-center gap-3">
                            {match.awayTeam.logoUrl ? (
                              <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded-full" />
                            )}
                            <span className={`font-medium ${match.awayScore != null && match.awayScore > (match.homeScore ?? 0) ? 'text-gray-900' : 'text-gray-600'}`}>
                              {match.awayTeam.name}
                            </span>
                          </div>
                          {match.awayScore != null && (
                            <span className={`font-bold text-lg w-6 text-center ${match.awayScore > (match.homeScore ?? 0) ? 'text-gray-900' : 'text-gray-500'}`}>{match.awayScore}</span>
                          )}
                        </div>
                      </div>

                      <div className="w-12 shrink-0 flex justify-end">
                        <button className="text-gray-300 hover:text-gray-600 transition-colors">
                          <Bell className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white border-t px-4 py-3 text-center">
                  <button className="text-[#1a9be6] text-sm font-bold hover:underline flex items-center justify-center w-full gap-1 uppercase tracking-wide">
                    Ir a {group.tournament.name} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
