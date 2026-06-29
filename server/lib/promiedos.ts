/**
 * Promiedos API client (no key required).
 * Wraps api.promiedos.com.ar endpoints with caching + typed responses.
 *
 * Available data:
 *  - Matches by date (/games/{DD-MM-YYYY})
 *  - Standings + fixtures (/league/tables_and_fixtures/{id})
 *  - Player statistics (goleadores, asistencias, tarjetas)
 *  - Team info, squad, stadium (/team/{team_id})
 */

export const PROMIEDOS_BASE = "https://api.promiedos.com.ar";
export const PROMIEDOS_HEADERS = { "X-VER": "1.11.7.5" };

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
  start_time?: string; // "DD-MM-YYYY HH:MM"
  status?: string | { enum?: number; name?: string; short_name?: string };
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
  entity?: {
    type: number;
    object: {
      name: string;
      short_name?: string;
      url_name?: string;
      id?: string;
      colors?: { color: string; text_color: string };
    };
  };
}

interface PromiedosStandingTable {
  name: string;
  table: {
    rows: PromiedosStandingRow[];
    columns: { key: string; title: string }[];
  };
}

interface PromiedosPlayerRow {
  num: number;
  entity?: {
    type: number;
    object: {
      name: string;
      sname?: string;
      short_name?: string;
      position?: string;
      age?: string;
      height?: string;
      weight?: string;
      team_id?: string;
      birthdate?: string;
      num?: string;
    };
  };
  values: { key: string; value: string | number }[];
}

interface PromiedosTablesResponse {
  league: { name: string; id: string; url_name: string };
  tables_groups: { name: string; tables: PromiedosStandingTable[] }[];
  players_statistics?: {
    preview_rows_num: number;
    tables: {
      name: string;
      columns: { key: string; title: string }[];
      rows: PromiedosPlayerRow[];
    }[];
  };
}

interface PromiedosTeamData {
  competitor: {
    name: string;
    short_name: string;
    url_name: string;
    id: string;
    country_id: string;
    colors?: { color: string; text_color: string };
  };
  main_league: {
    name: string;
    id: string;
    url_name: string;
    country_id: string;
  };
  team_info?: { name: string; value: string }[];
  stadium?: {
    name: string;
    coordinates?: string;
    info?: { name: string; value: string }[];
  };
  squad?: {
    columns: { name: string; key: string }[];
    groups: {
      name: string;
      rows: {
        values: { key: string; value: string }[];
        entity?: {
          type: number;
          object: {
            name: string;
            short_name?: string;
            id?: string;
            url_name?: string;
            num?: string;
            position?: string;
            age?: string;
            height?: string;
            birthdate?: string;
          };
        };
      }[];
    }[];
  };
  games?: {
    next?: { name: string; rows: { num: number; values: { key: string; value: string }[]; entity?: { type: number; object: PromiedosTeam }; game?: { id: string } }[] };
    last?: { name: string; rows: { num: number; result_status?: number; values: { key: string; value: string }[]; entity?: { type: number; object: PromiedosTeam }; game?: { id: string } }[] };
  };
  stats?: {
    preview_rows_num: number;
    filters: {
      name: string;
      key: string;
      selected?: boolean;
      tables: {
        name: string;
        columns: { key: string; title: string }[];
        rows: PromiedosPlayerRow[];
      }[];
    }[];
  };
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
  "pm.federal-a": "fahi",     // Federal A
  "pm.primera-b": "fahh",    // Primera B Metropolitana
  "pm.primera-c": "ffjb",    // Primera C Metropolitana
  "pm.promocional-amateur": "iage", // Torneo Promocional Amateur
  "pm.liga-profesional-reserva": "hhbc", // Liga Profesional Reserva
  "pm.campeonato-femenino": "gcce", // Campeonato Femenino
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

  // Normalize status: can be string or object
  let statusStr: string | undefined;
  let statusLabel: string | null = null;
  if (typeof game.status === "string") {
    statusStr = game.status;
  } else if (game.status && typeof game.status === "object") {
    statusStr = game.status.name ?? game.status.short_name;
    statusLabel = statusStr ?? null;
  }

  const status = mapStatus(statusStr, game.winner);

  // Build kickoff time
  let kickoffTime = new Date().toISOString();
  if (game.date && game.time) {
    kickoffTime = `${game.date}T${game.time}:00-03:00`;
  } else if (game.start_time) {
    // Format: "DD-MM-YYYY HH:MM" → ISO with Argentina timezone
    const [datePart, timePart] = game.start_time.split(" ");
    if (datePart && timePart) {
      const [dd, mm, yyyy] = datePart.split("-");
      kickoffTime = `${yyyy}-${mm}-${dd}T${timePart}:00-03:00`;
    }
  }

  const homeScore = game.score?.local ?? null;
  const awayScore = game.score?.visit ?? null;

  return {
    id: `pm-${game.id}`,
    leagueId,
    tournamentName: leagueName,
    tournamentSlug: leagueSlug,
    tournamentFlag: flag,
    tournamentCategory: category,
    kickoffTime,
    status,
    minute: status === "live" ? statusLabel : null,
    homeTeam: home ?? { id: "?", name: "?", shortName: "?", abbreviation: "?", logoUrl: "", color: "334155" },
    awayTeam: away ?? { id: "?", name: "?", shortName: "?", abbreviation: "?", logoUrl: "", color: "334155" },
    homeScore: status !== "upcoming" ? homeScore : null,
    awayScore: status !== "upcoming" ? awayScore : null,
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

    setCache(cacheKey, matches, 60_000);
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
  const argDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const day = String(argDate.getUTCDate()).padStart(2, "0");
  const month = String(argDate.getUTCMonth() + 1).padStart(2, "0");
  const year = argDate.getUTCFullYear();
  const dateStr = `${day}-${month}-${year}`;

  return fetchPromiedosMatchesByDate(dateStr, leagueId, leagueName, leagueSlug, category, flag);
}

/**
 * Get matches for the whole week (±3 days) from Promiedos
 */
export async function fetchPromiedosWeek(
  leagueId: string,
  leagueName: string,
  leagueSlug: string,
  category: string,
  flag: string,
): Promise<PromiedosMatch[]> {
  const cacheKey = `promiedos:week:${leagueId}`;
  const cached = getCache<PromiedosMatch[]>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const argNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const allMatches: PromiedosMatch[] = [];
  const seen = new Set<string>();

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(argNow.getTime() + offset * 24 * 60 * 60 * 1000);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    const dateStr = `${day}-${month}-${year}`;

    try {
      const matches = await fetchPromiedosMatchesByDate(dateStr, leagueId, leagueName, leagueSlug, category, flag);
      for (const m of matches) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          allMatches.push(m);
        }
      }
    } catch {
      // Skip failed dates
    }
  }

  allMatches.sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

  setCache(cacheKey, allMatches, 60_000);
  return allMatches;
}

/**
 * Get matches for a specific round/fecha from Promiedos.
 * Fetches all matches for the league across ±7 days and filters by dedup.
 */
export async function fetchPromiedosRound(
  leagueId: string,
  roundKey: string,
): Promise<PromiedosMatch[]> {
  const cacheKey = `promiedos:round:${leagueId}:${roundKey}`;
  const cached = getCache<PromiedosMatch[]>(cacheKey);
  if (cached) return cached;

  const leagueInfo = LEAGUES[leagueId as keyof typeof LEAGUES];
  if (!leagueInfo) return [];

  try {
    // Fetch ±7 days to cover the full round
    const now = new Date();
    const argNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const allMatches: PromiedosMatch[] = [];
    const seen = new Set<string>();

    for (let offset = -7; offset <= 7; offset++) {
      const d = new Date(argNow.getTime() + offset * 24 * 60 * 60 * 1000);
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      const dateStr = `${day}-${month}-${year}`;

      try {
        const matches = await fetchPromiedosMatchesByDate(
          dateStr,
          leagueId,
          leagueInfo.name,
          leagueInfo.slug,
          leagueInfo.category,
          leagueInfo.flag,
        );
        for (const m of matches) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            allMatches.push(m);
          }
        }
      } catch {
        // Skip failed dates
      }
    }

    allMatches.sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

    setCache(cacheKey, allMatches, 60_000);
    return allMatches;
  } catch (err) {
    console.error("[promiedos] fetchPromiedosRound failed", leagueId, roundKey, err);
    return [];
  }
}

/**
 * Extended week fetch (±7 days) for merging with ESPN.
 * Used to catch multi-zone leagues that play on different days.
 */
export async function promiedosWeekExtended(
  leagueId: string,
  leagueName: string,
  leagueSlug: string,
  category: string,
  flag: string,
): Promise<PromiedosMatch[]> {
  const cacheKey = `promiedos:weekExt:${leagueId}`;
  const cached = getCache<PromiedosMatch[]>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const argNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const allMatches: PromiedosMatch[] = [];
  const seen = new Set<string>();

  for (let offset = -7; offset <= 7; offset++) {
    const d = new Date(argNow.getTime() + offset * 24 * 60 * 60 * 1000);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    const dateStr = `${day}-${month}-${year}`;

    try {
      const matches = await fetchPromiedosMatchesByDate(dateStr, leagueId, leagueName, leagueSlug, category, flag);
      for (const m of matches) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          allMatches.push(m);
        }
      }
    } catch {
      // Skip failed dates
    }
  }

  allMatches.sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());

  setCache(cacheKey, allMatches, 60_000);
  return allMatches;
}

// ========== STANDINGS ==========

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

export interface StandingGroup {
  name: string;
  entries: StandingEntry[];
}

/**
 * Get standings for a league from Promiedos.
 * Uses entity.object for team names (not values).
 */
export async function fetchPromiedosStandings(leagueId: string): Promise<StandingGroup[]> {
  const cacheKey = `promiedos:standings:${leagueId}`;
  const cached = getCache<StandingGroup[]>(cacheKey);
  if (cached) return cached;

  const promiedosId = PROMIEDOS_LEAGUE_MAP[leagueId];
  if (!promiedosId) return [];

  try {
    const data = (await promiedosFetch(`/league/tables_and_fixtures/${promiedosId}`)) as PromiedosTablesResponse;
    const groups: StandingGroup[] = [];

    for (const tg of data.tables_groups ?? []) {
      for (const table of tg.tables ?? []) {
        const entries: StandingEntry[] = table.table.rows.map((row) => {
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

          // Team name from entity.object (the real source)
          const teamObj = row.entity?.object;
          const teamName = teamObj?.name || `Equipo ${row.num}`;
          const teamShortName = teamObj?.short_name || teamName;
          const teamId = teamObj?.id || `pm-row-${row.num}`;
          const teamLogoUrl = teamObj?.id ? `https://img.promiedos.com.ar/${teamObj.id}.png` : "";

          return {
            position: row.num,
            teamId,
            teamName,
            teamShortName,
            teamLogoUrl,
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

    setCache(cacheKey, groups, 5 * 60_000);
    return groups;
  } catch (err) {
    console.error("[promiedos] fetchStandings failed", leagueId, err);
    return [];
  }
}

// ========== SCORERS / PLAYER STATISTICS ==========

export interface ScorerEntry {
  position: number;
  name: string;
  shortName: string;
  position_label: string;
  teamId: string;
  teamName: string;
  teamLogoUrl: string;
  value: number;
}

export interface ScorersGroup {
  name: string;
  entries: ScorerEntry[];
}

/**
 * Get player statistics (scorers, assists, cards) from Promiedos.
 * Only available for some leagues (hc, ebj, fahh, ea, fjda).
 */
export async function fetchPromiedosScorers(leagueId: string): Promise<ScorersGroup[]> {
  const cacheKey = `promiedos:scorers:${leagueId}`;
  const cached = getCache<ScorersGroup[]>(cacheKey);
  if (cached) return cached;

  const promiedosId = PROMIEDOS_LEAGUE_MAP[leagueId];
  if (!promiedosId) return [];

  try {
    const data = (await promiedosFetch(`/league/tables_and_fixtures/${promiedosId}`)) as PromiedosTablesResponse;
    const ps = data.players_statistics;
    if (!ps) return [];

    // Build team name lookup from standings (entity.object in table rows)
    const teamNameMap = new Map<string, string>();
    for (const tg of data.tables_groups ?? []) {
      for (const table of tg.tables ?? []) {
        for (const row of table.table.rows) {
          const obj = row.entity?.object;
          if (obj?.id && obj?.name) {
            teamNameMap.set(obj.id, obj.name);
          }
        }
      }
    }

    const groups: ScorersGroup[] = ps.tables.map((table) => {
      const entries: ScorerEntry[] = table.rows.map((row) => {
        const playerObj = row.entity?.object;
        const name = playerObj?.name || "Desconocido";
        const teamId = playerObj?.team_id || "";
        const teamName = teamNameMap.get(teamId) || "";
        const goalsVal = row.values.find((v) => v.key === table.columns[0]?.key);
        const value = goalsVal ? Number(goalsVal.value) || 0 : 0;

        return {
          position: row.num,
          name,
          shortName: playerObj?.sname || name,
          position_label: playerObj?.position || "",
          teamId,
          teamName,
          teamLogoUrl: teamId ? `https://img.promiedos.com.ar/${teamId}.png` : "",
          value,
        };
      });

      return {
        name: table.name,
        entries,
      };
    });

    setCache(cacheKey, groups, 5 * 60_000);
    return groups;
  } catch (err) {
    console.error("[promiedos] fetchScorers failed", leagueId, err);
    return [];
  }
}

// ========== TEAM DATA ==========

export interface TeamInfo {
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
  nextMatches: {
    date: string;
    homeAway: string;
    opponent: string;
    time: string;
    gameId?: string;
  }[];
  lastMatches: {
    date: string;
    homeAway: string;
    opponent: string;
    result: string;
    gameId?: string;
  }[];
  topScorers: {
    name: string;
    goals: number;
  }[];
}

/**
 * Get detailed team info from Promiedos
 */
export async function fetchPromiedosTeam(teamId: string): Promise<TeamInfo | null> {
  const cacheKey = `promiedos:team:${teamId}`;
  const cached = getCache<TeamInfo | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = (await promiedosFetch(`/team/${teamId}`)) as PromiedosTeamData;
    const comp = data.competitor;

    // Parse team_info
    const info = (data.team_info ?? []).map((i) => ({ label: i.name, value: i.value }));

    // Parse stadium
    let stadium: TeamInfo["stadium"] = null;
    if (data.stadium) {
      const stInfo = data.stadium.info ?? [];
      stadium = {
        name: data.stadium.name,
        capacity: stInfo.find((i) => i.name === "Capacidad")?.value,
        address: stInfo.find((i) => i.name === "Dirección")?.value,
        city: stInfo.find((i) => i.name === "Ciudad")?.value,
        coordinates: data.stadium.coordinates,
      };
    }

    // Parse squad
    const squad: TeamInfo["squad"] = (data.squad?.groups ?? [])
      .filter((g) => g.name !== "Dirección")
      .map((g) => ({
        position: g.name,
        players: g.rows.map((r) => {
          const vals = Object.fromEntries(r.values.map((v) => [v.key, v.value]));
          return {
            name: r.entity?.object?.name || vals["player"] || "Desconocido",
            shortName: r.entity?.object?.short_name,
            number: r.entity?.object?.num,
            age: r.entity?.object?.age || vals["age"],
            height: vals["height"],
          };
        }),
      }));

    // Parse next matches
    const nextMatches: TeamInfo["nextMatches"] = (data.games?.next?.rows ?? []).map((r) => {
      const vals = Object.fromEntries(r.values.map((v) => [v.key, v.value]));
      return {
        date: vals["date"] || "",
        homeAway: vals["home_away"] || "",
        opponent: r.entity?.object?.name || "",
        time: vals["time"] || "",
        gameId: r.game?.id,
      };
    });

    // Parse last matches
    const lastMatches: TeamInfo["lastMatches"] = (data.games?.last?.rows ?? []).map((r) => {
      const vals = Object.fromEntries(r.values.map((v) => [v.key, v.value]));
      return {
        date: vals["date"] || "",
        homeAway: vals["home_away"] || "",
        opponent: r.entity?.object?.name || "",
        result: vals["result"] || "",
        gameId: r.game?.id,
      };
    });

    // Parse top scorers from stats
    const topScorers: TeamInfo["topScorers"] = [];
    const statsFilter = data.stats?.filters?.find((f) => f.selected);
    const goalsTable = statsFilter?.tables?.find((t) => t.name === "Goles");
    if (goalsTable) {
      for (const row of goalsTable.rows.slice(0, 10)) {
        const goalsVal = row.values.find((v) => v.key === "Goals");
        topScorers.push({
          name: row.entity?.object?.name || "Desconocido",
          goals: goalsVal ? Number(goalsVal.value) || 0 : 0,
        });
      }
    }

    const result: TeamInfo = {
      id: comp.id,
      name: comp.name,
      shortName: comp.short_name,
      logoUrl: `https://img.promiedos.com.ar/${comp.id}.png`,
      color: comp.colors?.color?.replace("#", "") || "334155",
      mainLeague: data.main_league,
      info,
      stadium,
      squad,
      nextMatches,
      lastMatches,
      topScorers,
    };

    setCache(cacheKey, result, 10 * 60_000);
    return result;
  } catch (err) {
    console.error(`[promiedos] fetchTeam failed ${teamId}:`, err instanceof Error ? err.message : err);
    return null;
  }
}
