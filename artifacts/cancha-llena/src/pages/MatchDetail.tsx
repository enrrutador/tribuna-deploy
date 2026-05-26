import { useParams, Link } from "wouter";
import { useGetMatch, getGetMatchQueryKey } from "@workspace/api-client-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight, Tv, RefreshCw } from "lucide-react";
import { getTeamColor, getBroadcasterStyle } from "@/utils/teamColors";

const EVENT_ICONS: Record<string, string> = {
  goal: "⚽",
  owngoal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
  penalty: "🥅",
  penalty_miss: "❌",
  var_review: "📺",
};

const EVENT_LABELS: Record<string, string> = {
  goal: "Gol",
  owngoal: "Autogol",
  yellow_card: "Tarjeta amarilla",
  red_card: "Tarjeta roja",
  substitution: "Cambio",
  penalty: "Penal",
  penalty_miss: "Penal fallado",
  var_review: "Revisión VAR",
};

export default function MatchDetail() {
  const params = useParams<{ id: string }>();
  const matchId = Number(params.id);

  const { data: match, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useGetMatch(matchId, {
    query: {
      queryKey: getGetMatchQueryKey(matchId),
      enabled: !!matchId,
      // Refetch every 15s for live matches, 60s for others
      refetchInterval: (query) => {
        const status = (query.state.data as any)?.status;
        if (status === "live") return 15_000;
        if (status === "finished") return false; // no background refresh for finished
        return 60_000; // upcoming
      },
      staleTime: 0,
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !match) return <ErrorState />;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasScore = match.homeScore != null && match.awayScore != null;
  const homeWins = hasScore && match.homeScore! > match.awayScore!;
  const awayWins = hasScore && match.awayScore! > match.homeScore!;
  const homeColor = getTeamColor(match.homeTeam.name);
  const awayColor = getTeamColor(match.awayTeam.name);
  const broadcaster = getBroadcasterStyle(match.broadcastChannel ?? null);

  const events = (match as any).events ?? [];

  const updatedAgo = dataUpdatedAt
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true, locale: es })
    : null;

  return (
    <div className="space-y-4">
      {/* Tournament breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-[#1a9be6] transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/torneo/${match.tournamentSlug ?? ""}`} className="hover:text-[#1a9be6] transition-colors">
            {match.tournamentName}
          </Link>
          {match.round && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{match.round}</span>
            </>
          )}
        </div>
        {/* Refresh indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          {isFetching && <RefreshCw className="w-3 h-3 animate-spin text-[#1a9be6]" />}
          {updatedAgo && !isFetching && <span>Actualizado {updatedAgo}</span>}
          {isLive && !isFetching && (
            <span className="flex items-center gap-1 text-[#e53935]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
              en vivo
            </span>
          )}
        </div>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        {/* Status bar */}
        <div className={`px-4 py-1.5 flex items-center justify-between text-[12px] font-semibold ${isLive ? "bg-[#e53935]" : isFinished ? "bg-gray-700" : "bg-[#1a9be6]"} text-white`}>
          <span>
            {isLive ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                EN VIVO · {match.minute}'
              </span>
            ) : isFinished ? "PARTIDO FINALIZADO" : (
              <span>
                {format(new Date(match.kickoffTime), "HH:mm", { locale: es })} hs
              </span>
            )}
          </span>
          {broadcaster && (
            <span className="flex items-center gap-1 opacity-90">
              <Tv className="w-3 h-3" />
              {broadcaster.label}
            </span>
          )}
        </div>

        {/* Teams and score */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <Link href={`/equipo/${match.homeTeam.id}`}>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden border-2 border-white shadow group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: homeColor.bg, color: homeColor.text }}
                >
                  {match.homeTeam.logoUrl
                    ? <img src={match.homeTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                    : (match.homeTeam.shortName ?? match.homeTeam.name).substring(0, 2).toUpperCase()
                  }
                </div>
                <span className={`text-[13px] font-bold text-center leading-tight max-w-[80px] ${homeWins ? "text-gray-900" : "text-gray-600"}`}>
                  {match.homeTeam.shortName ?? match.homeTeam.name}
                </span>
                <span className="text-[11px] text-[#1a9be6] font-medium group-hover:underline">Local</span>
              </div>
            </Link>

            {/* Score */}
            <div className="flex flex-col items-center gap-1">
              {hasScore ? (
                <div className="flex items-center gap-3">
                  <span className={`text-4xl font-black tabular-nums ${homeWins ? "text-gray-900" : "text-gray-400"}`}>
                    {match.homeScore}
                  </span>
                  <span className="text-2xl text-gray-300 font-light">-</span>
                  <span className={`text-4xl font-black tabular-nums ${awayWins ? "text-gray-900" : "text-gray-400"}`}>
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-light text-gray-300">vs</span>
              )}
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                {isFinished ? "Resultado final" : isLive ? "Marcador" : format(new Date(match.kickoffTime), "EEEE d MMM", { locale: es })}
              </span>
            </div>

            {/* Away team */}
            <Link href={`/equipo/${match.awayTeam.id}`}>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden border-2 border-white shadow group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: awayColor.bg, color: awayColor.text }}
                >
                  {match.awayTeam.logoUrl
                    ? <img src={match.awayTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                    : (match.awayTeam.shortName ?? match.awayTeam.name).substring(0, 2).toUpperCase()
                  }
                </div>
                <span className={`text-[13px] font-bold text-center leading-tight max-w-[80px] ${awayWins ? "text-gray-900" : "text-gray-600"}`}>
                  {match.awayTeam.shortName ?? match.awayTeam.name}
                </span>
                <span className="text-[11px] text-[#1a9be6] font-medium group-hover:underline">Visitante</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-[13px]">Incidencias del partido</span>
            {isLive && (
              <span className="text-[11px] text-[#e53935] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
                Se actualiza automáticamente
              </span>
            )}
          </div>

          {/* Two-column events layout */}
          <div className="p-4 space-y-1">
            {events
              .slice()
              .sort((a: any, b: any) => a.minute - b.minute)
              .map((event: any) => {
                const isHomeEvent = event.teamId === match.homeTeam.id;
                const icon = EVENT_ICONS[event.eventType] ?? "•";
                const isGoal = event.eventType === "goal" || event.eventType === "owngoal" || event.eventType === "penalty";

                return (
                  <div key={event.id} className={`flex items-center gap-2 py-1.5 ${isHomeEvent ? "flex-row" : "flex-row-reverse"}`}>
                    {/* Minute */}
                    <div className="w-10 shrink-0 text-center">
                      <span className="text-[12px] font-bold text-gray-400">{event.minute}'</span>
                    </div>

                    {/* Icon */}
                    <div className="w-7 h-7 flex items-center justify-center text-base shrink-0">
                      {icon}
                    </div>

                    {/* Player info */}
                    <div className={`flex-1 ${isHomeEvent ? "text-left" : "text-right"}`}>
                      <span className={`text-[13px] ${isGoal ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                        {event.playerName ?? ""}
                      </span>
                      {event.assistName && (
                        <span className="text-[12px] text-gray-400 block">
                          Asistencia: {event.assistName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">{EVENT_LABELS[event.eventType] ?? event.eventType}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Match info */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-[13px]">Información del partido</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <InfoField label="Torneo" value={match.tournamentName} />
          {match.round && <InfoField label="Fecha / Ronda" value={match.round} />}
          <InfoField label="Fecha" value={format(new Date(match.kickoffTime), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })} />
          <InfoField label="Hora" value={format(new Date(match.kickoffTime), "HH:mm") + " hs"} />
          {match.broadcastChannel && <InfoField label="Transmisión" value={match.broadcastChannel} />}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">{label}</div>
      <div className="text-[13px] text-gray-800 font-medium capitalize">{value}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 w-full" />
        <div className="p-6 flex justify-between items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="w-16 h-16 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-8 text-center">
      <p className="text-gray-400 text-sm">No se encontró el partido</p>
      <Link href="/" className="text-[#1a9be6] text-sm mt-2 inline-block">Volver al inicio</Link>
    </div>
  );
}
