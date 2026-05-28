import { format } from "date-fns";
import { Star, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getTeamColor, getBroadcasterStyle } from "@/utils/teamColors";
import { useFavorites } from "@/hooks/useFavorites";

type Team = { id: string | number; name: string; logoUrl?: string | null; shortName?: string | null };
type Match = {
  id: string | number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number | null;
  awayScore?: number | null;
  kickoffTime: string;
  status: "upcoming" | "live" | "finished";
  minute?: string | number | null;
  tournamentId: string | number;
  tournamentName: string;
  round?: string | null;
  date: string;
  broadcastChannel?: string | null;
};
type Tournament = { id: string | number; name: string; slug: string; category: string; logoUrl?: string | null; flagEmoji?: string | null };
type Group = { tournament: Tournament; round?: string | null; matches: Match[] };

interface Props {
  group: Group;
  showLink?: boolean;
}

export default function MatchGroupCard({ group, showLink = true }: Props) {
  const hasLive = group.matches.some((m) => m.status === "live");
  return (
    <div className="bg-white rounded-sm overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">
            {group.tournament.flagEmoji ?? "⚽"}
          </span>
          {showLink ? (
            <Link href={`/torneo/${group.tournament.slug}`} className="font-bold text-gray-900 text-[13px] hover:text-[#1a9be6] transition-colors flex items-center gap-1">
              {group.tournament.name}
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          ) : (
            <span className="font-bold text-gray-900 text-[13px]">{group.tournament.name}</span>
          )}
          {hasLive && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#e53935] bg-red-50 px-1.5 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
              EN VIVO
            </span>
          )}
        </div>
        {group.round && (
          <span className="text-[12px] text-gray-500 font-medium border-l-2 border-gray-200 pl-2.5">{group.round}</span>
        )}
      </div>

      {/* Matches */}
      <div>
        {group.matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>

      {/* Footer link */}
      {showLink && (
        <div className="px-[72px] py-2.5 bg-white border-t border-gray-50">
          <Link href={`/torneo/${group.tournament.slug}`} className="text-[#1a9be6] text-[13px] font-medium hover:underline">
            Ver todo en {group.tournament.name}
          </Link>
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  const [, navigate] = useLocation();
  const { isTeamFavorite, toggleTeam } = useFavorites();
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasScore = match.homeScore != null && match.awayScore != null;
  const homeWins = hasScore && match.homeScore! > match.awayScore!;
  const awayWins = hasScore && match.awayScore! > match.homeScore!;
  const broadcaster = getBroadcasterStyle(match.broadcastChannel ?? null);

  const homeIsFav = isTeamFavorite(String(match.homeTeam.id));
  const awayIsFav = isTeamFavorite(String(match.awayTeam.id));
  const isFav = homeIsFav || awayIsFav;

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle the first non-favorite, or untoggle both if both are favorites
    if (!homeIsFav) {
      toggleTeam({ id: String(match.homeTeam.id), name: match.homeTeam.name, logoUrl: match.homeTeam.logoUrl });
    } else if (!awayIsFav) {
      toggleTeam({ id: String(match.awayTeam.id), name: match.awayTeam.name, logoUrl: match.awayTeam.logoUrl });
    } else {
      toggleTeam({ id: String(match.homeTeam.id), name: match.homeTeam.name, logoUrl: match.homeTeam.logoUrl });
    }
  };

  return (
    <div
      className={`flex items-center border-b border-gray-50 hover:bg-[#f8faff] transition-colors last:border-b-0 cursor-pointer group/row ${isLive ? "bg-red-50/40" : ""}`}
      onClick={() => navigate(`/partido/${match.id}`)}
    >
      {/* Time + broadcaster column */}
      <div className="w-[60px] shrink-0 flex flex-col items-center justify-center gap-1 py-3 border-r border-gray-100">
        {isLive ? (
          <div className="flex items-center gap-1 text-[#e53935] font-bold text-[13px]">
            <span>{match.minute}'</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
          </div>
        ) : isFinished ? (
          <span className="text-gray-400 font-semibold text-[12px]">FT</span>
        ) : (
          <span className="text-gray-700 font-semibold text-[13px]">{format(new Date(match.kickoffTime), "HH:mm")}</span>
        )}
        {broadcaster ? (
          <div
            className="text-[9px] font-bold px-1 py-0.5 rounded leading-none"
            style={{ backgroundColor: broadcaster.bg, color: broadcaster.text }}
          >
            {broadcaster.label}
          </div>
        ) : null}
      </div>

      {/* Teams + scores */}
      <div className="flex-1 flex flex-col py-2 px-3 gap-1.5">
        <TeamRow team={match.homeTeam} score={match.homeScore} isWinner={homeWins} hasScore={hasScore} />
        <TeamRow team={match.awayTeam} score={match.awayScore} isWinner={awayWins} hasScore={hasScore} />
      </div>

      {/* Favorite star */}
      <div className="w-10 shrink-0 flex justify-center">
        <button
          className={`transition-colors p-1 ${isFav ? "text-amber-400" : "text-gray-200 hover:text-amber-400"}`}
          onClick={handleFav}
          aria-label="Favorito"
          title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Star className={`w-4 h-4 ${isFav ? "fill-amber-400" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function TeamRow({ team, score, isWinner, hasScore }: { team: Team; score?: number | null; isWinner: boolean; hasScore: boolean }) {
  const color = getTeamColor(team.name);
  const [, navigate] = useLocation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden hover:ring-2 hover:ring-[#1a9be6] hover:ring-offset-1 transition-all cursor-pointer"
          style={{ backgroundColor: color.bg, color: color.text }}
          onClick={(e) => { e.stopPropagation(); navigate(`/equipo/${team.id}`); }}
        >
          {team.logoUrl
            ? <img src={team.logoUrl} className="w-full h-full object-contain" alt="" />
            : (team.shortName ?? team.name).substring(0, 2).toUpperCase()
          }
        </div>
        <span className={`text-[13px] ${isWinner ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
          {team.name}
        </span>
      </div>
      {hasScore && score != null && (
        <span className={`text-[15px] font-bold ml-4 w-5 text-center tabular-nums ${isWinner ? "text-gray-900" : "text-gray-400"}`}>
          {score}
        </span>
      )}
    </div>
  );
}
