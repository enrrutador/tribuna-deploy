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
  goals?: { player_name: string; time_to_display?: string }[];
  redCards?: number;
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
  winner?: number;
  gameTime?: number;
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

export interface RoundInfo {
  name: string;
  key: string;
  selected?: boolean;
}

export interface TeamStatEntry {
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
  goalDiff: number;
  points: number;
  winRate: number;
  goalsPerGame: number;
  concededPerGame: number;
  cleanSheets: number;
  form: string[];
}

export interface TeamMatch {
  date: string;
  homeAway: string;
  opponent: string;
  time?: string;
  result?: string;
  gameId?: string;
}

export interface TeamDetail {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  color: string;
  mainLeague: { name: string; id: string };
  info: { label: string; value: string }[];
  stadium: {
    name: string;
    capacity?: string;
    address?: string;
    city?: string;
    coordinates?: string;
  } | null;
  squad: {
    position: string;
    players: {
      name: string;
      shortName?: string;
      number?: string;
      age?: string;
      height?: string;
    }[];
  }[];
  nextMatches: TeamMatch[];
  lastMatches: TeamMatch[];
  topScorers: { name: string; goals: number }[];
}

// ========== Match Summary (expanded detail) ==========

export interface MatchSummaryEvent {
  id: string;
  type: string;
  typeText: string;
  minute: number;
  teamId: string;
  teamName: string;
  playerName: string | null;
  assistName: string | null;
  text: string;
}

export interface MatchSummaryRosterPlayer {
  athleteId: string;
  name: string;
  jerseyNumber: string | null;
  position: string | null;
  starter: boolean;
  stats: Record<string, number>;
}

export interface MatchSummaryRoster {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamLogoUrl: string;
  formation: string | null;
  players: MatchSummaryRosterPlayer[];
}

export interface MatchSummaryStats {
  name: string;
  home: string;
  away: string;
}

export interface HeadToHeadGame {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  result: string;
  competition: string;
}

export interface MatchSummaryBoxscore {
  home: { possession: string; shots: string; shotsOnTarget: string; passes: string; fouls: string; corners: string; offsides: string; yellowCards: string; redCards: string };
  away: { possession: string; shots: string; shotsOnTarget: string; passes: string; fouls: string; corners: string; offsides: string; yellowCards: string; redCards: string };
}

export interface MatchSummaryData {
  events: MatchSummaryEvent[];
  rosters: MatchSummaryRoster[];
  stats: MatchSummaryStats[];
  headToHead: HeadToHeadGame[];
  boxscore: MatchSummaryBoxscore | null;
}

// ========== Team Schedule ==========

export interface TeamScheduleEvent {
  id: string;
  date: string;
  name: string;
  homeTeam: string;
  homeTeamId: string;
  awayTeam: string;
  awayTeamId: string;
  venue: string | null;
  status: string;
  completed: boolean;
  score: string | null;
}

// ========== Trending ==========

export interface TrendingItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: "google_trends" | "google_news" | "youtube" | "reddit";
  publishedAt: string;
  publishedAgo: string | null;
  score: number;
  tags: string[];
  meta: Record<string, string>;
}

export interface TrendingTopic {
  slug: string;
  title: string;
  description: string;
  count: number;
  sources: string[];
  topItems: TrendingItem[];
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  items: TrendingItem[];
  lastUpdated: string;
}

// ========== Brackets (knockout rounds) ==========

export interface BracketTeam {
  name: string;
  shortName: string;
  symbolName: string;
  id: string;
  color: string;
  textColor: string;
}

export interface BracketMatch {
  id: string;
  homeTeam: BracketTeam;
  awayTeam: BracketTeam;
  status: "upcoming" | "live" | "finished";
  statusText: string;
  startTime: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: number;
}

export interface BracketStage {
  name: string;
  matches: BracketMatch[];
}

export interface BracketData {
  stages: BracketStage[];
}
