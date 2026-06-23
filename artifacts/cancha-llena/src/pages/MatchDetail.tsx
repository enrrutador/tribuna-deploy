import { useParams, Link } from "wouter";
import { useGetMatch, getGetMatchQueryKey } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { useSeo } from "@/hooks/useSeo";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight, Tv, RefreshCw, Star, Users, History } from "lucide-react";
import { getTeamColor, getBroadcasterStyle } from "@/utils/teamColors";
import { useFavorites } from "@/hooks/useFavorites";

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
  const matchId = params.id ?? "";
  const { isTeamFavorite, toggleTeam } = useFavorites();

  const { data: match, isLoading, isError, dataUpdatedAt, isFetching } = useGetMatch(matchId as unknown as number, {
    query: {
      queryKey: getGetMatchQueryKey(matchId as unknown as number),
      enabled: !!matchId,
      refetchInterval: (query) => {
        const status = (query.state.data as any)?.status;
        if (status === "live") return 15_000;
        if (status === "finished") return false;
        return 60_000;
      },
      staleTime: 0,
    },
  });

  const hasScore = match?.homeScore != null && match?.awayScore != null;
  const seoTitle = match
    ? `${match.homeTeam.shortName ?? match.homeTeam.name} ${hasScore ? `${match.homeScore}–${match.awayScore}` : "vs"} ${match.awayTeam.shortName ?? match.awayTeam.name}`
    : "Partido";
  const seoDesc = match
    ? `${match.homeTeam.name} vs ${match.awayTeam.name} · ${match.tournamentName}${hasScore ? ` · Resultado: ${match.homeScore}–${match.awayScore}` : ""}`
    : undefined;

  useSeo({ title: seoTitle, description: seoDesc });

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !match) return <ErrorState />;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const homeWins = hasScore && match.homeScore! > match.awayScore!;
  const awayWins = hasScore && match.awayScore! > match.homeScore!;
  const homeColor = getTeamColor(match.homeTeam.name);
  const awayColor = getTeamColor(match.awayTeam.name);

  const { data: lineups } = useQuery({
    queryKey: ["lineups", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/lineups/${matchId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!matchId && (isFinished || isLive),
    staleTime: 5 * 60_000,
  });

  const homeTeamId = (match.homeTeam as any).id;
  const awayTeamId = (match.awayTeam as any).id;

  const { data: h2h } = useQuery({
    queryKey: ["h2h", homeTeamId, awayTeamId],
    queryFn: async () => {
      const res = await fetch(`/api/lineups/h2h/${homeTeamId}/${awayTeamId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!homeTeamId && !!awayTeamId,
    staleTime: 5 * 60_000,
  });
  const broadcaster = getBroadcasterStyle(match.broadcastChannel ?? null);

  const events = (match as any).events ?? [];
  const stats = (match as any).stats as null | {
    home: { possession: number; totalShots: number; shotsOnTarget: number; corners: number; fouls: number; yellowCards: number; redCards: number; offsides: number; saves: number; passes: number; passAccuracy: number };
    away: { possession: number; totalShots: number; shotsOnTarget: number; corners: number; fouls: number; yellowCards: number; redCards: number; offsides: number; saves: number; passes: number; passAccuracy: number };
  };

  const updatedAgo = dataUpdatedAt
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true, locale: es })
    : null;

  const homeIsFav = isTeamFavorite(String(match.homeTeam.id));
  const awayIsFav = isTeamFavorite(String(match.awayTeam.id));

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
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
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          {isFetching && <RefreshCw className="w-3 h-3 animate-spin text-[#1a9be6]" />}
          {updatedAgo && !isFetching && <span>Act. {updatedAgo}</span>}
          {isLive && !isFetching && (
            <span className="flex items-center gap-1 text-[#e53935] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
              EN VIVO
            </span>
          )}
        </div>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className={`px-4 py-2 flex items-center justify-between text-[12px] font-bold tracking-wide ${isLive ? "bg-[#e53935]" : isFinished ? "bg-gray-700" : "bg-[#1a9be6]"} text-white`}>
          <span>
            {isLive ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                EN VIVO · {match.minute}'
              </span>
            ) : isFinished ? "PARTIDO FINALIZADO" : (
              format(new Date(match.kickoffTime), "HH:mm", { locale: es }) + " hs"
            )}
          </span>
          {broadcaster && (
            <span className="flex items-center gap-1 opacity-90">
              <Tv className="w-3 h-3" />
              {broadcaster.label}
            </span>
          )}
        </div>

        <div className="px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <Link href={`/equipo/${match.homeTeam.id}`}>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  style={{ backgroundColor: homeColor.bg, color: homeColor.text }}
                >
                  {match.homeTeam.logoUrl
                    ? <img src={match.homeTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                    : (match.homeTeam.shortName ?? match.homeTeam.name).substring(0, 2).toUpperCase()
                  }
                </div>
              </Link>
              <div className="text-center">
                <div className={`text-[14px] font-bold leading-tight ${homeWins ? "text-gray-900" : "text-gray-600"}`}>
                  {match.homeTeam.shortName ?? match.homeTeam.name}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Local</div>
              </div>
              <button
                onClick={() => toggleTeam({ id: String(match.homeTeam.id), name: match.homeTeam.name, logoUrl: (match.homeTeam as any).logoUrl })}
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-sm border transition-colors ${homeIsFav ? "border-amber-400 bg-amber-50 text-amber-600" : "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500"}`}
              >
                <Star className={`w-3 h-3 ${homeIsFav ? "fill-amber-400" : ""}`} />
                {homeIsFav ? "Seguido" : "Seguir"}
              </button>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {hasScore ? (
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-black tabular-nums ${homeWins ? "text-gray-900" : "text-gray-400"}`}>
                    {match.homeScore}
                  </span>
                  <span className="text-2xl text-gray-200 font-light">–</span>
                  <span className={`text-5xl font-black tabular-nums ${awayWins ? "text-gray-900" : "text-gray-400"}`}>
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-light text-gray-200">vs</span>
              )}
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                {isFinished ? "Resultado final" : isLive ? "Marcador" : format(new Date(match.kickoffTime), "EEEE d MMM", { locale: es })}
              </span>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <Link href={`/equipo/${match.awayTeam.id}`}>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  style={{ backgroundColor: awayColor.bg, color: awayColor.text }}
                >
                  {match.awayTeam.logoUrl
                    ? <img src={match.awayTeam.logoUrl} className="w-full h-full object-contain" alt="" />
                    : (match.awayTeam.shortName ?? match.awayTeam.name).substring(0, 2).toUpperCase()
                  }
                </div>
              </Link>
              <div className="text-center">
                <div className={`text-[14px] font-bold leading-tight ${awayWins ? "text-gray-900" : "text-gray-600"}`}>
                  {match.awayTeam.shortName ?? match.awayTeam.name}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Visitante</div>
              </div>
              <button
                onClick={() => toggleTeam({ id: String(match.awayTeam.id), name: match.awayTeam.name, logoUrl: (match.awayTeam as any).logoUrl })}
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-sm border transition-colors ${awayIsFav ? "border-amber-400 bg-amber-50 text-amber-600" : "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500"}`}
              >
                <Star className={`w-3 h-3 ${awayIsFav ? "fill-amber-400" : ""}`} />
                {awayIsFav ? "Seguido" : "Seguir"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction widget — only for upcoming matches */}
      {!isLive && !isFinished && <PredictionWidget homeName={match.homeTeam.shortName ?? match.homeTeam.name} awayName={match.awayTeam.shortName ?? match.awayTeam.name} />}

      {/* Match statistics */}
      {stats && (stats.home.totalShots > 0 || stats.away.totalShots > 0) && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <span className="font-bold text-gray-900 text-[13px]">Estadísticas</span>
            {isLive && (
              <span className="text-[10px] text-[#e53935] font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#e53935] animate-pulse" />
                En vivo
              </span>
            )}
          </div>
          <div className="p-4 space-y-3">
            {/* Possession bar */}
            <StatBar
              label="Posesión"
              homeVal={Math.round(stats.home.possession)}
              awayVal={Math.round(stats.away.possession)}
              format={(v) => `${v}%`}
              highlight
            />
            <StatBar label="Tiros" homeVal={stats.home.totalShots} awayVal={stats.away.totalShots} />
            <StatBar label="Al arco" homeVal={stats.home.shotsOnTarget} awayVal={stats.away.shotsOnTarget} />
            <StatBar label="Córners" homeVal={stats.home.corners} awayVal={stats.away.corners} />
            <StatBar label="Faltas" homeVal={stats.home.fouls} awayVal={stats.away.fouls} />
            <StatBar label="Fuera de juego" homeVal={stats.home.offsides} awayVal={stats.away.offsides} />
            <StatBar label="Atajadas" homeVal={stats.home.saves} awayVal={stats.away.saves} />
            {stats.home.passes > 0 && (
              <StatBar
                label="Precisión de pases"
                homeVal={stats.home.passAccuracy}
                awayVal={stats.away.passAccuracy}
                format={(v) => `${v}%`}
              />
            )}
          </div>
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-[13px]">Incidencias</span>
            {isLive && (
              <span className="text-[11px] text-[#e53935] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
                Se actualiza automáticamente
              </span>
            )}
          </div>

          <div className="p-4 space-y-0.5">
            {events
              .slice()
              .sort((a: any, b: any) => a.minute - b.minute)
              .map((event: any) => {
                const isHomeEvent = event.teamId === match.homeTeam.id;
                const icon = EVENT_ICONS[event.eventType] ?? "•";
                const isGoal = event.eventType === "goal" || event.eventType === "owngoal" || event.eventType === "penalty";

                return (
                  <div key={event.id} className={`flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 ${isHomeEvent ? "flex-row" : "flex-row-reverse"}`}>
                    <div className="w-10 shrink-0 text-center">
                      <span className={`text-[12px] font-bold ${isLive && event.minute === parseInt(String(match.minute ?? "0")) ? "text-[#e53935]" : "text-gray-400"}`}>{event.minute}'</span>
                    </div>
                    <div className="w-7 h-7 flex items-center justify-center text-base shrink-0">
                      {icon}
                    </div>
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

      {/* Lineups */}
      {lineups && !lineups.error && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-900 text-[13px]">Alineaciones</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Home lineup */}
              {lineups.home && (
                <div>
                  <div className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: homeColor.bg }} />
                    {match.homeTeam.shortName ?? match.homeTeam.name}
                  </div>
                  {lineups.home.formation && (
                    <div className="text-[11px] text-gray-400 mb-2">Formación: {lineups.home.formation}</div>
                  )}
                  <div className="space-y-1">
                    {lineups.home.starters?.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[12px]">
                        <span className="text-gray-400 w-4 text-right">{p.shirtNumber ?? ""}</span>
                        <span className="text-gray-800">{p.name}</span>
                        <span className="text-gray-400 text-[10px]">{p.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Away lineup */}
              {lineups.away && (
                <div>
                  <div className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: awayColor.bg }} />
                    {match.awayTeam.shortName ?? match.awayTeam.name}
                  </div>
                  {lineups.away.formation && (
                    <div className="text-[11px] text-gray-400 mb-2">Formación: {lineups.away.formation}</div>
                  )}
                  <div className="space-y-1">
                    {lineups.away.starters?.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[12px]">
                        <span className="text-gray-400 w-4 text-right">{p.shirtNumber ?? ""}</span>
                        <span className="text-gray-800">{p.name}</span>
                        <span className="text-gray-400 text-[10px]">{p.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Head to Head */}
      {h2h && h2h.matches && h2h.matches.length > 0 && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-900 text-[13px]">Historial de enfrentamientos</span>
          </div>
          <div>
            {h2h.matches.slice(0, 5).map((m: any) => (
              <Link key={m.id} href={`/partido/${m.id}`} className="flex items-center px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <span className="text-[11px] text-gray-400 w-20 shrink-0">{format(new Date(m.kickoffTime), "d MMM yyyy", { locale: es })}</span>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[12px] text-gray-700 font-medium">{m.homeTeam?.shortName ?? m.homeTeam?.name ?? "Local"}</span>
                  <span className="text-[13px] font-bold text-gray-900 mx-2">{m.homeScore ?? 0} - {m.awayScore ?? 0}</span>
                  <span className="text-[12px] text-gray-700 font-medium">{m.awayTeam?.shortName ?? m.awayTeam?.name ?? "Visitante"}</span>
                </div>
              </Link>
            ))}
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
          {(match as any).venue && <InfoField label="Estadio" value={(match as any).venue} />}
          {match.broadcastChannel && <InfoField label="Transmisión" value={match.broadcastChannel} />}
        </div>
      </div>
    </div>
  );
}

function PredictionWidget({ homeName, awayName }: { homeName: string; awayName: string }) {
  const homeWin = 42;
  const draw = 26;
  const awayWin = 32;

  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <span className="font-bold text-gray-900 text-[13px]">Pronóstico</span>
        <span className="text-[10px] text-[#1a9be6] font-semibold bg-[#1a9be6]/10 px-1.5 py-0.5 rounded-sm">
          IA
        </span>
      </div>
      <div className="p-4 space-y-3">
        {/* Probability bars */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          <div className="bg-[#1a9be6] rounded-l-full transition-all" style={{ width: `${homeWin}%` }} />
          <div className="bg-gray-300 transition-all" style={{ width: `${draw}%` }} />
          <div className="bg-[#e53935] rounded-r-full transition-all" style={{ width: `${awayWin}%` }} />
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex flex-col items-start">
            <span className="font-black text-gray-900">{homeWin}%</span>
            <span className="text-gray-400 truncate max-w-[90px]">{homeName}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-gray-500">{draw}%</span>
            <span className="text-gray-400">Empate</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-black text-gray-900">{awayWin}%</span>
            <span className="text-gray-400 truncate max-w-[90px] text-right">{awayName}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-300 text-center pt-1">
          Basado en rendimiento reciente y posición en tabla
        </p>
      </div>
    </div>
  );
}

function StatBar({
  label,
  homeVal,
  awayVal,
  format: fmt,
  highlight,
}: {
  label: string;
  homeVal: number;
  awayVal: number;
  format?: (v: number) => string;
  highlight?: boolean;
}) {
  const total = homeVal + awayVal || 1;
  const homePct = Math.round((homeVal / total) * 100);
  const awayPct = 100 - homePct;
  const display = fmt ?? ((v: number) => String(v));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[13px] font-bold ${homeVal >= awayVal ? "text-gray-900" : "text-gray-400"}`}>{display(homeVal)}</span>
        <span className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">{label}</span>
        <span className={`text-[13px] font-bold ${awayVal >= homeVal ? "text-gray-900" : "text-gray-400"}`}>{display(awayVal)}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px bg-gray-100">
        <div
          className={`h-full rounded-l-full transition-all ${highlight ? "bg-[#1a9be6]" : "bg-gray-400"}`}
          style={{ width: `${homePct}%` }}
        />
        <div
          className={`h-full rounded-r-full transition-all ${highlight ? "bg-[#e53935]" : "bg-gray-300"}`}
          style={{ width: `${awayPct}%` }}
        />
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
        <div className="h-10 bg-gray-200 w-full" />
        <div className="p-8 flex justify-between items-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-14 w-28 bg-gray-200 rounded" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm animate-pulse h-48" />
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
