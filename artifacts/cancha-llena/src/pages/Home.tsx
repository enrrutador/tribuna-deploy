import MatchList from "@/components/MatchList";
import { useSeo } from "@/hooks/useSeo";

export default function Home() {
  useSeo({
    title: "Partidos de hoy",
    description:
      "Resultados en vivo, partidos de hoy, próximos fixtures y estadísticas del fútbol argentino y sudamericano.",
  });

  return <MatchList />;
}
