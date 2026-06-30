import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Radio, RefreshCw, Star } from "lucide-react";
import { useTodayMatches, useLiveMatches, useMatches } from "@/lib/hooks";
import { useFavorites } from "@/lib/favorites";
import { timeAgo, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DateNav } from "@/components/ui/DateNav";
import { Segmented } from "@/components/ui/Segmented";
import MatchGroupCard from "@/components/domain/MatchGroupCard";
import NewsPanel from "@/components/domain/NewsPanel";
import type { CategoryId } from "@/lib/types";

type Filter = "Todos" | "Vivo" | "Finalizados" | "Próximos";

const CATEGORIES: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "argentina", label: "Argentina" },
  { id: "sudamerica", label: "Sudamérica" },
  { id: "world", label: "Mundial" },
];

export default function Home() {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [date, setDate] = useState(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const todayDate = isToday(date);
  const isDefaultView = todayDate && filter === "Todos" && category === "all";

  const {
    data: todayData,
    isLoading: loadingToday,
    isFetching: fetchingToday,
    dataUpdatedAt: updatedToday,
    refetch: refetchToday,
    error: errorToday,
  } = useTodayMatches();

  const {
    data: filteredData,
    isLoading: loadingFiltered,
    isFetching: fetchingFiltered,
    dataUpdatedAt: updatedFiltered,
    refetch: refetchFiltered,
    error: errorFiltered,
  } = useMatches(
    {
      status: filter === "Vivo" ? "live" : filter === "Finalizados" ? "finished" : filter === "Próximos" ? "upcoming" : undefined,
      date: dateStr,
    },
    { enabled: !isDefaultView }
  );

  const { data: liveData } = useLiveMatches();
  const { teams: favTeams } = useFavorites();
  const favTeamIds = useMemo(() => new Set(favTeams.map((t) => t.id)), [favTeams]);

  const isLoading = isDefaultView ? loadingToday : loadingFiltered;
  const isFetching = isDefaultView ? fetchingToday : fetchingFiltered;
  const dataUpdatedAt = isDefaultView ? updatedToday : updatedFiltered;
  const rawData = isDefaultView ? todayData : filteredData;
  const error = isDefaultView ? errorToday : errorFiltered;
  const refetch = isDefaultView ? refetchToday : refetchFiltered;

  const liveCount = liveData?.totalMatches ?? 0;

  // Filter by category + sort favorites first
  const sortedGroups = useMemo(() => {
    let groups = [...(rawData?.groups ?? [])];

    // Category filter
    if (category !== "all") {
      groups = groups.filter((g) => g.tournament.category === category);
    }

    // Sort: groups with favorite team matches first, then mundial first, then rest
    groups.sort((a, b) => {
      const aHasFav = a.matches.some((m) => favTeamIds.has(m.homeTeam.id) || favTeamIds.has(m.awayTeam.id));
      const bHasFav = b.matches.some((m) => favTeamIds.has(m.homeTeam.id) || favTeamIds.has(m.awayTeam.id));
      if (aHasFav !== bHasFav) return aHasFav ? -1 : 1;
      if (a.tournament.slug === "mundial-2026") return -1;
      if (b.tournament.slug === "mundial-2026") return 1;
      return 0;
    });

    return groups;
  }, [rawData, category, favTeamIds]);

  const totalMatches = rawData?.totalMatches ?? 0;
  const updatedAgo = dataUpdatedAt && !isLoading ? timeAgo(dataUpdatedAt) : null;

  return (
    <div className="space-y-4">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-lime-500)]/10 via-[var(--color-cyan-500)]/5 to-[var(--color-magenta-500)]/10 animate-gradient" />
        <div className="relative flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <h1 className="text-xl font-black tracking-tight sm:text-2xl text-gradient-lime">
              Fútbol en vivo
            </h1>
            <p className="mt-0.5 text-xs text-[var(--color-slate-400)]">
              {todayDate ? "Resultados de hoy" : format(date, "EEE d 'de' MMM", { locale: es })}
              <span className="mx-2 text-[var(--color-slate-700)]">·</span>
              <span>{totalMatches} partido{totalMatches !== 1 ? "s" : ""}</span>
              {liveCount > 0 && (
                <Badge tone="live" pulse className="ml-2 text-[9px]">
                  {liveCount} en vivo
                </Badge>
              )}
            </p>
          </div>
          {liveCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-live)]/15 border border-[var(--color-live)]/30"
            >
              <Radio size={18} className="text-[var(--color-live)]" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex gap-5 items-start">
        {/* LEFT: Matches */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Controls: Date + Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DateNav date={date} onChange={setDate} />
            <Segmented
              options={[
                { value: "Todos", label: "Todos" },
                { value: "Vivo", label: "Vivo", badge: liveCount > 0 ? <Badge tone="live" pulse className="text-[8px] px-1 py-0">{liveCount}</Badge> : undefined },
                { value: "Finalizados", label: "Finalizados" },
                { value: "Próximos", label: "Próximos" },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                  category === cat.id
                    ? "bg-[var(--color-lime-400)] text-black"
                    : "bg-white/[0.04] text-[var(--color-slate-400)] hover:bg-white/[0.08]"
                )}
              >
                {cat.label}
              </button>
            ))}
            {favTeamIds.size > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0 text-[10px] text-[var(--color-warn)]">
                <Star size={10} className="fill-current" />
                <span className="font-bold">{favTeamIds.size} fav</span>
              </div>
            )}
          </div>

          {/* Refresh + meta */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-slate-500)]">
              {isLoading ? "" : `${sortedGroups.length} torneo${sortedGroups.length !== 1 ? "s" : ""}`}
            </span>
            <div className="flex items-center gap-3">
              {updatedAgo && (
                <span className="text-[11px] text-[var(--color-slate-500)]">
                  {isFetching ? (
                    <span className="flex items-center gap-1 text-[var(--color-lime-400)]">
                      <RefreshCw size={10} className="animate-spin" /> Actualizando…
                    </span>
                  ) : (
                    `Act. ${updatedAgo}`
                  )}
                </span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          {/* Match content */}
          {error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : sortedGroups.length === 0 ? (
            <EmptyState
              icon="⚽"
              title="Sin partidos"
              description="No hay partidos para los filtros seleccionados. Probá con otra fecha o filtro."
            />
          ) : (
            <div className="space-y-3">
              {sortedGroups.map((group, i) => (
                <MatchGroupCard key={group.tournament.id} group={group} showLink index={i} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: News */}
        <div className="hidden xl:block w-[340px] shrink-0">
          <div className="sticky top-20">
            <NewsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
