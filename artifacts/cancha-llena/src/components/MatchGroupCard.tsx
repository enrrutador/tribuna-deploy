import { format } from "date-fns";
import { Bell, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { getTeamColor, getBroadcasterStyle } from "@/utils/teamColors";

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
    <div className="bg-white rounded-sm overflow-hidden border border-gray-200">
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
        </div>
        {group.round && (
          <span className="text-[12px] text-gray-400 font-medium pl-3 border-l border-gray-200">{group.round}</span>
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
        <div className="border-t border-gray-100 px-4 py-2.5 bg-white">
          <Link href={`/torneo/${group.tournament.slug}`} className="text-[#1a9be6] text-[13px] font-semibold hover:underline">
            Ir a {group.tournament.name}
          </Link>
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasScore = match.homeScore != null && match.awayScore != null;
  const homeWins = hasScore && match.homeScore! > match.awayScore!;
  const awayWins = hasScore && match.awayScore! > match.homeScore!;
  const broadcaster = getBroadcasterStyle(match.broadcastChannel);

  return (
    <div className="flex items-center border-b border-gray-50 hover:bg-[#f8faff] transition-colors last:border-b-0 group/row">
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
        <TeamRow
          team={match.homeTeam}
          score={match.homeScore}
          isWinner={homeWins}
          hasScore={hasScore}
        />
        <TeamRow
          team={match.awayTeam}
          score={match.awayScore}
          isWinner={awayWins}
          hasScore={hasScore}
        />
      </div>

      {/* Bell */}
      <div className="w-10 shrink-0 flex justify-center">
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

function TeamRow({ team, score, isWinner, hasScore }: { team: Team; score?: number | null; isWinner: boolean; hasScore: boolean }) {
  const color = getTeamColor(team.name);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Colored team badge */}
        <div
          className="w-[20px] h-[20px] rounded-sm flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {team.logoUrl
            ? <img src={team.logoUrl} className="w-full h-full object-contain rounded-sm" alt="" />
            : (team.shortName ?? team.name).substring(0, 2).toUpperCase()
          }
        </div>
        <span className={`text-[13px] ${isWinner ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
          {team.name}
        </span>
      </div>
      {hasScore && score != null && (
        <span className={`text-[15px] font-bold ml-4 w-5 text-center ${isWinner ? "text-gray-900" : "text-gray-400"}`}>
          {score}
        </span>
      )}
    </div>
  );
}
