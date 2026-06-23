import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { addDays, subDays, format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Zap, Radio, CalendarDays, RefreshCw, Trophy, BarChart3 } from "lucide-react";
import { useTodayMatches, useLiveMatches, useMatches, useTournaments } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DateNav } from "@/components/ui/DateNav";
import { Segmented } from "@/components/ui/Segmented";
import { MatchGroupCard } from "@/components/domain/MatchGroupCard";

type Filter = "Todos" | "Vivo" | "Finalizados" | "Próximos";

export default function Home() {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [date, setDate] = useState(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const todayDate = isToday(date);
  const isDefaultView = todayDate && filter === "Todos";

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
  const { data: tournaments } = useTournaments();

  const isLoading = isDefaultView ? loadingToday : loadingFiltered;
  const isFetching = isDefaultView ? fetchingToday : fetchingFiltered;
  const dataUpdatedAt = isDefaultView ? updatedToday : updatedFiltered;
  const data = isDefaultView ? todayData : filteredData;
  const error = isDefaultView ? errorToday : errorFiltered;
  const refetch = isDefaultView ? refetchToday : refetchFiltered;

  const liveCount = liveData?.totalMatches ?? 0;
  const groups = data?.groups ?? [];
  const totalMatches = data?.totalMatches ?? 0;

  const updatedAgo = dataUpdatedAt && !isLoading ? timeAgo(dataUpdatedAt) : null;

  // Featured tournaments
  const featured = useMemo(() => {
    const dest = tournaments?.destacados ?? [];
    return dest.slice(0, 4);
  }, [tournaments]);

  return (
    <div className="space-y-5">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-lime-500)]/10 via-[var(--color-cyan-500)]/5 to-[var(--color-magenta-500)]/10 animate-gradient" />
        <div className="absolute inset-0 glass" />
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-gradient-lime">
                  Fútbol en vivo
                </h1>
                <p className="mt-1 text-sm text-[var(--color-slate-400)]">
                  {todayDate ? "Resultados de hoy" : `Resultados del ${format(date, "d 'de' MMMM", { locale: es })}`}
                  {liveCount > 0 && (
                    <Badge tone="live" pulse className="ml-2">
                      {liveCount} en vivo
                    </Badge>
                  )}
                </p>
              </motion.div>

              {/* Featured tournament pills */}
              {featured.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {featured.map((t) => (
                    <a
                      key={t.slug}
                      href={`/tournament/${t.slug}`}
                      className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-slate-300)] transition-all hover:bg-white/10 hover:text-[var(--color-lime-400)] hover:-translate-y-0.5"
                    >
                      <span>{t.flag}</span>
                      {t.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Live animation orb */}
            {liveCount > 0 && (
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ rotate: { repeat: Infinity, duration: 12, ease: "linear" }, scale: { repeat: Infinity, duration: 2 } }}
                className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-live)]/15 border border-[var(--color-live)]/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-live)]/20 border border-[var(--color-live)]/40 shadow-[var(--shadow-glow-live)]">
                  <Radio size={22} className="text-[var(--color-live)]" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Controls row: Date + Filters */}
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

      {/* Refresh + meta */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-slate-500)]">
          {isLoading ? "" : `${totalMatches} partido${totalMatches !== 1 ? "s" : ""} • ${groups.length} torneo${groups.length !== 1 ? "s" : ""}`}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="⚽"
          title="Sin partidos"
          description="No hay partidos para los filtros seleccionados. Probá con otra fecha o filtro."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group, i) => (
            <MatchGroupCard
              key={group.tournament.id}
              group={group}
              showLink
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
