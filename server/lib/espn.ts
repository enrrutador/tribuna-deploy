/**
 * ESPN public API client (no key required).
 * Wraps site.api.espn.com endpoints with caching + typed responses.
 */

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
  "uefa.conference":          { slug: "conference-league",   name: "Conference League",      flag: "⭐", category: "destacados", country: "Europa" },
  // Argentina
  "arg.1":                    { slug: "liga-profesional",    name: "Liga Profesional",       flag: "🇦🇷", category: "argentina", country: "Argentina" },
  "arg.2":                    { slug: "primera-nacional",    name: "Primera Nacional",       flag: "🇦🇷", category: "argentina", country: "Argentina" },
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

export async function fetchLeagueMatches(leagueId: string, utcDateStr?: string): Promise<Match[]> {
  const cacheKey = `matches:${leagueId}:${utcDateStr ?? "week"}`;
  const cached = getCache<Match[]>(cacheKey);
  if (cached) return cached;

  const url = utcDateStr
    ? `${ESPN_SCOREBOARD}/${leagueId}/scoreboard?dates=${utcDateStr}`
    : `${ESPN_SCOREBOARD}/${leagueId}/scoreboard?dates=${getWeekRange()}`;

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
    setCache(cacheKey, matches, ttl);
    return matches;
  } catch (err) {
    console.error("[espn] fetchLeagueMatches failed", leagueId, err);
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

      groups.push({ name: groupName, entries: parsed });
    }

    setCache(cacheKey, groups, 5 * 60_000);
    return groups;
  } catch (err) {
    console.error("[espn] fetchStandings failed", leagueId, err);
    return [];
  }
}

export async function fetchScorers(leagueId: string): Promise<ScorerEntry[]> {
  const cacheKey = `scorers:${leagueId}`;
  const cached = getCache<ScorerEntry[]>(cacheKey);
  if (cached) return cached;

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

    setCache(cacheKey, scorers, 10 * 60_000);
    return scorers;
  } catch (err) {
    console.error("[espn] fetchScorers failed", leagueId, err);
    return [];
  }
}
