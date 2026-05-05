import { useParams, Link } from "wouter";
import { useGetTeam } from "@workspace/api-client-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight, MapPin, Calendar, Users, Trophy, User } from "lucide-react";
import { getTeamColor } from "@/utils/teamColors";

export default function TeamPage() {
  const params = useParams<{ id: string }>();
  const teamId = Number(params.id);
  const { data, isLoading, isError } = useGetTeam(teamId);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState />;

  const { team, recentMatches } = data;
  const color = getTeamColor(team.name);

  return (
    <div className="space-y-4">
      {/* Team header card */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          {/* Badge */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden border-2 border-white shadow"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {team.logoUrl
              ? <img src={team.logoUrl} className="w-full h-full object-contain" alt={team.name} />
              : (team.shortName ?? team.name).substring(0, 2).toUpperCase()
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-gray-900 leading-tight">{team.name}</h1>
            {team.shortName && <p className="text-sm text-gray-400 font-medium mt-0.5">{team.shortName}</p>}
            {team.description && (
              <p className="text-[13px] text-gray-600 mt-2 leading-relaxed line-clamp-3">{team.description}</p>
            )}
          </div>
        </div>

        {/* Meta fields */}
        <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
          {team.stadium && (
            <MetaField icon={<MapPin className="w-3.5 h-3.5" />} label="Estadio" value={team.stadium} />
          )}
          {team.city && (
            <MetaField icon={<MapPin className="w-3.5 h-3.5" />} label="Ciudad" value={`${team.city}${team.country ? `, ${team.country}` : ""}`} />
          )}
          {team.founded && (
            <MetaField icon={<Calendar className="w-3.5 h-3.5" />} label="Fundación" value={String(team.founded)} />
          )}
          {team.coach && (
            <MetaField icon={<User className="w-3.5 h-3.5" />} label="Entrenador" value={team.coach} />
          )}
        </div>
      </div>

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <span className="text-base">⚽</span>
            <span className="font-bold text-gray-900 text-[13px]">Partidos recientes</span>
          </div>
          <div>
            {recentMatches.slice(0, 12).map((match) => (
              <RecentMatchRow key={match.id} match={match} teamId={teamId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">{label}</div>
        <div className="text-[13px] text-gray-800 font-medium">{value}</div>
      </div>
    </div>
  );
}

function RecentMatchRow({ match, teamId }: { match: any; teamId: number }) {
  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const teamScore = isHome ? match.homeScore : match.awayScore;
  const opponentScore = isHome ? match.awayScore : match.homeScore;
  const opponentColor = getTeamColor(opponent.name);

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasScore = teamScore != null && opponentScore != null;

  let resultLabel = "";
  let resultClass = "text-gray-400";
  if (hasScore && isFinished) {
    if (teamScore > opponentScore) { resultLabel = "G"; resultClass = "text-emerald-600 font-bold"; }
    else if (teamScore < opponentScore) { resultLabel = "P"; resultClass = "text-red-500 font-bold"; }
    else { resultLabel = "E"; resultClass = "text-gray-500 font-bold"; }
  }

  const dateStr = isLive
    ? `${match.minute}'`
    : isFinished
    ? "FT"
    : format(new Date(match.kickoffTime), "dd MMM", { locale: es });

  return (
    <Link href={`/partido/${match.id}`}>
      <div className="flex items-center border-b border-gray-50 hover:bg-[#f8faff] transition-colors last:border-b-0 px-4 py-2.5 gap-3 cursor-pointer">
        {/* Date/status */}
        <div className="w-12 shrink-0 text-center">
          {isLive ? (
            <div className="flex items-center justify-center gap-1 text-[#e53935] font-bold text-[12px]">
              <span>{match.minute}'</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
            </div>
          ) : (
            <span className={`text-[12px] font-semibold ${isFinished ? "text-gray-400" : "text-gray-700"}`}>{dateStr}</span>
          )}
        </div>

        {/* vs */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[11px] text-gray-400 shrink-0">{isHome ? "vs" : "@"}</span>
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 overflow-hidden"
            style={{ backgroundColor: opponentColor.bg, color: opponentColor.text }}
          >
            {opponent.logoUrl
              ? <img src={opponent.logoUrl} className="w-full h-full object-contain" alt="" />
              : (opponent.shortName ?? opponent.name).substring(0, 2).toUpperCase()
            }
          </div>
          <span className="text-[13px] text-gray-700 font-medium truncate">{opponent.name}</span>
        </div>

        {/* Score + result */}
        <div className="flex items-center gap-2 shrink-0">
          {hasScore && (
            <span className="text-[13px] font-bold text-gray-800 tabular-nums">{teamScore} - {opponentScore}</span>
          )}
          {resultLabel && (
            <span className={`text-[12px] w-5 text-center ${resultClass}`}>{resultLabel}</span>
          )}
        </div>

        {/* Tournament */}
        <div className="hidden md:block shrink-0">
          <span className="text-[11px] text-gray-400 truncate max-w-[100px] block">{match.tournamentName}</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-5 animate-pulse">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-8 text-center">
      <p className="text-gray-400 text-sm">No se encontró el equipo</p>
      <Link href="/" className="text-[#1a9be6] text-sm mt-2 inline-block">Volver al inicio</Link>
    </div>
  );
}
