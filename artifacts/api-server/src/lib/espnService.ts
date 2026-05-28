import { logger } from "./logger";

// ESPN public API — no key required
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const ESPN_STANDINGS = "https://site.api.espn.com/apis/v2/sports/soccer";

// Leagues mapped to our tournament slugs
export const ESPN_LEAGUES: Record<string, { slug: string; name: string; flag: string; category: "destacados" | "argentina" | "sudamerica" | "world" }> = {
  // Destacados
  "conmebol.libertadores":    { slug: "copa-libertadores",    name: "Copa Libertadores",      flag: "🏆", category: "destacados" },
  "conmebol.sudamericana":    { slug: "copa-sudamericana",    name: "Copa Sudamericana",      flag: "🏆", category: "destacados" },
  "fifa.worldq.conmebol":     { slug: "eliminatorias",        name: "Eliminatorias CONMEBOL", flag: "🌎", category: "destacados" },
  "fifa.world":               { slug: "mundial-2026",         name: "Mundial 2026",           flag: "🌍", category: "destacados" },
  "uefa.champions":           { slug: "champions-league",     name: "Champions League",       flag: "⭐", category: "destacados" },
  "uefa.europa":              { slug: "europa-league",        name: "Europa League",          flag: "⭐", category: "destacados" },
  "uefa.conference":          { slug: "conference-league",    name: "Conference League",      flag: "⭐", category: "destacados" },
  // Argentina
  "arg.1":                    { slug: "liga-profesional",     name: "Liga Profesional",       flag: "🇦🇷", category: "argentina" },
  "arg.copa":                 { slug: "copa-argentina",       name: "Copa Argentina",         flag: "🇦🇷", category: "argentina" },
  "arg.2":                    { slug: "primera-nacional",     name: "Primera Nacional",       flag: "🇦🇷", category: "argentina" },
  // Sudamérica
  "uru.1":                    { slug: "uruguay-primera",      name: "Uruguay - Primera",      flag: "🇺🇾", category: "sudamerica" },
  "chi.1":                    { slug: "chile-primera",        name: "Chile - Primera",        flag: "🇨🇱", category: "sudamerica" },
  "col.1":                    { slug: "colombia-primera-a",   name: "Colombia - Primera A",   flag: "🇨🇴", category: "sudamerica" },
  "bol.1":                    { slug: "bolivia-primera",      name: "Bolivia - División Prof.", flag: "🇧🇴", category: "sudamerica" },
  "par.1":                    { slug: "paraguay-primera",     name: "Paraguay - División Pro.", flag: "🇵🇾", category: "sudamerica" },
  "ecu.1":                    { slug: "ecuador-serie-a",      name: "Ecuador - Serie A",      flag: "🇪🇨", category: "sudamerica" },
  "per.1":                    { slug: "peru-liga-1",          name: "Perú - Liga 1",          flag: "🇵🇪", category: "sudamerica" },
  "ven.1":                    { slug: "venezuela-primera",    name: "Venezuela - Primera",    flag: "🇻🇪", category: "sudamerica" },
  "mex.1":                    { slug: "liga-mx",              name: "Liga MX",                flag: "🇲🇽", category: "sudamerica" },
  "usa.1":                    { slug: "mls",                  name: "MLS",                    flag: "🇺🇸", category: "sudamerica" },
  // Europa / Mundo
  "eng.1":                    { slug: "premier-league",       name: "Premier League",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", category: "world" },
  "esp.1":                    { slug: "la-liga",              name: "La Liga",                flag: "🇪🇸", category: "world" },
  "ger.1":                    { slug: "bundesliga",           name: "Bundesliga",             flag: "🇩🇪", category: "world" },
  "ita.1":                    { slug: "serie-a",              name: "Serie A",                flag: "🇮🇹", category: "world" },
  "fra.1":                    { slug: "ligue-1",              name: "Ligue 1",                flag: "🇫🇷", category: "world" },
  "ned.1":                    { slug: "eredivisie",           name: "Eredivisie",             flag: "🇳🇱", category: "world" },
  "por.1":                    { slug: "primeira-liga",        name: "Primeira Liga",          flag: "🇵🇹", category: "world" },
};

// Slug → leagueId lookup
export const SLUG_TO_LEAGUE = Object.fromEntries(
  Object.entries(ESPN_LEAGUES).map(([leagueId, info]) => [info.slug, leagueId])
);

// ---- Types ----

export type EspnMatch = {
  id: string;
  leagueId: string;
  tournamentName: string;
  tournamentSlug: string;
  tournamentFlag: string;
  tournamentCategory: string;
  kickoffTime: string;
  status: "upcoming" | "live" | "finished";
  minute: string | null;
  homeTeam: EspnTeam;
  awayTeam: EspnTeam;
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  round: string | null;
  broadcastChannel: string | null;
};

export type EspnTeam = {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logoUrl: string;
  color: string;
};

export type EspnEvent = {
  id: string;
  type: string;
  typeText: string;
  minute: string;
  teamId: string;
  teamName: string;
  playerName: string | null;
  assistName: string | null;
  text: string;
};

// ---- Argentina timezone helpers (ART = UTC-3, no DST) ----

/** Convert a UTC ISO string to Argentine date string (YYYY-MM-DD) */
function toArgDate(utcIso: string): string {
  const ms = new Date(utcIso).getTime() - 3 * 60 * 60 * 1000;
  return new Date(ms).toISOString().split("T")[0]!;
}

/** Today's date in Argentine timezone (YYYY-MM-DD) */
function argToday(): string {
  return toArgDate(new Date().toISOString());
}

/**
 * Given an Argentine date (YYYY-MM-DD), return the two UTC dates (YYYYMMDD)
 * that cover it — since ART = UTC-3, a full ART day spans two UTC calendar days.
 */
function artDateToUtcDates(artDate: string): [string, string] {
  const d1 = artDate.replace(/-/g, "");
  const next = new Date(artDate + "T12:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const d2 = next.toISOString().split("T")[0]!.replace(/-/g, "");
  return [d1, d2];
}

// ---- In-memory cache ----

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

// ---- Fetch helpers ----

async function espnFetch(url: string): Promise<unknown> {
  const r = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`ESPN fetch failed: ${r.status} ${url}`);
  return r.json();
}

function mapStatus(state: string, completed: boolean): "upcoming" | "live" | "finished" {
  if (completed || state === "post") return "finished";
  if (state === "in") return "live";
  return "upcoming";
}

function parseTeam(competitor: Record<string, unknown>): EspnTeam {
  const team = competitor.team as Record<string, unknown>;
  return {
    id: String(team.id ?? ""),
    name: String(team.displayName ?? team.name ?? ""),
    shortName: String(team.shortDisplayName ?? team.name ?? ""),
    abbreviation: String(team.abbreviation ?? ""),
    logoUrl: String(team.logo ?? ""),
    color: String(team.color ?? "cccccc"),
  };
}

function parseEvent(ev: Record<string, unknown>): EspnEvent | null {
  const type = ev.type as Record<string, unknown>;
  const typeStr = String(type?.type ?? "");
  const supportedTypes: Record<string, string> = {
    goal: "goal",
    yellowcard: "yellow_card",
    redcard: "red_card",
    substitution: "substitution",
    penalty: "penalty",
    owngoal: "owngoal",
    var: "var_review",
  };
  if (!supportedTypes[typeStr]) return null;

  const clock = ev.clock as Record<string, unknown>;
  const team = ev.team as Record<string, unknown> | undefined;
  const participants = (ev.participants as Record<string, unknown>[] | undefined) ?? [];
  const scorer = participants[0]?.athlete as Record<string, unknown> | undefined;
  const assister = participants[1]?.athlete as Record<string, unknown> | undefined;

  return {
    id: String(ev.id ?? Math.random()),
    type: supportedTypes[typeStr]!,
    typeText: String(type?.text ?? typeStr),
    minute: String(clock?.displayValue ?? ""),
    teamId: String(team?.id ?? ""),
    teamName: String(team?.displayName ?? ""),
    playerName: scorer ? String(scorer.displayName ?? "") : null,
    assistName: assister ? String(assister.displayName ?? "") : null,
    text: String(ev.text ?? ev.shortText ?? ""),
  };
}

// ---- Public API ----

/** Fetch all matches for a league from ESPN scoreboard.
 *  @param utcDateStr — optional YYYYMMDD string; if provided fetches ?dates=YYYYMMDD
 */
export async function fetchLeagueMatches(leagueId: string, utcDateStr?: string): Promise<EspnMatch[]> {
  const cacheKey = `matches:${leagueId}:${utcDateStr ?? "current"}`;
  const cached = getCache<EspnMatch[]>(cacheKey);
  if (cached) return cached;

  const url = utcDateStr
    ? `${ESPN_BASE}/${leagueId}/scoreboard?dates=${utcDateStr}`
    : `${ESPN_BASE}/${leagueId}/scoreboard`;

  try {
    const data = await espnFetch(url) as Record<string, unknown>;
    const leagueInfo = ESPN_LEAGUES[leagueId];
    if (!leagueInfo) return [];

    const seasonData = data.season as Record<string, unknown> | undefined;
    const weekData = (data as Record<string, unknown>).week as Record<string, unknown> | undefined;
    const roundLabel = weekData?.text ? String(weekData.text) : null;

    const events = (data.events as Record<string, unknown>[]) ?? [];
    const matches: EspnMatch[] = events.map((ev) => {
      const comp = (ev.competitions as Record<string, unknown>[])?.[0] ?? {};
      const competitors = (comp.competitors as Record<string, unknown>[]) ?? [];
      const home = competitors.find((c) => c.homeAway === "home") ?? competitors[0] ?? {};
      const away = competitors.find((c) => c.homeAway === "away") ?? competitors[1] ?? {};
      const status = comp.status as Record<string, unknown>;
      const statusType = status?.type as Record<string, unknown>;
      const broadcasts = (comp.broadcasts as Record<string, unknown>[]) ?? [];
      const broadcastName = broadcasts[0]?.names ? (broadcasts[0].names as string[])[0] ?? null : null;
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
    setCache(cacheKey, matches, ttl);
    return matches;
  } catch (err) {
    logger.error({ err, leagueId }, "ESPN fetch failed for league");
    return [];
  }
}

/**
 * Fetch all matches across all leagues for a given Argentine date (YYYY-MM-DD).
 * Queries ESPN with both UTC dates that cover that ART day and deduplicates.
 */
export async function fetchMatchesForDate(artDate: string): Promise<EspnMatch[]> {
  const cacheKey = `day:${artDate}`;
  const cached = getCache<EspnMatch[]>(cacheKey);
  if (cached) return cached;

  const [utcD1, utcD2] = artDateToUtcDates(artDate);
  const leagueIds = Object.keys(ESPN_LEAGUES);

  // Fetch each league for both UTC dates in parallel
  const results = await Promise.allSettled(
    leagueIds.flatMap((lid) => [
      fetchLeagueMatches(lid, utcD1),
      fetchLeagueMatches(lid, utcD2),
    ])
  );

  const seen = new Set<string>();
  const all: EspnMatch[] = [];
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

/** Fetch today's matches (in Argentine timezone) across all leagues */
export async function fetchTodayMatches(): Promise<EspnMatch[]> {
  return fetchMatchesForDate(argToday());
}

/** Fetch match events (goals, cards) from ESPN summary */
export async function fetchMatchEvents(matchId: string, leagueId: string): Promise<EspnEvent[]> {
  const cacheKey = `events:${matchId}`;
  const cached = getCache<EspnEvent[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await espnFetch(`${ESPN_BASE}/${leagueId}/summary?event=${matchId}`) as Record<string, unknown>;
    const keyEvents = (data.keyEvents as Record<string, unknown>[]) ?? [];
    const events = keyEvents.map(parseEvent).filter(Boolean) as EspnEvent[];
    setCache(cacheKey, events, 20_000);
    return events;
  } catch (err) {
    logger.error({ err, matchId }, "ESPN summary fetch failed");
    return [];
  }
}

export type StandingEntry = {
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
};

export type StandingsGroup = {
  name: string;
  entries: StandingEntry[];
};

/** Fetch standings for a league — returns grouped structure (1 group = flat table, n groups = group stage) */
export async function fetchStandings(leagueId: string): Promise<StandingsGroup[]> {
  const cacheKey = `standings:${leagueId}`;
  const cached = getCache<StandingsGroup[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await espnFetch(`${ESPN_STANDINGS}/${leagueId}/standings`) as Record<string, unknown>;
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
        const stat = (name: string) => stats.find((s) => (s as Record<string, unknown>).name === name || (s as Record<string, unknown>).abbreviation === name) as Record<string, unknown> | undefined;

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

      groups.push({ name: groupName, entries: parsed });
    }

    setCache(cacheKey, groups, 5 * 60_000);
    return groups;
  } catch (err) {
    logger.error({ err, leagueId }, "ESPN standings fetch failed");
    return [];
  }
}

/** Fetch top scorers using ESPN stats endpoint */
export type ScorerEntry = {
  rank: number;
  playerName: string;
  teamId: string;
  teamName: string;
  teamLogoUrl: string;
  goals: number;
  assists: number;
  played: number;
};

export type MatchStats = {
  home: {
    possession: number;
    totalShots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    offsides: number;
    saves: number;
    passes: number;
    passAccuracy: number;
  };
  away: {
    possession: number;
    totalShots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    offsides: number;
    saves: number;
    passes: number;
    passAccuracy: number;
  };
};

/** Fetch match statistics from ESPN summary endpoint */
export async function fetchMatchStats(eventId: string, leagueId: string): Promise<MatchStats | null> {
  const cacheKey = `stats:${leagueId}:${eventId}`;
  const cached = getCache<MatchStats | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await espnFetch(`${ESPN_BASE}/${leagueId}/summary?event=${eventId}`) as Record<string, unknown>;
    const teams = ((data.boxscore as Record<string, unknown>)?.teams as Record<string, unknown>[]) ?? [];
    if (teams.length < 2) {
      setCache(cacheKey, null, 60_000);
      return null;
    }

    const parseStat = (team: Record<string, unknown>, name: string) => {
      const stats = (team.statistics as Record<string, unknown>[]) ?? [];
      const s = stats.find((x) => (x as Record<string, unknown>).name === name) as Record<string, unknown> | undefined;
      // ESPN stats have displayValue as string, value may be undefined
      return Number(s?.value ?? (s?.displayValue != null ? parseFloat(String(s.displayValue)) : 0));
    };

    const home = teams[0]!;
    const away = teams[1]!;

    const result: MatchStats = {
      home: {
        possession: parseStat(home, "possessionPct"),
        totalShots: parseStat(home, "totalShots"),
        shotsOnTarget: parseStat(home, "shotsOnTarget"),
        corners: parseStat(home, "wonCorners"),
        fouls: parseStat(home, "foulsCommitted"),
        yellowCards: parseStat(home, "yellowCards"),
        redCards: parseStat(home, "redCards"),
        offsides: parseStat(home, "offsides"),
        saves: parseStat(home, "saves"),
        passes: parseStat(home, "accuratePasses"),
        passAccuracy: Math.round(parseStat(home, "passPct") * 100),
      },
      away: {
        possession: parseStat(away, "possessionPct"),
        totalShots: parseStat(away, "totalShots"),
        shotsOnTarget: parseStat(away, "shotsOnTarget"),
        corners: parseStat(away, "wonCorners"),
        fouls: parseStat(away, "foulsCommitted"),
        yellowCards: parseStat(away, "yellowCards"),
        redCards: parseStat(away, "redCards"),
        offsides: parseStat(away, "offsides"),
        saves: parseStat(away, "saves"),
        passes: parseStat(away, "accuratePasses"),
        passAccuracy: Math.round(parseStat(away, "passPct") * 100),
      },
    };

    setCache(cacheKey, result, 30_000);
    return result;
  } catch (err) {
    logger.error({ err, eventId, leagueId }, "ESPN match stats fetch failed");
    setCache(cacheKey, null, 60_000);
    return null;
  }
}

export async function fetchScorers(leagueId: string): Promise<ScorerEntry[]> {
  const cacheKey = `scorers:${leagueId}`;
  const cached = getCache<ScorerEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    // ESPN scoreboard has a leaders section per event; use the season leaders endpoint
    const data = await espnFetch(`${ESPN_BASE}/${leagueId}/scoreboard`) as Record<string, unknown>;
    // Try to extract season leaders from scoreboard leagues data
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

    setCache(cacheKey, scorers, 10 * 60_000);
    return scorers;
  } catch (err) {
    logger.error({ err, leagueId }, "ESPN scorers fetch failed");
    return [];
  }
}
