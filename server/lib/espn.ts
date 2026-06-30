/**
 * ESPN public API client (no key required).
 * Wraps site.api.espn.com endpoints with caching + typed responses.
 * Falls back to Promiedos API for Argentine leagues not covered by ESPN.
 */

import {
  fetchPromiedosToday as promiedosToday,
  fetchPromiedosWeek as promiedosWeek,
  promiedosWeekExtended,
  fetchPromiedosRound as promiedosRound,
  fetchPromiedosStandings as promiedosStandings,
  fetchPromiedosScorers as promiedosScorers,
  fetchPromiedosTeam as promiedosTeam,
  fetchPromiedosMatchesByDate as promiedosMatchesByDate,
  PROMIEDOS_LEAGUE_MAP,
  PROMIEDOS_BASE,
  PROMIEDOS_HEADERS,
  type PromiedosMatch,
  type StandingGroup,
  type ScorersGroup,
  type TeamInfo,
} from "./promiedos.js";

const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const ESPN_STANDINGS = "https://site.api.espn.com/apis/v2/sports/soccer";

// ---------- Leagues mapped to our domain ----------
export const LEAGUES = {
  // Destacados
  "fifa.world":               { slug: "mundial-2026",        name: "Mundial 2026",           flag: "🌍", category: "destacados", country: "Internacional" },
  "conmebol.libertadores":    { slug: "copa-libertadores",   name: "Copa Libertadores",      flag: "🏆", category: "destacados", country: "Sudamérica" },
  "conmebol.sudamericana":    { slug: "copa-sudamericana",   name: "Copa Sudamericana",      flag: "🏆", category: "destacados", country: "Sudamérica" },
  "fifa.worldq.conmebol":     { slug: "eliminatorias",       name: "Eliminatorias CONMEBOL", flag: "🌎", category: "destacados", country: "Sudamérica" },
  "uefa.champions":           { slug: "champions-league",    name: "Champions League",       flag: "⭐", category: "destacados", country: "Europa" },
  "uefa.europa":              { slug: "europa-league",       name: "Europa League",          flag: "⭐", category: "destacados", country: "Europa" },
  // Argentina
  "arg.1":                    { slug: "liga-profesional",    name: "Liga Profesional",       flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "arg.2":                    { slug: "primera-nacional",    name: "Primera Nacional",       flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "pm.federal-a":             { slug: "federal-a",           name: "Federal A",              flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "pm.primera-b":             { slug: "primera-b-metropolitana", name: "Primera B Metropolitana", flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "pm.primera-c":             { slug: "primera-c-metropolitana", name: "Primera C Metropolitana", flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "pm.promocional-amateur":   { slug: "torneo-promocional-amateur", name: "Torneo Promocional Amateur", flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "pm.liga-profesional-reserva": { slug: "liga-profesional-reserva", name: "Liga Profesional Reserva", flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "pm.campeonato-femenino":   { slug: "campeonato-femenino", name: "Campeonato Femenino", flag: "🇦🇷", category: "argentina", country: "Argentina" },
  // Sudamérica
  "bra.1":                    { slug: "brasileirao",         name: "Brasileirao",            flag: "🇧🇷", category: "sudamerica", country: "Brasil" },
  "uru.1":                    { slug: "uruguay-primera",     name: "Uruguay — Primera",      flag: "🇺🇾", category: "sudamerica", country: "Uruguay" },
  "chi.1":                    { slug: "chile-primera",       name: "Chile — Primera",        flag: "🇨🇱", category: "sudamerica", country: "Chile" },
  "col.1":                    { slug: "colombia-primera-a",  name: "Colombia — Primera A",   flag: "🇨🇴", category: "sudamerica", country: "Colombia" },
  "ecu.1":                    { slug: "ecuador-serie-a",     name: "Ecuador — Serie A",      flag: "🇪🇨", category: "sudamerica", country: "Ecuador" },
  "per.1":                    { slug: "peru-liga-1",         name: "Perú — Liga 1",          flag: "🇵🇪", category: "sudamerica", country: "Perú" },
  "par.1":                    { slug: "paraguay-primera",    name: "Paraguay — Primera",     flag: "🇵🇾", category: "sudamerica", country: "Paraguay" },
  "mex.1":                    { slug: "liga-mx",             name: "Liga MX",                flag: "🇲🇽", category: "sudamerica", country: "México" },
  // Mundo
  "eng.1":                    { slug: "premier-league",      name: "Premier League",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", category: "world", country: "Inglaterra" },
  "esp.1":                    { slug: "la-liga",              name: "La Liga",                flag: "🇪🇸", category: "world", country: "España" },
  "ger.1":                    { slug: "bundesliga",           name: "Bundesliga",             flag: "🇩🇪", category: "world", country: "Alemania" },
  "ita.1":                    { slug: "serie-a",              name: "Serie A",                flag: "🇮🇹", category: "world", country: "Italia" },
  "fra.1":                    { slug: "ligue-1",              name: "Ligue 1",                flag: "🇫🇷", category: "world", country: "Francia" },
  "ned.1":                    { slug: "eredivisie",           name: "Eredivisie",             flag: "🇳🇱", category: "world", country: "Países Bajos" },
  "por.1":                    { slug: "primeira-liga",        name: "Primeira Liga",          flag: "🇵🇹", category: "world", country: "Portugal" },
  "usa.1":                    { slug: "mls",                  name: "MLS",                    flag: "🇺🇸", category: "world", country: "Estados Unidos" },
} as const;

export type LeagueId = keyof typeof LEAGUES;
export type CategoryId = "destacados" | "argentina" | "sudamerica" | "world";

export const SLUG_TO_LEAGUE: Record<string, LeagueId> = Object.fromEntries(
  (Object.entries(LEAGUES) as [LeagueId, { slug: string }][]).map(([id, info]) => [info.slug, id])
);

// ---------- Types ----------
export type MatchStatus = "upcoming" | "live" | "finished";

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

export interface MatchEvent {
  id: string;
  type:
    | "goal"
    | "owngoal"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "penalty"
    | "penalty_miss"
    | "var_review";
  typeText: string;
  minute: number;
  teamId: string;
  teamName: string;
  playerName: string | null;
  assistName: string | null;
  text: string;
}

export interface MatchStats {
  home: Partial<Record<StatKey, number>>;
  away: Partial<Record<StatKey, number>>;
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

// ---------- Timezone helpers (ART = UTC-3, no DST) ----------
function toArgDate(utcIso: string): string {
  const ms = new Date(utcIso).getTime() - 3 * 60 * 60 * 1000;
  return new Date(ms).toISOString().split("T")[0]!;
}

function argToday(): string {
  return toArgDate(new Date().toISOString());
}

function artDateToUtcDates(artDate: string): [string, string] {
  const d1 = artDate.replace(/-/g, "");
  const next = new Date(artDate + "T12:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const d2 = next.toISOString().split("T")[0]!.replace(/-/g, "");
  return [d1, d2];
}

// ---------- Cache ----------
type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return undefined;
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function cacheStats() {
  let valid = 0;
  const now = Date.now();
  for (const e of cache.values()) if (e.expiresAt > now) valid++;
  return { entries: cache.size, valid };
}

// ---------- Fetch ----------
async function espnFetch(url: string): Promise<unknown> {
  const r = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Tribuna/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`ESPN fetch failed: ${r.status} ${url}`);
  return r.json();
}

function mapStatus(state: string, completed: boolean): MatchStatus {
  if (completed || state === "post") return "finished";
  if (state === "in") return "live";
  return "upcoming";
}

function parseTeam(c: Record<string, unknown>): TeamRef {
  const team = c.team as Record<string, unknown>;
  return {
    id: String(team.id ?? ""),
    name: String(team.displayName ?? team.name ?? ""),
    shortName: String(team.shortDisplayName ?? team.name ?? ""),
    abbreviation: String(team.abbreviation ?? ""),
    logoUrl: String(team.logo ?? ""),
    color: String(team.color ?? "cccccc"),
  };
}

const EVENT_TYPES: Record<string, MatchEvent["type"]> = {
  goal: "goal",
  yellowcard: "yellow_card",
  redcard: "red_card",
  substitution: "substitution",
  penalty: "penalty",
  owngoal: "owngoal",
  "penalty-miss": "penalty_miss",
  var: "var_review",
};

function parseEvent(ev: Record<string, unknown>): MatchEvent | null {
  const type = ev.type as Record<string, unknown>;
  const typeStr = String(type?.type ?? "");
  const mapped = EVENT_TYPES[typeStr];
  if (!mapped) return null;

  const clock = ev.clock as Record<string, unknown>;
  const team = ev.team as Record<string, unknown> | undefined;
  const participants = (ev.participants as Record<string, unknown>[]) ?? [];
  const scorer = participants[0]?.athlete as Record<string, unknown> | undefined;
  const assister = participants[1]?.athlete as Record<string, unknown> | undefined;

  const minuteStr = String(clock?.displayValue ?? "0");
  const minute = parseInt(minuteStr.replace(/\D/g, "")) || 0;

  return {
    id: String(ev.id ?? Math.random().toString(36).slice(2)),
    type: mapped,
    typeText: String(type?.text ?? typeStr),
    minute,
    teamId: String(team?.id ?? ""),
    teamName: String(team?.displayName ?? ""),
    playerName: scorer ? String(scorer.displayName ?? "") : null,
    assistName: assister ? String(assister.displayName ?? "") : null,
    text: String(ev.text ?? ev.shortText ?? ""),
  };
}

// ---------- Public API ----------

function getWeekRange(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 3);
  const end = new Date(now);
  end.setDate(end.getDate() + 4);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  return `${fmt(start)}-${fmt(end)}`;
}

export async function fetchLeagueMatches(leagueId: string, utcDateStr?: string, roundKey?: string): Promise<Match[]> {
  const cacheKey = `matches:${leagueId}:${roundKey ?? utcDateStr ?? "week"}`;
  const cached = getCache<Match[]>(cacheKey);
  if (cached) return cached;

  // Handle Promiedos-only leagues (start with "pm.")
  if (leagueId.startsWith("pm.") && PROMIEDOS_LEAGUE_MAP[leagueId]) {
    const leagueInfo = LEAGUES[leagueId as LeagueId];
    if (!leagueInfo) return [];

    // If a round key is provided, try to fetch that specific round from Promiedos
    if (roundKey && roundKey !== "latest") {
      const roundMatches = await promiedosRound(leagueId, roundKey);
      if (roundMatches.length > 0) {
        setCache(cacheKey, roundMatches, 60_000);
        return roundMatches;
      }
    }

    try {
      const promiedosMatches = await promiedosWeek(
        leagueId,
        leagueInfo.name,
        leagueInfo.slug,
        leagueInfo.category,
        leagueInfo.flag,
      );
      setCache(cacheKey, promiedosMatches, 60_000);
      return promiedosMatches;
    } catch (err) {
      console.error("[promiedos] fetchPromiedosWeek failed", leagueId, err);
      return [];
    }
  }

  // ESPN leagues - try ESPN first, fallback to Promiedos
  let url: string;
  if (utcDateStr) {
    url = `${ESPN_SCOREBOARD}/${leagueId}/scoreboard?dates=${utcDateStr}`;
  } else {
    // Try current week first, fallback to next upcoming matches
    const weekUrl = `${ESPN_SCOREBOARD}/${leagueId}/scoreboard?dates=${getWeekRange()}`;
    const weekData = (await espnFetch(weekUrl).catch(() => null)) as Record<string, unknown> | null;
    const weekEvents = (weekData?.events as Record<string, unknown>[]) ?? [];
    if (weekEvents.length > 0) {
      url = weekUrl;
    } else {
      // No matches this week, show next upcoming
      url = `${ESPN_SCOREBOARD}/${leagueId}/scoreboard`;
    }
  }

  try {
    const data = (await espnFetch(url)) as Record<string, unknown>;
    const leagueInfo = LEAGUES[leagueId as LeagueId];
    if (!leagueInfo) return [];

    const weekData = (data as Record<string, unknown>).week as Record<string, unknown> | undefined;
    const roundLabel = weekData?.text ? String(weekData.text) : null;

    const events = (data.events as Record<string, unknown>[]) ?? [];
    const matches: Match[] = events.map((ev) => {
      const comp = (ev.competitions as Record<string, unknown>[])?.[0] ?? {};
      const competitors = (comp.competitors as Record<string, unknown>[]) ?? [];
      const home = competitors.find((c) => c.homeAway === "home") ?? competitors[0] ?? {};
      const away = competitors.find((c) => c.homeAway === "away") ?? competitors[1] ?? {};
      const status = comp.status as Record<string, unknown>;
      const statusType = status?.type as Record<string, unknown>;
      const broadcasts = (comp.broadcasts as Record<string, unknown>[]) ?? [];
      const broadcastName = broadcasts[0]?.names ? ((broadcasts[0].names as string[])[0] ?? null) : null;
      const venue = comp.venue as Record<string, unknown> | undefined;
      const notes = (comp.notes as Record<string, unknown>[]) ?? [];
      const roundText = notes[0]?.text ? String(notes[0].text) : roundLabel;

      const state = String(statusType?.state ?? "pre");
      const completed = Boolean(statusType?.completed ?? false);
      const matchStatus = mapStatus(state, completed);

      const homeScore = home.score != null ? Number(home.score) : null;
      const awayScore = away.score != null ? Number(away.score) : null;

      return {
        id: String(ev.id),
        leagueId,
        tournamentName: leagueInfo.name,
        tournamentSlug: leagueInfo.slug,
        tournamentFlag: leagueInfo.flag,
        tournamentCategory: leagueInfo.category,
        kickoffTime: String(ev.date),
        status: matchStatus,
        minute: matchStatus === "live" ? String(statusType?.detail ?? statusType?.shortDetail ?? "") : null,
        homeTeam: parseTeam(home),
        awayTeam: parseTeam(away),
        homeScore: matchStatus !== "upcoming" ? homeScore : null,
        awayScore: matchStatus !== "upcoming" ? awayScore : null,
        venue: venue?.fullName ? String(venue.fullName) : null,
        round: roundText ?? null,
        broadcastChannel: broadcastName,
      };
    });

    const ttl = matches.some((m) => m.status === "live") ? 15_000 : 60_000;

    // Merge with Promiedos only for week view (no specific date)
    // This ensures multi-zone leagues show all matches, but doesn't slow down daily queries
    if (!utcDateStr && PROMIEDOS_LEAGUE_MAP[leagueId]) {
      const leagueInfo = LEAGUES[leagueId as LeagueId];
      if (leagueInfo) {
        try {
          const promiedosMatches = await promiedosWeekExtended(
            leagueId,
            leagueInfo.name,
            leagueInfo.slug,
            leagueInfo.category,
            leagueInfo.flag,
          );

          const normalize = (s: string) =>
            s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
          const normalizeBase = (s: string) => {
            const base = s.replace(/\s*\(.*?\)\s*/g, "").trim();
            return normalize(base);
          };

          // Enrich existing matches with round info from Promiedos
          const roundMap = new Map<string, string>();
          const addRoundSig = (h: string, a: string, round: string) => {
            roundMap.set(`${normalize(h)}|${normalize(a)}`, round);
            roundMap.set(`${normalize(a)}|${normalize(h)}`, round);
            roundMap.set(`${normalizeBase(h)}|${normalizeBase(a)}`, round);
            roundMap.set(`${normalizeBase(a)}|${normalizeBase(h)}`, round);
          };

          for (const pm of promiedosMatches) {
            if (pm.round) addRoundSig(pm.homeTeam.name, pm.awayTeam.name, pm.round);
          }

          // Find matches still missing round info → fetch their specific dates from Promiedos
          // Cap at 5 dates to avoid excessive API calls for large tournaments
          const missingDates = new Set<string>();
          for (const m of matches) {
            if (!m.round && m.kickoffTime) {
              const d = new Date(m.kickoffTime);
              const argD = new Date(d.getTime() - 3 * 60 * 60 * 1000);
              const dd = String(argD.getUTCDate()).padStart(2, "0");
              const mm = String(argD.getUTCMonth() + 1).padStart(2, "0");
              const yyyy = argD.getUTCFullYear();
              missingDates.add(`${dd}-${mm}-${yyyy}`);
              if (missingDates.size >= 5) break;
            }
          }

          // Fetch missing dates in parallel (max 5 concurrent)
          const dateArr = [...missingDates];
          for (let i = 0; i < dateArr.length; i += 5) {
            const batch = dateArr.slice(i, i + 5);
            const results = await Promise.allSettled(
              batch.map((dateStr) =>
                promiedosMatchesByDate(
                  dateStr, leagueId, leagueInfo.name, leagueInfo.slug, leagueInfo.category, leagueInfo.flag
                )
              )
            );
            for (const r of results) {
              if (r.status === "fulfilled") {
                for (const pm of r.value) {
                  if (pm.round) addRoundSig(pm.homeTeam.name, pm.awayTeam.name, pm.round);
                }
              }
            }
          }

          // Apply round enrichment
          for (const m of matches) {
            if (!m.round) {
              const sig = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`;
              const sigBase = `${normalizeBase(m.homeTeam.name)}|${normalizeBase(m.awayTeam.name)}`;
              const sigBaseRev = `${normalizeBase(m.awayTeam.name)}|${normalizeBase(m.homeTeam.name)}`;
              const inferred = roundMap.get(sig) ?? roundMap.get(sigBase) ?? roundMap.get(sigBaseRev);
              if (inferred) m.round = inferred;
            }
          }

          // Also add matches from Promiedos that don't exist in ESPN
          if (promiedosMatches.length > 0) {
            const existing = new Set(
              matches.map((m) => `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`),
            );
            for (const pm of promiedosMatches) {
              const sig = `${normalize(pm.homeTeam.name)}|${normalize(pm.awayTeam.name)}`;
              const sigReverse = `${normalize(pm.awayTeam.name)}|${normalize(pm.homeTeam.name)}`;
              if (!existing.has(sig) && !existing.has(sigReverse)) {
                matches.push(pm);
              }
            }
          }
        } catch (pe) {
          console.error("[promiedos] merge failed for", leagueId, pe);
        }
      }
    }

    setCache(cacheKey, matches, ttl);

    // If ESPN returned no matches and this league has a Promiedos mapping, fallback
    if (matches.length === 0 && PROMIEDOS_LEAGUE_MAP[leagueId]) {
      const leagueInfo = LEAGUES[leagueId as LeagueId];
      if (leagueInfo) {
        const promiedosMatches = await promiedosWeek(
          leagueId,
          leagueInfo.name,
          leagueInfo.slug,
          leagueInfo.category,
          leagueInfo.flag,
        );
        if (promiedosMatches.length > 0) {
          setCache(cacheKey, promiedosMatches, 60_000);
          return promiedosMatches;
        }
      }
    }

    return matches;
  } catch (err) {
    console.error("[espn] fetchLeagueMatches failed", leagueId, err);

    // Fallback to Promiedos on error
    if (PROMIEDOS_LEAGUE_MAP[leagueId]) {
      const leagueInfo = LEAGUES[leagueId as LeagueId];
      if (leagueInfo) {
        try {
          const promiedosMatches = await promiedosWeek(
            leagueId,
            leagueInfo.name,
            leagueInfo.slug,
            leagueInfo.category,
            leagueInfo.flag,
          );
          if (promiedosMatches.length > 0) return promiedosMatches;
        } catch (pe) {
          console.error("[promiedos] fallback also failed", leagueId, pe);
        }
      }
    }
    return [];
  }
}

export async function fetchMatchesForDate(artDate: string): Promise<Match[]> {
  const cacheKey = `day:${artDate}`;
  const cached = getCache<Match[]>(cacheKey);
  if (cached) return cached;

  const [d1, d2] = artDateToUtcDates(artDate);
  const leagueIds = Object.keys(LEAGUES);

  const results = await Promise.allSettled(
    leagueIds.flatMap((lid) => [fetchLeagueMatches(lid, d1), fetchLeagueMatches(lid, d2)])
  );

  const seen = new Set<string>();
  const all: Match[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const m of r.value) {
        if (!seen.has(m.id) && toArgDate(m.kickoffTime) === artDate) {
          seen.add(m.id);
          all.push(m);
        }
      }
    }
  }

  all.sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

  const isToday = artDate === argToday();
  const hasLive = all.some((m) => m.status === "live");
  const ttl = isToday ? (hasLive ? 15_000 : 30_000) : 5 * 60_000;
  setCache(cacheKey, all, ttl);
  return all;
}

export async function fetchTodayMatches(): Promise<Match[]> {
  return fetchMatchesForDate(argToday());
}

export async function fetchLiveMatches(): Promise<Match[]> {
  const all = await fetchTodayMatches();
  return all.filter((m) => m.status === "live");
}

export async function fetchMatchDetail(matchId: string, leagueId: string): Promise<Match | null> {
  // Try to find the match in today's or yesterday's data first
  const today = await fetchTodayMatches();
  const found = today.find((m) => m.id === matchId);
  if (found) return found;

  // Fallback: direct league fetch
  const leagueMatches = await fetchLeagueMatches(leagueId);
  return leagueMatches.find((m) => m.id === matchId) ?? null;
}

export async function fetchMatchEvents(matchId: string, leagueId: string): Promise<MatchEvent[]> {
  const cacheKey = `events:${matchId}`;
  const cached = getCache<MatchEvent[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = (await espnFetch(`${ESPN_SCOREBOARD}/${leagueId}/summary?event=${matchId}`)) as Record<string, unknown>;
    const keyEvents = (data.keyEvents as Record<string, unknown>[]) ?? [];
    const events = keyEvents.map(parseEvent).filter((e): e is MatchEvent => e !== null);
    setCache(cacheKey, events, 20_000);
    return events;
  } catch (err) {
    console.error("[espn] fetchMatchEvents failed", matchId, err);
    return [];
  }
}

export async function fetchMatchStats(matchId: string, leagueId: string): Promise<MatchStats | null> {
  const cacheKey = `stats:${leagueId}:${matchId}`;
  const cached = getCache<MatchStats | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = (await espnFetch(`${ESPN_SCOREBOARD}/${leagueId}/summary?event=${matchId}`)) as Record<string, unknown>;
    const teams = ((data.boxscore as Record<string, unknown>)?.teams as Record<string, unknown>[]) ?? [];
    if (teams.length < 2) {
      setCache(cacheKey, null, 60_000);
      return null;
    }

    const STAT_MAP: Record<string, StatKey> = {
      possessionPct: "possession",
      totalShots: "totalShots",
      shotsOnTarget: "shotsOnTarget",
      wonCorners: "corners",
      foulsCommitted: "fouls",
      yellowCards: "yellowCards",
      redCards: "redCards",
      offsides: "offsides",
      saves: "saves",
      accuratePasses: "passes",
      passPct: "passAccuracy",
    };

    const parseTeamStats = (team: Record<string, unknown>): MatchStats["home"] => {
      const stats = (team.statistics as Record<string, unknown>[]) ?? [];
      const out: Partial<Record<StatKey, number>> = {};
      for (const s of stats) {
        const name = String(s.name ?? "");
        const key = STAT_MAP[name];
        if (!key) continue;
        const value = s.value != null ? Number(s.value) : parseFloat(String(s.displayValue ?? "0")) || 0;
        out[key] = value;
      }
      return out;
    };

    const result: MatchStats = {
      home: parseTeamStats(teams[0]!),
      away: parseTeamStats(teams[1]!),
    };

    setCache(cacheKey, result, 30_000);
    return result;
  } catch (err) {
    console.error("[espn] fetchMatchStats failed", matchId, err);
    setCache(cacheKey, null, 60_000);
    return null;
  }
}

export async function fetchStandings(leagueId: string): Promise<StandingsGroup[]> {
  const cacheKey = `standings:${leagueId}`;
  const cached = getCache<StandingsGroup[]>(cacheKey);
  if (cached) return cached;

  // Promiedos-only leagues (start with "pm.") go directly to Promiedos
  if (leagueId.startsWith("pm.") && PROMIEDOS_LEAGUE_MAP[leagueId]) {
    try {
      const groups = await promiedosStandings(leagueId);
      if (groups.length > 0) {
        setCache(cacheKey, groups, 5 * 60_000);
        return groups;
      }
    } catch (err) {
      console.error("[promiedos] standings fallback failed", leagueId, err);
    }
    return [];
  }

  try {
    const data = (await espnFetch(`${ESPN_STANDINGS}/${leagueId}/standings`)) as Record<string, unknown>;
    const children = (data.children as Record<string, unknown>[]) ?? [data];
    const groups: StandingsGroup[] = [];

    for (const child of children) {
      const standings = child.standings as Record<string, unknown>;
      const entries = (standings?.entries as Record<string, unknown>[]) ?? [];
      if (entries.length === 0) continue;

      const groupName = String(child.name ?? standings?.name ?? "");

      const parsed: StandingEntry[] = entries.map((entry, idx) => {
        const team = entry.team as Record<string, unknown>;
        const logos = (team.logos as Record<string, unknown>[]) ?? [];
        const stats = (entry.stats as Record<string, unknown>[]) ?? [];
        const stat = (name: string) =>
          stats.find((s) => s.name === name || s.abbreviation === name) as Record<string, unknown> | undefined;

        return {
          position: idx + 1,
          teamId: String(team.id ?? ""),
          teamName: String(team.displayName ?? team.name ?? ""),
          teamShortName: String(team.shortDisplayName ?? team.name ?? ""),
          teamLogoUrl: String((logos[0] as Record<string, unknown>)?.href ?? ""),
          played: Number(stat("GP")?.value ?? stat("gamesPlayed")?.value ?? 0),
          won: Number(stat("W")?.value ?? stat("wins")?.value ?? 0),
          drawn: Number(stat("D")?.value ?? stat("ties")?.value ?? 0),
          lost: Number(stat("L")?.value ?? stat("losses")?.value ?? 0),
          goalsFor: Number(stat("F")?.value ?? stat("pointsFor")?.value ?? 0),
          goalsAgainst: Number(stat("A")?.value ?? stat("pointsAgainst")?.value ?? 0),
          goalDiff: String(stat("GD")?.displayValue ?? stat("pointDifferential")?.displayValue ?? "0"),
          points: Number(stat("P")?.value ?? stat("points")?.value ?? 0),
        };
      });

      // Sort by points desc, then goal difference desc, then goals for desc
      parsed.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = parseInt(a.goalDiff) || 0;
        const gdB = parseInt(b.goalDiff) || 0;
        if (gdB !== gdA) return gdB - gdA;
        return b.goalsFor - a.goalsFor;
      });
      // Re-assign positions after sort
      parsed.forEach((e, i) => { e.position = i + 1; });

      groups.push({ name: groupName, entries: parsed });
    }

    // Fallback to Promiedos if ESPN returns no data
    if (groups.length === 0 && PROMIEDOS_LEAGUE_MAP[leagueId]) {
      try {
        const promiedosGroups = await promiedosStandings(leagueId);
        if (promiedosGroups.length > 0) {
          setCache(cacheKey, promiedosGroups, 5 * 60_000);
          return promiedosGroups;
        }
      } catch (pe) {
        console.error("[promiedos] standings fallback failed", leagueId, pe);
      }
    }

    setCache(cacheKey, groups, 5 * 60_000);
    return groups;
  } catch (err) {
    console.error("[espn] fetchStandings failed", leagueId, err);

    // Fallback to Promiedos on error
    if (PROMIEDOS_LEAGUE_MAP[leagueId]) {
      try {
        const groups = await promiedosStandings(leagueId);
        if (groups.length > 0) return groups;
      } catch (pe) {
        console.error("[promiedos] standings fallback also failed", leagueId, pe);
      }
    }
    return [];
  }
}

export async function fetchScorers(leagueId: string): Promise<ScorerEntry[]> {
  const cacheKey = `scorers:${leagueId}`;
  const cached = getCache<ScorerEntry[]>(cacheKey);
  if (cached) return cached;

  // Promiedos-only leagues go directly to Promiedos
  if (leagueId.startsWith("pm.") && PROMIEDOS_LEAGUE_MAP[leagueId]) {
    try {
      const groups = await promiedosScorers(leagueId);
      const scorers = convertPromiedosScorers(groups);
      if (scorers.length > 0) {
        setCache(cacheKey, scorers, 10 * 60_000);
        return scorers;
      }
    } catch (err) {
      console.error("[promiedos] scorers fallback failed", leagueId, err);
    }
    return [];
  }

  try {
    const data = (await espnFetch(`${ESPN_SCOREBOARD}/${leagueId}/scoreboard`)) as Record<string, unknown>;
    const leagues = (data.leagues as Record<string, unknown>[]) ?? [];
    const league = leagues[0] ?? {};
    const leaders = (league.leaders as Record<string, unknown>[]) ?? [];

    const scorers: ScorerEntry[] = [];
    for (const cat of leaders) {
      const catName = String((cat as Record<string, unknown>).name ?? "");
      if (!catName.toLowerCase().includes("goal") && !catName.toLowerCase().includes("score")) continue;
      const entries = ((cat as Record<string, unknown>).leaders as Record<string, unknown>[]) ?? [];
      entries.forEach((entry, i) => {
        const athletes = (entry.athletes as Record<string, unknown>[]) ?? [];
        const athlete = athletes[0] ?? {};
        const team = (athlete.team as Record<string, unknown>) ?? {};
        const logos = (team.logos as Record<string, unknown>[]) ?? [];
        scorers.push({
          rank: i + 1,
          playerName: String((athlete.athlete as Record<string, unknown>)?.displayName ?? athlete.displayName ?? ""),
          teamId: String(team.id ?? ""),
          teamName: String(team.displayName ?? ""),
          teamLogoUrl: String((logos[0] as Record<string, unknown>)?.href ?? ""),
          goals: Number(entry.value ?? 0),
          assists: 0,
          played: 0,
        });
      });
      if (scorers.length > 0) break;
    }

    // Fallback to Promiedos if ESPN returns no data
    if (scorers.length === 0 && PROMIEDOS_LEAGUE_MAP[leagueId]) {
      try {
        const groups = await promiedosScorers(leagueId);
        const converted = convertPromiedosScorers(groups);
        if (converted.length > 0) {
          setCache(cacheKey, converted, 10 * 60_000);
          return converted;
        }
      } catch (pe) {
        console.error("[promiedos] scorers fallback failed", leagueId, pe);
      }
    }

    setCache(cacheKey, scorers, 10 * 60_000);
    return scorers;
  } catch (err) {
    console.error("[espn] fetchScorers failed", leagueId, err);

    // Fallback to Promiedos on error
    if (PROMIEDOS_LEAGUE_MAP[leagueId]) {
      try {
        const groups = await promiedosScorers(leagueId);
        const converted = convertPromiedosScorers(groups);
        if (converted.length > 0) return converted;
      } catch (pe) {
        console.error("[promiedos] scorers fallback also failed", leagueId, pe);
      }
    }
    return [];
  }
}

function convertPromiedosScorers(groups: ScorersGroup[]): ScorerEntry[] {
  const scorers: ScorerEntry[] = [];
  for (const g of groups) {
    if (g.name.toLowerCase() !== "goles") continue;
    for (const e of g.entries) {
      scorers.push({
        rank: e.position,
        playerName: e.name,
        teamId: e.teamId,
        teamName: e.teamName,
        teamLogoUrl: e.teamLogoUrl,
        goals: e.value,
        assists: 0,
        played: 0,
      });
    }
    break;
  }
  return scorers;
}

// ---------- Available rounds/fechas for a league ----------
export interface RoundInfo {
  name: string;
  key: string;
  selected?: boolean;
}

export async function fetchRounds(leagueId: string): Promise<RoundInfo[]> {
  const cacheKey = `rounds:${leagueId}`;
  const cached = getCache<RoundInfo[]>(cacheKey);
  if (cached) return cached;

  const promiedosId = PROMIEDOS_LEAGUE_MAP[leagueId];
  if (!promiedosId) return [];

  try {
    const res = await fetch(`${PROMIEDOS_BASE}/league/tables_and_fixtures/${promiedosId}`, {
      headers: { Accept: "application/json", ...PROMIEDOS_HEADERS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const filters = (data.games?.filters ?? []) as { name: string; key: string; selected?: boolean }[];
    const rounds = filters.map((f) => ({ name: f.name, key: f.key, selected: f.selected }));
    setCache(cacheKey, rounds, 10 * 60_000);
    return rounds;
  } catch (err) {
    console.error("[espn] fetchRounds failed", leagueId, err);
    return [];
  }
}

// ---------- Team statistics from standings ----------
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

export interface TeamStatsResponse {
  stats: TeamStatEntry[];
}

export async function fetchTeamStats(leagueId: string): Promise<TeamStatsResponse> {
  const cacheKey = `teamStats:${leagueId}`;
  const cached = getCache<TeamStatsResponse>(cacheKey);
  if (cached) return cached;

  const standings = await fetchStandings(leagueId);
  if (standings.length === 0) return { stats: [] };

  const allEntries = standings.flatMap((g) => g.entries);
  const stats: TeamStatEntry[] = allEntries.map((e) => ({
    teamId: e.teamId,
    teamName: e.teamName,
    teamShortName: e.teamShortName,
    teamLogoUrl: e.teamLogoUrl,
    played: e.played,
    won: e.won,
    drawn: e.drawn,
    lost: e.lost,
    goalsFor: e.goalsFor,
    goalsAgainst: e.goalsAgainst,
    goalDiff: e.goalsFor - e.goalsAgainst,
    points: e.points,
    winRate: e.played > 0 ? Math.round((e.won / e.played) * 100) : 0,
    goalsPerGame: e.played > 0 ? Number((e.goalsFor / e.played).toFixed(2)) : 0,
    concededPerGame: e.played > 0 ? Number((e.goalsAgainst / e.played).toFixed(2)) : 0,
    cleanSheets: 0,
    form: e.form ?? [],
  }));

  const result: TeamStatsResponse = { stats };
  setCache(cacheKey, result, 5 * 60_000);
  return result;
}

// ---------- Team name → Promiedos ID resolver ----------
// Hardcoded map of ESPN team IDs → Promiedos team IDs for Argentine football.
// This ensures team pages always show full Promiedos data.

const ESPN_TO_PROMIEDOS: Record<string, string> = {
  // Liga Profesional Argentina
  "9739": "hccd",    // Aldosivi
  "3": "ihb",        // Argentinos Juniors
  "9785": "gbfc",    // Atlético Tucumán
  "235": "ihi",      // Banfield
  "10060": "jafb",   // Barracas Central
  "4": "fhid",       // Belgrano
  "5": "igg",        // Boca Juniors
  "11989": "beafh",  // Central Córdoba SdE
  "8950": "hcbh",    // Defensa y Justicia
  "17702": "bbjea",  // Deportivo Riestra
  "8": "igh",        // Estudiantes de La Plata
  "19685": "bheaf",  // Estudiantes RC
  "9": "iia",        // Gimnasia La Plata
  "11972": "bbjbf",  // Gimnasia de Mendoza
  "10": "iie",       // Huracán
  "11": "ihe",       // Independiente
  "9744": "hcch",    // Independiente Rivadavia
  "2975": "hchc",    // Instituto
  "12": "igj",       // Lanús
  "14": "ihh",       // Newell's Old Boys
  "7764": "hcah",    // Platense
  "15": "ihg",       // Racing Club
  "16": "igi",       // River Plate
  "17": "ihf",       // Rosario Central
  "18": "igf",       // San Lorenzo
  "10158": "hbbh",   // Sarmiento
  "19": "jche",      // Talleres
  "7767": "iid",     // Tigre
  "20": "hcag",      // Unión
  "21": "ihc",       // Vélez

  // Primera Nacional
  "10145": "hbbi",   // Acassuso
  "13913": "bbjce",  // Agropecuario
  "9786": "hhij",    // All Boys
  "2": "hbag",       // Almagro
  "9740": "hbbc",    // Almirante Brown
  "10146": "hbae",   // Atlanta
  "9747": "fjgi",    // Atlético Rafaela
  "11993": "jiaj",   // Central Norte
  "6": "gbjg",       // Chacarita
  "11963": "bdiha",  // Chaco For Ever
  "21799": "ghjha",  // Ciudad de Bolívar
  "10149": "hbaf",   // Colegiales
  "7": "iha",        // Colón
  "10151": "hbid",   // Defensores de Belgrano
  "18260": "bbjbh",  // Deportivo Madryn
  "11978": "jcid",   // Deportivo Maipú
  "10154": "hbba",   // Deportivo Morón
  "17352": "hbbg",   // Estudiantes BA
  "9743": "hcbi",    // Ferro
  "5263": "iib",     // Gimnasia Jujuy
  "10743": "jchi",   // Gimnasia y Tiro
  "6756": "ihd",     // Godoy Cruz
  "18284": "cijej",  // Güemes
  "13": "hbai",      // Los Andes
  "10109": "bbjcj",  // Midland
  "11990": "bbjcd",  // Mitre SdE
  "236": "bcai",     // Nueva Chicago
  "10374": "iche",   // Patronato
  "2741": "hccf",    // Quilmes
  "19145": "jcih",   // Racing Córdoba
  "7845": "hcai",    // San Martín SJ
  "17814": "hchb",   // San Martín Tucumán
  "10058": "bbiji",  // San Miguel
  "10157": "hbbb",   // San Telmo
  "10162": "hbac",   // Temperley
  "10163": "hbbd",   // Tristán Suárez
};

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function resolvePromiedosTeamId(espnTeamId: string): Promise<string | null> {
  // Direct lookup in hardcoded map
  const direct = ESPN_TO_PROMIEDOS[espnTeamId];
  if (direct) return direct;

  // Fallback: get team name from ESPN and search name map
  const leagues = ["arg.1", "arg.2"];
  let teamName = "";
  for (const league of leagues) {
    try {
      const url = `${ESPN_SCOREBOARD}/${league}/teams/${espnTeamId}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.team?.displayName) {
        teamName = data.team.displayName;
        break;
      }
    } catch { /* continue */ }
  }
  if (!teamName) return null;

  const map = await buildTeamNameMap();
  const key = normalize(teamName);
  return map.get(key) ?? null;
}

async function buildTeamNameMap(): Promise<Map<string, string>> {
  if (teamNameMap) return teamNameMap;
  if (teamNameMapBuilding) {
    while (teamNameMapBuilding) await new Promise((r) => setTimeout(r, 100));
    return teamNameMap!;
  }
  teamNameMapBuilding = true;
  const map = new Map<string, string>();

  // Fetch games for today and yesterday to find teams
  const dates: string[] = [];
  for (let offset = 0; offset <= 1; offset++) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    dates.push(`${dd}-${mm}-${yyyy}`);
  }

  for (const dateStr of dates) {
    try {
      const res = await fetch(`${PROMIEDOS_BASE}/games/${dateStr}`, { headers: PROMIEDOS_HEADERS });
      if (!res.ok) continue;
      const data = await res.json();
      for (const league of data.leagues ?? []) {
        for (const game of league.games ?? []) {
          for (const team of game.teams ?? []) {
            if (team.id && team.name) {
              const key = team.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              if (!map.has(key)) map.set(key, team.id);
              if (team.short_name) {
                const skey = team.short_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (!map.has(skey)) map.set(skey, team.id);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(`[espn] Failed to build team map from games ${dateStr}`, e);
    }
  }

  teamNameMap = map;
  teamNameMapBuilding = false;
  console.log(`[espn] Built fallback team name map: ${map.size} entries`);
  return map;
}

let teamNameMap: Map<string, string> | null = null;
let teamNameMapBuilding = false;

/**
 * Fetch team data: always try to use Promiedos data.
 * - If ID is a Promiedos ID (alphanumeric), use directly
 * - If ID is numeric (ESPN), resolve to Promiedos ID first
 */
async function fetchTeamDataComposite(teamId: string): Promise<TeamInfo | null> {
  // Non-numeric IDs are likely Promiedos IDs — try directly
  if (!/^\d+$/.test(teamId)) {
    return promiedosTeam(teamId);
  }

  // Numeric ID = ESPN ID — resolve to Promiedos
  const promiedosId = await resolvePromiedosTeamId(teamId);
  if (promiedosId) {
    const result = await promiedosTeam(promiedosId);
    if (result) return result;
  }

  // Last resort: return basic info from ESPN
  try {
    const leagues = ["arg.1", "arg.2"];
    for (const league of leagues) {
      const url = `${ESPN_SCOREBOARD}/${league}/teams/${teamId}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const t = data?.team;
      if (!t) continue;
      return {
        id: t.id,
        name: t.displayName,
        shortName: t.shortDisplayName?.trim() || t.abbreviation,
        logoUrl: t.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${t.id}.png`,
        color: (t.color || "334155").replace("#", ""),
        mainLeague: { name: league === "arg.1" ? "Liga Profesional" : "Primera Nacional", id: league },
        info: [],
        stadium: null,
        squad: [],
        nextMatches: (t.nextEvent || []).map((e: any) => ({
          date: e.date ? new Date(e.date).toLocaleDateString("es-AR") : "",
          homeAway: "",
          opponent: e.shortName || "",
          time: e.date ? new Date(e.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "",
        })),
        lastMatches: [],
        topScorers: [],
      };
    }
  } catch { /* ignore */ }
  return null;
}

// Pre-build the map on startup
buildTeamNameMap().catch(() => {});

// ========== MATCH SUMMARY (ESPN /summary) ==========

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

export interface MatchSummaryRoster {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamLogoUrl: string;
  formation: string | null;
  players: {
    athleteId: string;
    name: string;
    jerseyNumber: string | null;
    position: string | null;
    starter: boolean;
    stats: Record<string, number>;
  }[];
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

export interface MatchSummaryData {
  events: MatchSummaryEvent[];
  rosters: MatchSummaryRoster[];
  stats: MatchSummaryStats[];
  headToHead: HeadToHeadGame[];
  boxscore: {
    home: { possession: string; shots: string; shotsOnTarget: string; passes: string; fouls: string; corners: string; offsides: string; yellowCards: string; redCards: string };
    away: { possession: string; shots: string; shotsOnTarget: string; passes: string; fouls: string; corners: string; offsides: string; yellowCards: string; redCards: string };
  } | null;
}

export async function fetchMatchSummary(matchId: string, leagueId: string): Promise<MatchSummaryData | null> {
  const cacheKey = `summary:${matchId}:${leagueId}`;
  const cached = getCache<MatchSummaryData>(cacheKey);
  if (cached) return cached;

  try {
    const data = (await espnFetch(`${ESPN_SCOREBOARD}/${leagueId}/summary?event=${matchId}`)) as Record<string, unknown>;

    // Key events (goals, cards, subs)
    const keyEvents = (data.keyEvents as Record<string, unknown>[]) ?? [];
    const events: MatchSummaryEvent[] = keyEvents.map((ev) => {
      const type = ev.type as Record<string, unknown>;
      const team = ev.team as Record<string, unknown>;
      const athletes = (ev.athletes as Record<string, unknown>[]) ?? [];
      const scorer = athletes[0]?.athlete as Record<string, unknown> | undefined;
      const assister = athletes[1]?.athlete as Record<string, unknown> | undefined;
      const clock = ev.clock as Record<string, unknown>;
      const minuteStr = String(clock?.displayValue ?? "0");
      const minute = parseInt(minuteStr.replace(/\D/g, "")) || 0;
      return {
        id: String(ev.id ?? Math.random().toString(36).slice(2)),
        type: String(type?.type ?? ""),
        typeText: String(type?.text ?? ""),
        minute,
        teamId: String(team?.id ?? ""),
        teamName: String(team?.displayName ?? ""),
        playerName: scorer ? String(scorer.displayName ?? "") : null,
        assistName: assister ? String(assister.displayName ?? "") : null,
        text: String(ev.text ?? ev.shortText ?? ""),
      };
    });

    // Rosters (lineups)
    const boxscore = data.boxscore as Record<string, unknown> | undefined;
    const teams = (boxscore?.teams as Record<string, unknown>[]) ?? [];
    const rosters: MatchSummaryRoster[] = [];
    const rostersData = (data.rosters as Record<string, unknown>[]) ?? [];

    for (const roster of rostersData) {
      const teamInfo = roster.team as Record<string, unknown>;
      const rosterEntries = (roster.roster as Record<string, unknown>[]) ?? [];
      rosters.push({
        teamId: String(teamInfo?.id ?? ""),
        teamName: String(teamInfo?.displayName ?? ""),
        teamShortName: String(teamInfo?.shortDisplayName ?? ""),
        teamLogoUrl: String((teamInfo?.logos as Record<string, unknown>[])?.[0]?.href ?? ""),
        formation: null,
        players: rosterEntries.map((p) => {
          const athlete = p.athlete as Record<string, unknown>;
          const stats = (p.stats as Record<string, unknown>[]) ?? [];
          const statsMap: Record<string, number> = {};
          for (const s of stats) {
            statsMap[String(s.name ?? "")] = Number(s.value ?? 0);
          }
          return {
            athleteId: String(athlete?.id ?? ""),
            name: String(athlete?.displayName ?? ""),
            jerseyNumber: athlete?.jersey ? String(athlete.jersey) : null,
            position: athlete?.position?.displayName ? String(athlete.position.displayName) : null,
            starter: Boolean(p.starter),
            stats: statsMap,
          };
        }),
      });
    }

    // Team stats
    const teamStats: MatchSummaryStats[] = [];
    for (const t of teams) {
      const statsArr = (t.statistics as Record<string, unknown>[]) ?? [];
      for (const s of statsArr) {
        const name = String(s.name ?? s.abbreviation ?? "");
        const displayValue = String(s.displayValue ?? s.value ?? "");
        const existing = teamStats.find((ts) => ts.name === name);
        if (existing) {
          existing.away = displayValue;
        } else {
          teamStats.push({ name, home: displayValue, away: "" });
        }
      }
    }

    // Head to head
    const h2hData = (data.headToHeadGames as Record<string, unknown>[]) ?? [];
    const headToHead: HeadToHeadGame[] = [];
    for (const entry of h2hData) {
      const events = (entry.events as Record<string, unknown>[]) ?? [];
      for (const ev of events) {
        headToHead.push({
          id: String(ev.id ?? ""),
          date: String(ev.gameDate ?? ""),
          homeTeam: String(entry.team?.displayName ?? ""),
          awayTeam: String(ev.opponent?.displayName ?? ""),
          homeScore: Number(ev.homeTeamScore ?? 0),
          awayScore: Number(ev.awayTeamScore ?? 0),
          result: String(ev.gameResult ?? ""),
          competition: String(ev.competitionName ?? ""),
        });
      }
    }

    // Boxscore summary
    let boxscoreSummary: MatchSummaryData["boxscore"] = null;
    if (teams.length >= 2) {
      const homeTeam = teams.find((t) => (t as Record<string, unknown>).homeAway === "home") ?? teams[0];
      const awayTeam = teams.find((t) => (t as Record<string, unknown>).homeAway === "away") ?? teams[1];
      const getStat = (team: Record<string, unknown>, name: string): string => {
        const stats = (team.statistics as Record<string, unknown>[]) ?? [];
        const found = stats.find((s) => String(s.name ?? "") === name);
        return String(found?.displayValue ?? found?.value ?? "0");
      };
      boxscoreSummary = {
        home: {
          possession: getStat(homeTeam as Record<string, unknown>, "possession"),
          shots: getStat(homeTeam as Record<string, unknown>, "totalShots"),
          shotsOnTarget: getStat(homeTeam as Record<string, unknown>, "shotsOnTarget"),
          passes: getStat(homeTeam as Record<string, unknown>, "passes"),
          fouls: getStat(homeTeam as Record<string, unknown>, "fouls"),
          corners: getStat(homeTeam as Record<string, unknown>, "corners"),
          offsides: getStat(homeTeam as Record<string, unknown>, "offsides"),
          yellowCards: getStat(homeTeam as Record<string, unknown>, "yellowCards"),
          redCards: getStat(homeTeam as Record<string, unknown>, "redCards"),
        },
        away: {
          possession: getStat(awayTeam as Record<string, unknown>, "possession"),
          shots: getStat(awayTeam as Record<string, unknown>, "totalShots"),
          shotsOnTarget: getStat(awayTeam as Record<string, unknown>, "shotsOnTarget"),
          passes: getStat(awayTeam as Record<string, unknown>, "passes"),
          fouls: getStat(awayTeam as Record<string, unknown>, "fouls"),
          corners: getStat(awayTeam as Record<string, unknown>, "corners"),
          offsides: getStat(awayTeam as Record<string, unknown>, "offsides"),
          yellowCards: getStat(awayTeam as Record<string, unknown>, "yellowCards"),
          redCards: getStat(awayTeam as Record<string, unknown>, "redCards"),
        },
      };
    }

    const result: MatchSummaryData = { events, rosters, stats: teamStats, headToHead, boxscore: boxscoreSummary };
    setCache(cacheKey, result, 5 * 60_000);
    return result;
  } catch (err) {
    console.error("[espn] fetchMatchSummary failed", matchId, leagueId, err);
    return null;
  }
}

// ========== TEAM SCHEDULE ==========

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

export async function fetchTeamSchedule(teamId: string, leagueId: string): Promise<TeamScheduleEvent[]> {
  const cacheKey = `schedule:${teamId}:${leagueId}`;
  const cached = getCache<TeamScheduleEvent[]>(cacheKey);
  if (cached) return cached;

  const year = new Date().getFullYear();
  try {
    const data = (await espnFetch(`${ESPN_SCOREBOARD}/${leagueId}/teams/${teamId}/schedule?season=${year}`)) as Record<string, unknown>;
    const events = (data.events as Record<string, unknown>[]) ?? [];
    const result: TeamScheduleEvent[] = events.map((ev) => {
      const comp = (ev.competitions as Record<string, unknown>[])?.[0] ?? {};
      const competitors = (comp.competitors as Record<string, unknown>[]) ?? [];
      const home = competitors.find((c) => c.homeAway === "home") ?? competitors[0] ?? {};
      const away = competitors.find((c) => c.homeAway === "away") ?? competitors[1] ?? {};
      const status = comp.status as Record<string, unknown>;
      const statusType = status?.type as Record<string, unknown>;
      return {
        id: String(ev.id ?? ""),
        date: String(ev.date ?? ""),
        name: String(ev.name ?? ""),
        homeTeam: String((home as Record<string, unknown>)?.team?.displayName ?? ""),
        homeTeamId: String((home as Record<string, unknown>)?.team?.id ?? ""),
        awayTeam: String((away as Record<string, unknown>)?.team?.displayName ?? ""),
        awayTeamId: String((away as Record<string, unknown>)?.team?.id ?? ""),
        venue: comp.venue?.fullName ? String(comp.venue.fullName) : null,
        status: String(statusType?.state ?? "pre"),
        completed: Boolean(statusType?.completed ?? false),
        score: statusType?.completed ? `${home.score ?? 0} - ${away.score ?? 0}` : null,
      };
    });
    setCache(cacheKey, result, 10 * 60_000);
    return result;
  } catch (err) {
    console.error("[espn] fetchTeamSchedule failed", teamId, leagueId, err);
    return [];
  }
}

export { fetchTeamDataComposite as fetchTeamData };
export type { TeamInfo } from "./promiedos.js";
