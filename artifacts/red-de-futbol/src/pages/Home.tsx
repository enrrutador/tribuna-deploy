import { useGetTodayMatches, getGetTodayMatchesQueryKey } from "@workspace/api-client-react";
import WorldCupResultsCarousel from "@/components/WorldCupResultsCarousel";
import StandingsCarousel from "@/components/StandingsCarousel";
import UpcomingCarousel from "@/components/UpcomingCarousel";
import HeroSection from "@/components/HeroSection";
import WorldCupNewsSidebar from "@/components/WorldCupNewsSidebar";
import MatchList from "@/components/MatchList";
import { useSeo } from "@/hooks/useSeo";

export default function Home() {
  useSeo({
    title: "Partidos de hoy",
    description:
      "Resultados en vivo, partidos de hoy, próximos fixtures y estadísticas del fútbol argentino y mundial.",
  });

  const { data: todayData } = useGetTodayMatches({
    query: {
      queryKey: getGetTodayMatchesQueryKey(),
      refetchInterval: 60_000,
    },
  });

  const allGroups = todayData?.groups ?? [];
  const allMatches = allGroups.flatMap((g: any) => g.matches ?? []);
  const liveCount = allMatches.filter((m: any) => m.status === "live").length;

  return (
    <div className="space-y-5">
      <WorldCupResultsCarousel />
      <HeroSection liveCount={liveCount} />
      <UpcomingCarousel />
      <div className="flex gap-5">
        <div className="flex-1 min-w-0">
          <StandingsCarousel />
        </div>
        <WorldCupNewsSidebar />
      </div>
      <MatchList />
    </div>
  );
}
