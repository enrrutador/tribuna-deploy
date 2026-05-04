import { format } from "date-fns";
import { Bell, ChevronRight } from "lucide-react";
import { Link } from "wouter";

type Team = { id: number; name: string; logoUrl?: string | null; shortName?: string | null };
type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number | null;
  awayScore?: number | null;
  kickoffTime: string;
  status: "upcoming" | "live" | "finished";
  minute?: number | null;
  tournamentId: number;
  tournamentName: string;
  round?: string | null;
  date: string;
  broadcastChannel?: string | null;
};
type Tournament = { id: number; name: string; slug: string; category: string; logoUrl?: string | null; flagEmoji?: string | null };
type Group = { tournament: Tournament; round?: string | null; matches: Match[] };

interface Props {
  group: Group;
  showLink?: boolean;
}

export default function MatchGroupCard({ group, showLink = true }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-[#f8f8f8] px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            {group.tournament.logoUrl ? (
              <img src={group.tournament.logoUrl} alt={group.tournament.name} className="w-6 h-6 object-contain" />
            ) : group.tournament.flagEmoji ? (
              <span className="text-lg leading-none">{group.tournament.flagEmoji}</span>
            ) : (
              <div className="w-5 h-5 bg-gray-300 rounded-full" />
            )}
          </div>
          {showLink ? (
            <Link href={`/torneo/${group.tournament.slug}`} className="font-bold text-gray-900 hover:text-[#1a9be6] transition-colors flex items-center gap-1">
              {group.tournament.name}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ) : (
            <span className="font-bold text-gray-900">{group.tournament.name}</span>
          )}
        </div>
        {group.round && <span className="text-sm text-gray-500 font-medium">{group.round}</span>}
      </div>

      {/* Matches */}
      <div className="divide-y">
        {group.matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>

      {/* Footer link */}
      {showLink && (
        <Link href={`/torneo/${group.tournament.slug}`} className="block bg-white border-t px-4 py-3 text-center text-[#1a9be6] text-sm font-bold hover:bg-gray-50 transition-colors uppercase tracking-wide">
          Ir a {group.tournament.name} <ChevronRight className="w-4 h-4 inline-block" />
        </Link>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const homeWin = isFinished && match.homeScore != null && match.awayScore != null && match.homeScore > match.awayScore;
  const awayWin = isFinished && match.homeScore != null && match.awayScore != null && match.awayScore > match.homeScore;

  return (
    <div className="flex items-center p-3 hover:bg-gray-50 transition-colors group/match cursor-pointer">
      {/* Time/Status */}
      <div className="w-16 shrink-0 text-sm flex flex-col items-center justify-center border-r mr-3 pr-3 border-gray-100 gap-0.5">
        {isLive ? (
          <div className="flex items-center gap-1 text-[#e53935] font-bold">
            <span>{match.minute}'</span>
            <span className="w-2 h-2 rounded-full bg-[#e53935] animate-pulse" />
          </div>
        ) : isFinished ? (
          <span className="text-gray-400 font-medium text-xs">FT</span>
        ) : (
          <span className="text-gray-500 font-medium">{format(new Date(match.kickoffTime), "HH:mm")}</span>
        )}
        {match.broadcastChannel && (
          <span className="text-[10px] text-gray-400 truncate max-w-[56px] text-center">{match.broadcastChannel}</span>
        )}
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-col gap-1.5">
        {/* Home */}
        <div className="flex justify-between items-center pr-2">
          <div className="flex items-center gap-2.5">
            <TeamBadge team={match.homeTeam} />
            <span className={`text-sm font-medium ${homeWin ? "text-gray-900 font-semibold" : "text-gray-600"}`}>
              {match.homeTeam.name}
            </span>
          </div>
          {match.homeScore != null && (
            <span className={`font-bold text-base w-6 text-center ${homeWin ? "text-gray-900" : "text-gray-500"}`}>
              {match.homeScore}
            </span>
          )}
        </div>
        {/* Away */}
        <div className="flex justify-between items-center pr-2">
          <div className="flex items-center gap-2.5">
            <TeamBadge team={match.awayTeam} />
            <span className={`text-sm font-medium ${awayWin ? "text-gray-900 font-semibold" : "text-gray-600"}`}>
              {match.awayTeam.name}
            </span>
          </div>
          {match.awayScore != null && (
            <span className={`font-bold text-base w-6 text-center ${awayWin ? "text-gray-900" : "text-gray-500"}`}>
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Bell */}
      <div className="w-10 shrink-0 flex justify-end">
        <button
          className="text-gray-300 hover:text-[#1a9be6] transition-colors p-1"
          onClick={(e) => e.stopPropagation()}
          aria-label="Agendar"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TeamBadge({ team }: { team: Team }) {
  if (team.logoUrl) return <img src={team.logoUrl} alt={team.name} className="w-5 h-5 object-contain" />;
  return (
    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
      {team.name.charAt(0)}
    </div>
  );
}
