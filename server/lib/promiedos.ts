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

// Fallback team logos (img.promiedos.com.ar DNS is broken)
// TheSportsDB badges for national teams + flagcdn.com fallback
const TEAM_LOGO_OVERRIDES: Record<string, string> = {
  "argentina": "https://r2.thesportsdb.com/images/media/team/badge/3zplhu1726167477.png",
  "francia": "https://r2.thesportsdb.com/images/media/team/badge/p3n0z51726166851.png",
  "brasil": "https://r2.thesportsdb.com/images/media/team/badge/jl6dip1726167280.png",
  "alemania": "https://r2.thesportsdb.com/images/media/team/badge/1xysi51726167152.png",
  "españa": "https://r2.thesportsdb.com/images/media/team/badge/ncgqyr1726166942.png",
  "inglaterra": "https://r2.thesportsdb.com/images/media/team/badge/vf5ttc1726166739.png",
  "portugal": "https://r2.thesportsdb.com/images/media/team/badge/swqvpy1455466083.png",
  "italia": "https://r2.thesportsdb.com/images/media/team/badge/fxijcp1726167035.png",
  "croacia": "https://r2.thesportsdb.com/images/media/team/badge/vvtsyu1455465317.png",
  "japón": "https://r2.thesportsdb.com/images/media/team/badge/ffsyxz1591989843.png",
  "irán": "https://r2.thesportsdb.com/images/media/team/badge/uttpvw1455465617.png",
  "senegal": "https://r2.thesportsdb.com/images/media/team/badge/slayb01780546342.png",
  "ghana": "https://r2.thesportsdb.com/images/media/team/badge/j589xw1751526124.png",
  "nigeria": "https://r2.thesportsdb.com/images/media/team/badge/qruyxr1455466056.png",
  "australia": "https://r2.thesportsdb.com/images/media/team/badge/eylq8x1781926138.png",
  "suecia": "https://r2.thesportsdb.com/images/media/team/badge/h5adzg1591981772.png",
  "noruega": "https://r2.thesportsdb.com/images/media/team/badge/gyfn811591973155.png",
  "austria": "https://r2.thesportsdb.com/images/media/team/badge/874p631628721400.png",
  "escocia": "https://r2.thesportsdb.com/images/media/team/badge/3691i11552945146.png",
  "gales": "https://r2.thesportsdb.com/images/media/team/badge/pdayn21591983222.png",
  "serbia": "https://r2.thesportsdb.com/images/media/team/badge/oxvynb1689195538.png",
  "méxico": "https://r2.thesportsdb.com/images/media/team/badge/3rmosi1748525208.png",
  "canadá": "https://r2.thesportsdb.com/images/media/team/badge/2t631f1595154867.png",
  "colombia": "https://r2.thesportsdb.com/images/media/team/badge/4ymyku1691180081.png",
  "uruguay": "https://r2.thesportsdb.com/images/media/team/badge/6vjbr11726167756.png",
  "chile": "https://r2.thesportsdb.com/images/media/team/badge/5xjsy41591988732.png",
  "ecuador": "https://r2.thesportsdb.com/images/media/team/badge/47wv2y1591989301.png",
  "paraguay": "https://r2.thesportsdb.com/images/media/team/badge/khgav41553419195.png",
  "perú": "https://r2.thesportsdb.com/images/media/team/badge/unszat1529144812.png",
  "panamá": "https://r2.thesportsdb.com/images/media/team/badge/asp2ck1715849700.png",
  "jamaica": "https://r2.thesportsdb.com/images/media/team/badge/v6mk4r1594321722.png",
  "túnez": "https://r2.thesportsdb.com/images/media/team/badge/7r89rg1526727277.png",
  "camerún": "https://r2.thesportsdb.com/images/media/team/badge/txqspw1455463989.png",
  "países bajos": "https://r2.thesportsdb.com/images/media/team/badge/1p0hr41593787110.png",
  "holanda": "https://r2.thesportsdb.com/images/media/team/badge/1p0hr41593787110.png",
  "bélgica": "https://r2.thesportsdb.com/images/media/team/badge/8xlvxv1592062265.png",
  "suiza": "https://r2.thesportsdb.com/images/media/team/badge/mb7yqe1717365808.png",
  "corea del sur": "https://r2.thesportsdb.com/images/media/team/badge/24xwpq1594125742.png",
  "egipto": "https://flagcdn.com/w80/eg.png",
  "arabia saudita": "https://flagcdn.com/w80/sa.png",
  "bosnia y herzegovina": "https://flagcdn.com/w80/ba.png",
  "hungría": "https://flagcdn.com/w80/hu.png",
  "dinamarca": "https://flagcdn.com/w80/dk.png",
  "estados unidos": "https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  "argelia": "https://flagcdn.com/w80/dz.png",
  "cabo verde": "https://flagcdn.com/w80/cv.png",
  "jordania": "https://flagcdn.com/w80/jo.png",
};

export function getTeamLogoUrl(teamName: string): string {
  const lower = teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (TEAM_LOGO_OVERRIDES[lower]) return TEAM_LOGO_OVERRIDES[lower];
  // Check original name too (with accents)
  const original = teamName.toLowerCase().trim();
  if (TEAM_LOGO_OVERRIDES[original]) return TEAM_LOGO_OVERRIDES[original];
  return "";
}

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
  scores?: number[];
  game_time?: number;
  game_time_to_display?: string;
  game_time_status_to_display?: string;
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
  if (s === "final" || s === "finished" || s === "ft" || s === "finalizado") return "finished";
  if (
    s === "live" || s === "playing" || s === "1t" || s === "2t" || s === "et" ||
    s === "entretiempo" || s === "descanso" || s === "en juego" || s === "prórroga" ||
    s === "tanda de penales" || s === "penales" ||
    s === "primer tiempo" || s === "segundo tiempo" || s === "1°" || s === "2°"
  ) return "live";
  return "upcoming";
}

function parseTeam(team: PromiedosTeam, index: number): PromiedosMatch["homeTeam"] {
  const overrideLogo = getTeamLogoUrl(team.name);
  return {
    id: team.id || `pm-${index}`,
    name: team.name,
    shortName: team.short_name || team.name,
    abbreviation: (team.short_name || team.name).slice(0, 4).toUpperCase(),
    logoUrl: overrideLogo || "",
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
  let gameTimeDisplay: string | null = null;
  if (typeof game.status === "string") {
    statusStr = game.status;
  } else if (game.status && typeof game.status === "object") {
    statusStr = game.status.name ?? game.status.short_name;
    statusLabel = statusStr ?? null;
  }
  if (game.game_time_to_display) {
    gameTimeDisplay = game.game_time_to_display;
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

  const homeScore = game.scores?.[0] ?? game.score?.local ?? null;
  const awayScore = game.scores?.[1] ?? game.score?.visit ?? null;

  return {
    id: `pm-${game.id}`,
    leagueId,
    tournamentName: leagueName,
    tournamentSlug: leagueSlug,
    tournamentFlag: flag,
    tournamentCategory: category,
    kickoffTime,
    status,
    minute: status === "live" ? (gameTimeDisplay || statusLabel) : null,
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

  // For Mundial: assign rounds from bracket data when stage_round_name is missing
  if (leagueId === "fifa.world") {
    const brackets = await fetchBrackets(leagueId);
    if (brackets?.stages) {
      const normalize = (s: string) =>
        s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

      // Build a map: normalized "home|away" → stage name (from brackets)
      const bracketRoundMap = new Map<string, string>();
      for (const stage of brackets.stages) {
        for (const bm of stage.matches) {
          const sig = `${normalize(bm.homeTeam.name)}|${normalize(bm.awayTeam.name)}`;
          const sigRev = `${normalize(bm.awayTeam.name)}|${normalize(bm.homeTeam.name)}`;
          bracketRoundMap.set(sig, stage.name);
          bracketRoundMap.set(sigRev, stage.name);
        }
      }

      // Assign rounds to matches
      for (const m of allMatches) {
        if (!m.round) {
          const sig = `${normalize(m.homeTeam.name)}|${normalize(m.awayTeam.name)}`;
          const inferred = bracketRoundMap.get(sig);
          if (inferred) m.round = inferred;
        }
      }

      // For matches still without round: infer from date ranges based on bracket stages
      // Group stage (Fecha 1-3): before first knockout date
      // 16avos: based on bracket stage dates
      // etc.
      const stageDateRanges: { name: string; start: Date; end: Date }[] = [];
      for (const stage of brackets.stages) {
        const dates = stage.matches
          .filter((bm) => bm.startTime)
          .map((bm) => {
            const [dd, mm, yyyy] = bm.startTime!.split(" ")[0].split("-");
            return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
          });
        if (dates.length > 0) {
          const start = new Date(Math.min(...dates.map((d) => d.getTime())));
          const end = new Date(Math.max(...dates.map((d) => d.getTime())));
          end.setHours(23, 59, 59);
          stageDateRanges.push({ name: stage.name, start, end });
        }
      }

      for (const m of allMatches) {
        if (!m.round) {
          const [datePart] = m.kickoffTime.split("T");
          const matchDate = new Date(datePart);
          // Find which stage range this match falls into
          const matched = stageDateRanges.find(
            (r) => matchDate >= r.start && matchDate <= r.end
          );
          if (matched) m.round = matched.name;
        }
      }

      // Last resort: infer group stage matches as "Fecha 1", "Fecha 2", "Fecha 3"
      // based on the group stage date ranges from filters
      if (allMatches.some((m) => !m.round)) {
        const fechaRanges: { name: string; start: Date; end: Date }[] = [
          { name: "Fecha 1", start: new Date("2026-06-28"), end: new Date("2026-06-30T23:59:59") },
          { name: "Fecha 2", start: new Date("2026-06-30"), end: new Date("2026-07-02T23:59:59") },
          { name: "Fecha 3", start: new Date("2026-07-02"), end: new Date("2026-07-04T23:59:59") },
        ];
        for (const m of allMatches) {
          if (!m.round) {
            const [datePart] = m.kickoffTime.split("T");
            const matchDate = new Date(datePart);
            const matched = fechaRanges.find(
              (r) => matchDate >= r.start && matchDate <= r.end
            );
            if (matched) m.round = matched.name;
          }
        }
      }
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
          const teamLogoUrl = getTeamLogoUrl(teamName);

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

        // Sort by points desc, then goal difference desc, then goals for desc
        entries.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = parseInt(a.goalDiff) || 0;
          const gdB = parseInt(b.goalDiff) || 0;
          if (gdB !== gdA) return gdB - gdA;
          return b.goalsFor - a.goalsFor;
        });
        // Re-assign positions after sort
        entries.forEach((e, i) => { e.position = i + 1; });

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
          teamLogoUrl: getTeamLogoUrl(teamName),
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
      logoUrl: getTeamLogoUrl(comp.name),
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

// ========== BRACKETS (tournament knockout rounds) ==========

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
  winner: number; // 0=none, 1=home, 2=away
}

export interface BracketStage {
  name: string;
  matches: BracketMatch[];
}

export interface BracketData {
  stages: BracketStage[];
}

export async function fetchBrackets(leagueId: string): Promise<BracketData | null> {
  const cacheKey = `promiedos:brackets:${leagueId}`;
  const cached = getCache<BracketData>(cacheKey);
  if (cached) return cached;

  const promiedosId = PROMIEDOS_LEAGUE_MAP[leagueId];
  if (!promiedosId) return null;

  try {
    const data = (await promiedosFetch(`/league/tables_and_fixtures/${promiedosId}`)) as Record<string, unknown>;
    const brackets = data.brackets as Record<string, unknown>;
    if (!brackets?.stages) return null;

    const stages = (brackets.stages as Record<string, unknown>[]).map((stage) => {
      const groups = (stage.groups as Record<string, unknown>[]) ?? [];
      const matches: BracketMatch[] = groups.map((g) => {
        const games = (g.games as Record<string, unknown>[]) ?? [];
        const game = games[0] ?? {};
        const teams = (game.teams as Record<string, unknown>[]) ?? [];
        const participants = (g.participants as Record<string, unknown>[]) ?? [];
        const score = (g.score as number[]) ?? [];

        const parseTeam = (t: Record<string, unknown>, p?: Record<string, unknown>): BracketTeam => ({
          name: String(t?.name ?? p?.name ?? "?"),
          shortName: String(t?.short_name ?? p?.short_name ?? "?"),
          symbolName: String(p?.symbol_name ?? "?"),
          id: String(t?.id ?? p?.id ?? ""),
          color: String((t?.colors as Record<string, unknown>)?.color ?? "#334155").replace("#", ""),
          textColor: String((t?.colors as Record<string, unknown>)?.text_color ?? "#FFFFFF").replace("#", ""),
        });

        const homeTeam = teams[0]
          ? parseTeam(teams[0], participants[0] as Record<string, unknown> | undefined)
          : { name: "?", shortName: "?", symbolName: "?", id: "", color: "334155", textColor: "FFFFFF" };
        const awayTeam = teams[1]
          ? parseTeam(teams[1], participants[1] as Record<string, unknown> | undefined)
          : { name: "?", shortName: "?", symbolName: "?", id: "", color: "334155", textColor: "FFFFFF" };

        const gameStatus = (game.status as Record<string, unknown>) ?? {};
        const statusName = String(gameStatus.name ?? "");
        let status: BracketMatch["status"] = "upcoming";
        if (statusName === "Finalizado" || statusName === "Final" || statusName === "FT") status = "finished";
        else if (statusName === "En juego" || statusName === "1T" || statusName === "2T" || statusName === "Entretiempo" || statusName === "Descanso" || statusName === "ET" || statusName === "Prórroga" || statusName === "Tanda de penales" || statusName === "Penales") status = "live";

        return {
          id: String(game.id ?? ""),
          homeTeam,
          awayTeam,
          status,
          statusText: statusName || "Programado",
          startTime: game.start_time ? String(game.start_time) : null,
          homeScore: score.length > 0 ? Number(score[0]) : null,
          awayScore: score.length > 1 ? Number(score[1]) : null,
          winner: Number(g.winner ?? -1),
        };
      });

      return {
        name: String(stage.name ?? ""),
        matches,
      };
    });

    const result: BracketData = { stages };
    setCache(cacheKey, result, 5 * 60_000);
    return result;
  } catch (err) {
    console.error("[promiedos] fetchBrackets failed", leagueId, err);
    return null;
  }
}
