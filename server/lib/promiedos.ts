/**
 * Promiedos API client (no key required).
 * Wraps api.promiedos.com.ar endpoints with caching + typed responses.
 */

const PROMIEDOS_BASE = "https://api.promiedos.com.ar";
const PROMIEDOS_HEADERS = { "X-VER": "1.11.7.5" };

// ---------- Types ----------
interface PromiedosTeam {
  name: string;
  short_name: string;
  id: string;
  country_id: string;
  colors?: { color: string; text_color: string };
  goals?: { player_name: string }[];
  red_cards?: number;
}

interface PromiedosGame {
  id: string;
  stage_round_name?: string;
  date?: string;
  time?: string;
  status?: string;
  winner?: number;
  teams: PromiedosTeam[];
  score?: { local: number; visit: number };
}

interface PromiedosLeague {
  name: string;
  id: string;
  url_name: string;
  country_id: string;
  country_name: string;
  games: PromiedosGame[];
}

interface PromiedosResponse {
  leagues: PromiedosLeague[];
}

interface PromiedosStandingRow {
  num: number;
  values: { key: string; value: string | number }[];
}

interface PromiedosStandingTable {
  name: string;
  table: {
    rows: PromiedosStandingRow[];
    columns: { key: string; title: string }[];
  };
}

interface PromiedosTablesResponse {
  league: { name: string; id: string; url_name: string };
  tables_groups: { name: string; tables: PromiedosStandingTable[] }[];
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

// ---------- Fetch helper ----------
async function promiedosFetch(path: string): Promise<unknown> {
  const r = await fetch(`${PROMIEDOS_BASE}${path}`, {
    headers: { Accept: "application/json", ...PROMIEDOS_HEADERS },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Promiedos fetch failed: ${r.status}`);
  return r.json();
}

// ---------- League mapping ----------
export const PROMIEDOS_LEAGUE_MAP: Record<string, string> = {
  "arg.1": "hc",              // Liga Profesional
  "arg.2": "ebj",             // Primera Nacional
  "fifa.world": "fjda",       // Mundial
  "bra.1": "ea",              // Brasileirao
  "pm.federal-a": "ecae",     // Federal A
  "pm.primera-b": "ebm",     // Primera B Metropolitana
  "pm.primera-c": "ecm",     // Primera C Metropolitana
};

// ---------- Public API ----------

export type MatchStatus = "upcoming" | "live" | "finished";

export interface PromiedosMatch {
  id: string;
  leagueId: string;
  tournamentName: string;
  tournamentSlug: string;
  tournamentFlag: string;
  tournamentCategory: string;
  kickoffTime: string;
  status: MatchStatus;
  minute: string | null;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    abbreviation: string;
    logoUrl: string;
    color: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    abbreviation: string;
    logoUrl: string;
    color: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  round: string | null;
  broadcastChannel: string | null;
}

function mapStatus(status?: string, winner?: number): MatchStatus {
  if (!status) return "upcoming";
  const s = status.toLowerCase();
  if (s === "final" || s === "finished" || s === "ft") return "finished";
  if (s === "live" || s === "playing" || s === "1t" || s === "2t" || s === "et") return "live";
  return "upcoming";
}

function parseTeam(team: PromiedosTeam, index: number): PromiedosMatch["homeTeam"] {
  return {
    id: team.id || `pm-${index}`,
    name: team.name,
    shortName: team.short_name || team.name,
    abbreviation: (team.short_name || team.name).slice(0, 4).toUpperCase(),
    logoUrl: `https://img.promiedos.com.ar/${team.id}.png`,
    color: team.colors?.color?.replace("#", "") || "334155",
  };
}

function parseGame(game: PromiedosGame, leagueId: string, leagueName: string, leagueSlug: string, category: string, flag: string): PromiedosMatch {
  const teams = game.teams || [];
  const home = teams[0] ? parseTeam(teams[0], 0) : null;
  const away = teams[1] ? parseTeam(teams[1], 1) : null;
  const status = mapStatus(game.status, game.winner);

  // Build kickoff time
  let kickoffTime = new Date().toISOString();
  if (game.date && game.time) {
    kickoffTime = `${game.date}T${game.time}:00-03:00`; // Argentina timezone
  }

  return {
    id: `pm-${game.id}`,
    leagueId,
    tournamentName: leagueName,
    tournamentSlug: leagueSlug,
    tournamentFlag: flag,
    tournamentCategory: category,
    kickoffTime,
    status,
    minute: status === "live" ? game.status : null,
    homeTeam: home ?? { id: "?", name: "?", shortName: "?", abbreviation: "?", logoUrl: "", color: "334155" },
    awayTeam: away ?? { id: "?", name: "?", shortName: "?", abbreviation: "?", logoUrl: "", color: "334155" },
    homeScore: game.score?.local ?? null,
    awayScore: game.score?.visit ?? null,
    venue: null,
    round: game.stage_round_name ?? null,
    broadcastChannel: null,
  };
}

/**
 * Get matches for a specific date from Promiedos
 */
export async function fetchPromiedosMatchesByDate(
  date: string, // DD-MM-YYYY
  leagueId: string,
  leagueName: string,
  leagueSlug: string,
  category: string,
  flag: string,
): Promise<PromiedosMatch[]> {
  const cacheKey = `promiedos:${leagueId}:${date}`;
  const cached = getCache<PromiedosMatch[]>(cacheKey);
  if (cached) return cached;

  const promiedosId = PROMIEDOS_LEAGUE_MAP[leagueId];
  if (!promiedosId) return [];

  try {
    const data = (await promiedosFetch(`/games/${date}`)) as PromiedosResponse;
    const league = data.leagues?.find((l) => l.id === promiedosId);
    if (!league) return [];

    const matches = league.games.map((g) =>
      parseGame(g, leagueId, leagueName, leagueSlug, category, flag)
    );

    setCache(cacheKey, matches, 60_000); // 1 min cache for live data
    return matches;
  } catch (err) {
    console.error("[promiedos] fetchMatchesByDate failed", leagueId, date, err);
    return [];
  }
}

/**
 * Get today's matches for a specific league from Promiedos
 */
export async function fetchPromiedosToday(
  leagueId: string,
  leagueName: string,
  leagueSlug: string,
  category: string,
  flag: string,
): Promise<PromiedosMatch[]> {
  const now = new Date();
  // Argentina timezone is UTC-3
  const argDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const day = String(argDate.getUTCDate()).padStart(2, "0");
  const month = String(argDate.getUTCMonth() + 1).padStart(2, "0");
  const year = argDate.getUTCFullYear();
  const dateStr = `${day}-${month}-${year}`;

  return fetchPromiedosMatchesByDate(dateStr, leagueId, leagueName, leagueSlug, category, flag);
}

/**
 * Get ALL matches for a specific league from Promiedos (today's date)
 */
export async function fetchPromiedosLeague(
  leagueId: string,
): Promise<PromiedosMatch[]> {
  const leagueInfo = LEAGUES[leagueId as keyof typeof LEAGUES];
  if (!leagueInfo) return [];

  return fetchPromiedosToday(
    leagueId,
    leagueInfo.name,
    leagueInfo.slug,
    leagueInfo.category,
    leagueInfo.flag,
  );
}

/**
 * Get standings for a league from Promiedos
 */
export async function fetchPromiedosStandings(
  leagueId: string,
): Promise<{ name: string; entries: { position: number; teamId: string; teamName: string; teamShortName: string; teamLogoUrl: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDiff: string; points: number; form?: string[] }[] }[]> {
  const cacheKey = `promiedos:standings:${leagueId}`;
  const cached = getCache<ReturnType<typeof fetchPromiedosStandings> extends Promise<infer R> ? R : never>(cacheKey);
  if (cached) return cached;

  const promiedosId = PROMIEDOS_LEAGUE_MAP[leagueId];
  if (!promiedosId) return [];

  try {
    const data = (await promiedosFetch(`/league/tables_and_fixtures/${promiedosId}`)) as PromiedosTablesResponse;
    const groups: { name: string; entries: { position: number; teamId: string; teamName: string; teamShortName: string; teamLogoUrl: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDiff: string; points: number; form?: string[] }[] }[] = [];

    for (const tg of data.tables_groups ?? []) {
      for (const table of tg.tables ?? []) {
        const entries = table.table.rows.map((row) => {
          const getValue = (key: string) => {
            const v = row.values.find((v) => v.key === key);
            return v ? String(v.value) : "0";
          };
          const getTrend = () => {
            const v = row.values.find((v) => v.key === "{trend}");
            if (!v || !Array.isArray(v.value)) return [];
            return (v.value as number[]).map((n) => (n === 1 ? "W" : n === 0 ? "D" : "L"));
          };

          const goals = getValue("Goals"); // "19:7" format
          const [gf, ga] = goals.includes(":") ? goals.split(":").map(Number) : [0, 0];

          return {
            position: row.num,
            teamId: `pm-row-${row.num}`,
            teamName: getValue("Team") || `Equipo ${row.num}`,
            teamShortName: getValue("Team") || `Eq ${row.num}`,
            teamLogoUrl: "",
            played: Number(getValue("GamePlayed")) || 0,
            won: Number(getValue("GamesWon")) || 0,
            drawn: Number(getValue("GamesEven")) || 0,
            lost: Number(getValue("GamesLost")) || 0,
            goalsFor: gf,
            goalsAgainst: ga,
            goalDiff: getValue("Ratio") || "0",
            points: Number(getValue("Points")) || 0,
            form: getTrend(),
          };
        });

        groups.push({
          name: table.name || tg.name,
          entries,
        });
      }
    }

    setCache(cacheKey, groups, 5 * 60_000); // 5 min cache
    return groups;
  } catch (err) {
    console.error("[promiedos] fetchStandings failed", leagueId, err);
    return [];
  }
}
