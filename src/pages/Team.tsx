import { motion } from "framer-motion";
import { useMemo } from "react";
import { Star } from "lucide-react";
import { useTodayMatches, useMatches } from "@/lib/hooks";
import { useFavorites } from "@/lib/favorites";
import { argToday } from "@/lib/utils";
import { format, subDays, addDays } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import MatchRow from "@/components/domain/MatchRow";

export default function Team({ id: teamId }: { id: string }) {
  const { toggleTeam, isFavoriteTeam } = useFavorites();

  // Load a week window of matches to find this team's fixtures
  const dates = useMemo(() => {
    const today = argToday();
    return [
      format(subDays(new Date(today + "T12:00:00"), 2), "yyyy-MM-dd"),
      format(subDays(new Date(today + "T12:00:00"), 1), "yyyy-MM-dd"),
      today,
      format(addDays(new Date(today + "T12:00:00"), 1), "yyyy-MM-dd"),
      format(addDays(new Date(today + "T12:00:00"), 2), "yyyy-MM-dd"),
    ];
  }, []);

  const queries = dates.map((d) => useMatches({ date: d }));

  const allMatches = useMemo(() => {
    return queries
      .flatMap((q) => q.data?.groups ?? [])
      .flatMap((g) => g.matches)
      .filter((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId)
      .sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());
  }, [queries.map((q) => q.data).join()]);

  const teamRef = allMatches[0]?.homeTeam.id === teamId
    ? allMatches[0].homeTeam
    : allMatches[0]?.awayTeam.id === teamId
      ? allMatches[0].awayTeam
      : null;

  const anyLoading = queries.some((q) => q.isLoading);

  if (anyLoading) return <PageLoader label="Cargando equipo" />;

  if (!teamRef) {
    return (
      <EmptyState
        icon="🤔"
        title="Equipo sin partidos recientes"
        description="No encontramos partidos para este equipo en los próximos días. Volvé más tarde."
      />
    );
  }

  const upcoming = allMatches.filter((m) => m.status === "upcoming");
  const live = allMatches.filter((m) => m.status === "live");
  const finished = allMatches.filter((m) => m.status === "finished");
  const isFav = isFavoriteTeam(teamRef.id);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard variant="strong" className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: `#${teamRef.color}` }} />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <TeamBadge team={teamRef} size="xl" className="!h-24 !w-24 !text-2xl" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black text-[var(--color-slate-50)] sm:text-3xl">
                {teamRef.name}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-slate-400)]">{teamRef.abbreviation}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {live.length > 0 && <Badge tone="live" pulse>{live.length} en vivo</Badge>}
                {upcoming.length > 0 && <Badge tone="cyan">{upcoming.length} próximos</Badge>}
                {finished.length > 0 && <Badge tone="default">{finished.length} recientes</Badge>}
              </div>
            </div>
            <Button
              variant={isFav ? "secondary" : "outline"}
              onClick={() =>
                toggleTeam({
                  id: teamRef.id,
                  name: teamRef.name,
                  shortName: teamRef.shortName,
                  logoUrl: teamRef.logoUrl,
                  color: `#${teamRef.color}`,
                })
              }
            >
              <Star size={16} className={isFav ? "fill-current text-[var(--color-warn)]" : ""} />
              {isFav ? "Favorito" : "Agregar"}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Live */}
      {live.length > 0 && (
        <>
          <SectionTitle icon={<span className="text-sm">🔴</span>} title="En vivo" accent="magenta" />
          <GlassCard variant="soft" className="divide-y divide-white/[0.03]">
            {live.map((m) => <MatchRow key={m.id} match={m} />)}
          </GlassCard>
        </>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <SectionTitle icon={<span className="text-sm">📅</span>} title="Próximos partidos" accent="cyan" />
          <GlassCard variant="soft" className="divide-y divide-white/[0.03]">
            {upcoming.map((m) => <MatchRow key={m.id} match={m} />)}
          </GlassCard>
        </>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <>
          <SectionTitle icon={<span className="text-sm">✅</span>} title="Resultados recientes" accent="lime" />
          <GlassCard variant="soft" className="divide-y divide-white/[0.03]">
            {finished.map((m) => <MatchRow key={m.id} match={m} />)}
          </GlassCard>
        </>
      )}
    </div>
  );
}
