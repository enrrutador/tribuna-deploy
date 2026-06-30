import type {
  MatchesResponse,
  MatchWithDetails,
  StandingsGroup,
  ScorerEntry,
  NewsItem,
  TournamentsResponse,
  TournamentInfo,
  MatchStatus,
  TeamDetail,
  RoundInfo,
  TeamStatEntry,
  MatchSummaryData,
  TeamScheduleEvent,
  BracketData,
  TrendingResponse,
  TrendingTopic,
} from "./types";

/** Base API URL — proxied to Express in dev, same-origin in prod. */
const BASE = import.meta.env.VITE_API_URL ?? "/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, (msg as { error?: string }).error ?? "Error de red");
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Tournaments
  listTournaments: () => request<TournamentsResponse>("/tournaments"),
  getTournament: (slug: string) => request<TournamentInfo>(`/tournaments/${slug}`),

  // Matches
  listMatches: (params?: { status?: MatchStatus; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.date) qs.set("date", params.date);
    const q = qs.toString();
    return request<MatchesResponse>(`/matches${q ? `?${q}` : ""}`);
  },
  getTodayMatches: () => request<MatchesResponse>("/matches/today"),
  getLiveMatches: () => request<MatchesResponse>("/matches/live"),
  getMatch: (id: string) => request<MatchWithDetails>(`/matches/${id}`),

  // Tournament detail
  getTournamentFixtures: (slug: string, round?: string) =>
    request<MatchesResponse>(`/tournaments/${slug}/fixtures${round ? `?round=${encodeURIComponent(round)}` : ""}`),
  getTournamentStandings: (slug: string) =>
    request<{ groups: StandingsGroup[] }>(`/tournaments/${slug}/standings`),
  getTournamentScorers: (slug: string) =>
    request<{ scorers: ScorerEntry[] }>(`/tournaments/${slug}/scorers`),
  getTournamentRounds: (slug: string) =>
    request<{ rounds: RoundInfo[] }>(`/tournaments/${slug}/rounds`),
  getTournamentTeamStats: (slug: string) =>
    request<{ stats: TeamStatEntry[] }>(`/tournaments/${slug}/team-stats`),

  // Teams
  getTeam: (id: string) => request<TeamDetail>(`/teams/${id}`),
  getTeamSchedule: (teamId: string, league?: string) =>
    request<{ schedule: TeamScheduleEvent[] }>(`/teams/${teamId}/schedule${league ? `?league=${league}` : ""}`),

  // Match Summary
  getMatchSummary: (id: string) =>
    request<MatchSummaryData>(`/matches/${id}/summary`),

  // Brackets
  getTournamentBrackets: (slug: string) =>
    request<BracketData>(`/tournaments/${slug}/brackets`),

  // News
  getNews: (category?: string) =>
    request<{ news: NewsItem[]; count: number }>(`/news${category ? `?category=${encodeURIComponent(category)}` : ""}`),

  // Trending
  getTrending: () => request<TrendingResponse>("/trending"),
  getTrendingTopic: (slug: string) => request<TrendingTopic>(`/trending/${slug}`),
};

export { ApiError };
