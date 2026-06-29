import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "./api";
import type { MatchStatus, RoundInfo, TeamStatEntry } from "./types";

// ---------- Query keys ----------
export const qk = {
  tournaments: ["tournaments"] as const,
  tournament: (slug: string) => ["tournament", slug] as const,
  matches: (params?: { status?: MatchStatus; date?: string }) =>
    ["matches", params ?? {}] as const,
  today: ["matches", "today"] as const,
  live: ["matches", "live"] as const,
  match: (id: string) => ["match", id] as const,
  fixtures: (slug: string) => ["fixtures", slug] as const,
  standings: (slug: string) => ["standings", slug] as const,
  scorers: (slug: string) => ["scorers", slug] as const,
  rounds: (slug: string) => ["rounds", slug] as const,
  teamStats: (slug: string) => ["teamStats", slug] as const,
  team: (id: string) => ["team", id] as const,
};

// ---------- Tournaments ----------
export function useTournaments() {
  return useQuery({
    queryKey: qk.tournaments,
    queryFn: api.listTournaments,
    staleTime: 30 * 60_000, // 30 min
  });
}

export function useTournament(slug: string | undefined) {
  return useQuery({
    queryKey: qk.tournament(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.getTournament(slug!),
    staleTime: 30 * 60_000,
  });
}

// ---------- Matches ----------
export function useTodayMatches() {
  return useQuery({
    queryKey: qk.today,
    queryFn: api.getTodayMatches,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
}

export function useLiveMatches() {
  return useQuery({
    queryKey: qk.live,
    queryFn: api.getLiveMatches,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });
}

export function useMatches(
  params?: { status?: MatchStatus; date?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: qk.matches(params),
    enabled: options?.enabled ?? true,
    queryFn: () => api.listMatches(params),
    refetchInterval: params?.status === "live" ? 15_000 : 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: qk.match(id ?? ""),
    enabled: !!id,
    queryFn: () => api.getMatch(id!),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "live" ? 15_000 : false;
    },
  });
}

// ---------- Tournament detail ----------
export function useTournamentFixtures(slug: string | undefined) {
  return useQuery({
    queryKey: qk.fixtures(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.getTournamentFixtures(slug!),
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useTournamentStandings(slug: string | undefined) {
  return useQuery({
    queryKey: qk.standings(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.getTournamentStandings(slug!),
    staleTime: 5 * 60_000,
  });
}

export function useTournamentScorers(slug: string | undefined) {
  return useQuery({
    queryKey: qk.scorers(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.getTournamentScorers(slug!),
    staleTime: 10 * 60_000,
  });
}

export function useTournamentRounds(slug: string | undefined) {
  return useQuery({
    queryKey: qk.rounds(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.getTournamentRounds(slug!),
    staleTime: 10 * 60_000,
  });
}

export function useTournamentTeamStats(slug: string | undefined) {
  return useQuery({
    queryKey: qk.teamStats(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.getTournamentTeamStats(slug!),
    staleTime: 5 * 60_000,
  });
}

// ---------- Team ----------
export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: qk.team(id ?? ""),
    enabled: !!id,
    queryFn: () => api.getTeam(id!),
    staleTime: 10 * 60_000,
  });
}

// ---------- News ----------
export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: api.getNews,
    staleTime: 5 * 60_000,
  });
}
