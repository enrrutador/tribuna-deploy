/** Shared domain types — mirror of the server domain types. */

export type MatchStatus = "upcoming" | "live" | "finished";
export type CategoryId = "destacados" | "argentina" | "sudamerica" | "world";

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logoUrl: string;
  color: string;
}

export interface Match {
  id: string;
  leagueId: string;
  tournamentName: string;
  tournamentSlug: string;
  tournamentFlag: string;
  tournamentCategory: CategoryId;
  kickoffTime: string;
  status: MatchStatus;
  minute: string | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  round: string | null;
  broadcastChannel: string | null;
}

export type MatchEventType =
  | "goal"
  | "owngoal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "penalty"
  | "penalty_miss"
  | "var_review";

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  typeText: string;
  minute: number;
  teamId: string;
  teamName: string;
  playerName: string | null;
  assistName: string | null;
  text: string;
}

export type StatKey =
  | "possession"
  | "totalShots"
  | "shotsOnTarget"
  | "corners"
  | "fouls"
  | "yellowCards"
  | "redCards"
  | "offsides"
  | "saves"
  | "passes"
  | "passAccuracy";

export interface MatchStats {
  home: Partial<Record<StatKey, number>>;
  away: Partial<Record<StatKey, number>>;
}

export interface MatchWithDetails extends Match {
  events: MatchEvent[];
  stats: MatchStats | null;
}

export interface StandingEntry {
  position: number;
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamLogoUrl: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: string;
  points: number;
  form?: string[];
}

export interface StandingsGroup {
  name: string;
  entries: StandingEntry[];
}

export interface ScorerEntry {
  rank: number;
  playerName: string;
  teamId: string;
  teamName: string;
  teamLogoUrl: string;
  goals: number;
  assists: number;
  played: number;
}

export interface MatchGroup {
  tournament: {
    id: string;
    name: string;
    slug: string;
    category: CategoryId;
    flag: string;
  };
  round: string | null;
  matches: Match[];
}

export interface MatchesResponse {
  groups: MatchGroup[];
  totalMatches: number;
  liveCount: number;
  finishedCount: number;
  upcomingCount: number;
}

export interface TournamentInfo {
  id: string;
  slug: string;
  name: string;
  flag: string;
  category: CategoryId;
  country: string;
}

export interface TournamentCategoryGroup {
  id: string;
  slug: string;
  name: string;
  flag: string;
  category: CategoryId;
  country: string;
}

export type TournamentsResponse = Record<CategoryId, TournamentCategoryGroup[]>;

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  summary: string;
  imageUrl: string | null;
  imageCredit: string | null;
  publishedAt: string;
  publishedAgo: string | null;
  source: string;
  url: string;
  category: "mundial" | "argentina" | "general";
}
