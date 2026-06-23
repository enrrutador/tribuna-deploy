import { logger } from "./logger";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SOFASCORE_API = "https://api.sofascore.com/api/v1";

type CacheEntry<T> = { data: T; expiresAt: number };
const sofaCache = new Map<string, CacheEntry<unknown>>();

function getSofaCache<T>(key: string): T | undefined {
  const entry = sofaCache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return undefined;
  return entry.data;
}

function setSofaCache<T>(key: string, data: T, ttlMs: number) {
  sofaCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const SOFASCORE_HEADERS = {
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://www.sofascore.com",
  "Referer": "https://www.sofascore.com/",
};

async function sofaFetch(url: string): Promise<unknown> {
  try {
    const args = [
      "-s", "-L",
      "-H", "Accept: application/json",
      "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "-H", "Accept-Language: en-US,en;q=0.9",
      "-H", "Origin: https://www.sofascore.com",
      "-H", "Referer: https://www.sofascore.com/",
      "--max-time", "10",
      url,
    ];
    const { stdout, stderr } = await execFileAsync("curl", args, { timeout: 15_000, maxBuffer: 5 * 1024 * 1024 });
    if (stderr && !stdout) throw new Error(`Sofascore curl stderr: ${stderr}`);
    const data = JSON.parse(stdout);
    if (data.error) throw new Error(`Sofascore API error: ${data.error}`);
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Sofascore fetch failed: ${msg} ${url}`);
  }
}

export type SofaPlayer = {
  id: number;
  name: string;
  slug: string;
  firstName: string;
  lastName: string;
  nationality: string;
  nationalityCode: string;
  position: string;
  dateOfBirth: string | null;
  height: number | null;
  preferredFoot: string | null;
  imageUrl: string | null;
  team: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
  } | null;
  marketValue: number | null;
};

export type SofaPlayerStats = {
  rating: number | null;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  averageRating: number | null;
  cleanSheets: number | null;
  saves: number | null;
  tackles: number | null;
  interceptions: number | null;
  passes: number | null;
  passAccuracy: number | null;
  keyPasses: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  dribbles: number | null;
  foulsCommitted: number | null;
  foulsDrawn: number | null;
  offsides: number | null;
  aerialDuelsWon: number | null;
  aerialDuelsTotal: number | null;
};

export type SofaLineupPlayer = {
  id: number;
  name: string;
  slug: string;
  position: string;
  rating: number | null;
  shirtNumber: number | null;
  imageUrl: string | null;
};

export type SofaLineup = {
  formation: string | null;
  players: SofaLineupPlayer[];
};

export type SofaMatchLineups = {
  home: SofaLineup;
  away: SofaLineup;
};

export type SofaH2HEntry = {
  id: number;
  homeTeam: { id: number; name: string; slug: string; imageUrl: string | null };
  awayTeam: { id: number; name: string; slug: string; imageUrl: string | null };
  homeScore: number | null;
  awayScore: number | null;
  tournament: { id: number; name: string; slug: string } | null;
  startTime: string;
};

function parsePosition(pos: number): string {
  const positions: Record<number, string> = {
    1: "GK", 2: "DEF", 3: "MID", 4: "FWD", 5: "MID", 6: "DEF",
    7: "MID", 8: "MID", 9: "FWD", 10: "MID", 11: "FWD",
  };
  return positions[pos] ?? "MID";
}

function parseDetailedPosition(pos: string | null): string {
  if (!pos) return "MID";
  const lower = pos.toLowerCase();
  if (lower.includes("goalkeeper") || lower.includes("keeper") || lower === "gk") return "GK";
  if (lower.includes("defender") || lower.includes("back") || lower === "d") return "DEF";
  if (lower.includes("midfield") || lower === "m") return "MID";
  if (lower.includes("forward") || lower.includes("striker") || lower.includes("wing") || lower === "f") return "FWD";
  return "MID";
}

export async function searchPlayer(query: string): Promise<SofaPlayer[]> {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getSofaCache<SofaPlayer[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await sofaFetch(`${SOFASCORE_API}/search/players?q=${encodeURIComponent(query)}&page=0`) as Record<string, unknown>;
    const players = (data.players as Record<string, unknown>[]) ?? [];

    const results: SofaPlayer[] = players.map((p) => {
      const team = p.team as Record<string, unknown> | undefined;
      const country = p.country as Record<string, unknown> | undefined;
      return {
        id: Number(p.id ?? 0),
        name: String(p.name ?? ""),
        slug: String(p.slug ?? ""),
        firstName: String(p.firstName ?? ""),
        lastName: String(p.lastName ?? ""),
        nationality: String(country?.name ?? ""),
        nationalityCode: String(country?.alpha2Code ?? ""),
        position: parseDetailedPosition(String(p.position ?? "")),
        dateOfBirth: p.dateOfBirthTimestamp ? new Date(Number(p.dateOfBirthTimestamp) * 1000).toISOString().split("T")[0]! : null,
        height: p.height ? Number(p.height) : null,
        preferredFoot: String(p.preferredFoot ?? ""),
        imageUrl: p.id ? `https://api.sofascore.app/api/v1/player/${p.id}/image` : null,
        team: team ? {
          id: Number(team.id ?? 0),
          name: String(team.name ?? ""),
          slug: String(team.slug ?? ""),
          imageUrl: team.id ? `https://api.sofascore.app/api/v1/team/${team.id}/image` : null,
        } : null,
        marketValue: p.proposedMarketValue ? Number(p.proposedMarketValue) : null,
      };
    });

    setSofaCache(cacheKey, results, 10 * 60_000);
    return results;
  } catch (err) {
    logger.error({ err, query }, "Sofascore player search failed");
    return [];
  }
}

export async function fetchPlayerProfile(playerId: number): Promise<SofaPlayer | null> {
  const cacheKey = `player:${playerId}`;
  const cached = getSofaCache<SofaPlayer | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await sofaFetch(`${SOFASCORE_API}/player/${playerId}`) as Record<string, unknown>;
    const p = (data.player as Record<string, unknown>) ?? {};
    const team = p.team as Record<string, unknown> | undefined;
    const country = p.country as Record<string, unknown> | undefined;

    const result: SofaPlayer = {
      id: Number(p.id ?? playerId),
      name: String(p.name ?? ""),
      slug: String(p.slug ?? ""),
      firstName: String(p.firstName ?? ""),
      lastName: String(p.lastName ?? ""),
      nationality: String(country?.name ?? ""),
      nationalityCode: String(country?.alpha2Code ?? ""),
      position: parseDetailedPosition(String(p.position ?? "")),
      dateOfBirth: p.dateOfBirthTimestamp ? new Date(Number(p.dateOfBirthTimestamp) * 1000).toISOString().split("T")[0]! : null,
      height: p.height ? Number(p.height) : null,
      preferredFoot: String(p.preferredFoot ?? ""),
      imageUrl: `https://api.sofascore.app/api/v1/player/${playerId}/image`,
      team: team ? {
        id: Number(team.id ?? 0),
        name: String(team.name ?? ""),
        slug: String(team.slug ?? ""),
        imageUrl: team.id ? `https://api.sofascore.app/api/v1/team/${team.id}/image` : null,
      } : null,
      marketValue: p.proposedMarketValue ? Number(p.proposedMarketValue) : null,
    };

    setSofaCache(cacheKey, result, 10 * 60_000);
    return result;
  } catch (err) {
    logger.error({ err, playerId }, "Sofascore player profile fetch failed");
    setSofaCache(cacheKey, null, 60_000);
    return null;
  }
}

export async function fetchPlayerStats(playerId: number, seasonId?: number): Promise<SofaPlayerStats | null> {
  const cacheKey = `player-stats:${playerId}:${seasonId ?? "current"}`;
  const cached = getSofaCache<SofaPlayerStats | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    let url = `${SOFASCORE_API}/player/${playerId}/statistics/overall`;
    if (seasonId) url = `${SOFASCORE_API}/player/${playerId}/unique-tournament/${seasonId}/statistics/overall`;

    const data = await sofaFetch(url) as Record<string, unknown>;
    const stats = (data.statistics as Record<string, unknown>) ?? (data as Record<string, unknown>);
    const rating = stats.rating != null ? parseFloat(String(stats.rating)) : null;
    const avgRating = stats.averageRating != null ? parseFloat(String(stats.averageRating)) : null;

    const result: SofaPlayerStats = {
      rating,
      appearances: Number(stats.appearances ?? 0),
      goals: Number(stats.goals ?? 0),
      assists: Number(stats.assists ?? 0),
      yellowCards: Number(stats.yellowCards ?? 0),
      redCards: Number(stats.redCards ?? 0),
      minutesPlayed: Number(stats.time ?? stats.minutesPlayed ?? 0),
      averageRating: avgRating ?? rating,
      cleanSheets: stats.cleanSheets != null ? Number(stats.cleanSheets) : null,
      saves: stats.saves != null ? Number(stats.saves) : null,
      tackles: stats.tackles != null ? Number(stats.tackles) : null,
      interceptions: stats.interceptions != null ? Number(stats.interceptions) : null,
      passes: stats.passes != null ? Number(stats.passes) : null,
      passAccuracy: stats.passAccuracy != null ? Number(stats.passAccuracy) : null,
      keyPasses: stats.keyPasses != null ? Number(stats.keyPasses) : null,
      shots: stats.shots != null ? Number(stats.shots) : null,
      shotsOnTarget: stats.shotsOnTarget != null ? Number(stats.shotsOnTarget) : null,
      dribbles: stats.dribbles != null ? Number(stats.dribbles) : null,
      foulsCommitted: stats.foulsCommitted != null ? Number(stats.foulsCommitted) : null,
      foulsDrawn: stats.foulsDrawn != null ? Number(stats.foulsDrawn) : null,
      offsides: stats.offsides != null ? Number(stats.offsides) : null,
      aerialDuelsWon: stats.aerialDuelsWon != null ? Number(stats.aerialDuelsWon) : null,
      aerialDuelsTotal: stats.aerialDuelsTotal != null ? Number(stats.aerialDuelsTotal) : null,
    };

    setSofaCache(cacheKey, result, 10 * 60_000);
    return result;
  } catch (err) {
    logger.error({ err, playerId, seasonId }, "Sofascore player stats fetch failed");
    setSofaCache(cacheKey, null, 60_000);
    return null;
  }
}

export async function fetchTeamSquad(teamId: number): Promise<SofaPlayer[]> {
  const cacheKey = `squad:${teamId}`;
  const cached = getSofaCache<SofaPlayer[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await sofaFetch(`${SOFASCORE_API}/team/${teamId}/players`) as Record<string, unknown>;
    const players = (data.players as Record<string, unknown>[]) ?? [];

    const results: SofaPlayer[] = players.map((entry) => {
      const p = (entry.player as Record<string, unknown>) ?? {};
      const team = p.team as Record<string, unknown> | undefined;
      const country = p.country as Record<string, unknown> | undefined;

      return {
        id: Number(p.id ?? 0),
        name: String(p.name ?? ""),
        slug: String(p.slug ?? ""),
        firstName: String(p.firstName ?? ""),
        lastName: String(p.lastName ?? ""),
        nationality: String(country?.name ?? ""),
        nationalityCode: String(country?.alpha2Code ?? ""),
        position: parseDetailedPosition(String(p.position ?? "")),
        dateOfBirth: p.dateOfBirthTimestamp ? new Date(Number(p.dateOfBirthTimestamp) * 1000).toISOString().split("T")[0]! : null,
        height: p.height ? Number(p.height) : null,
        preferredFoot: String(p.preferredFoot ?? ""),
        imageUrl: p.id ? `https://api.sofascore.app/api/v1/player/${p.id}/image` : null,
        team: team ? {
          id: Number(team.id ?? 0),
          name: String(team.name ?? ""),
          slug: String(team.slug ?? ""),
          imageUrl: team.id ? `https://api.sofascore.app/api/v1/team/${team.id}/image` : null,
        } : null,
        marketValue: p.proposedMarketValue ? Number(p.proposedMarketValue) : null,
      };
    });

    setSofaCache(cacheKey, results, 15 * 60_000);
    return results;
  } catch (err) {
    logger.error({ err, teamId }, "Sofascore squad fetch failed");
    return [];
  }
}

export async function fetchMatchLineups(eventId: number): Promise<SofaMatchLineups | null> {
  const cacheKey = `lineups:${eventId}`;
  const cached = getSofaCache<SofaMatchLineups | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await sofaFetch(`${SOFASCORE_API}/event/${eventId}/lineups`) as Record<string, unknown>;

    const parseLineup = (side: Record<string, unknown>): SofaLineup => {
      const formation = String(side.formation ?? "");
      const players = (side.players as Record<string, unknown>[]) ?? [];

      return {
        formation: formation || null,
        players: players.map((entry) => {
          const p = (entry.player as Record<string, unknown>) ?? {};
          return {
            id: Number(p.id ?? 0),
            name: String(p.name ?? ""),
            slug: String(p.slug ?? ""),
            position: parseDetailedPosition(String(p.position ?? "")),
            rating: entry.rating != null ? parseFloat(String(entry.rating)) : null,
            shirtNumber: p.shirtNumber != null ? Number(p.shirtNumber) : null,
            imageUrl: p.id ? `https://api.sofascore.app/api/v1/player/${p.id}/image` : null,
          };
        }),
      };
    };

    const home = data.home as Record<string, unknown> | undefined;
    const away = data.away as Record<string, unknown> | undefined;

    if (!home || !away) {
      setSofaCache(cacheKey, null, 60_000);
      return null;
    }

    const result: SofaMatchLineups = {
      home: parseLineup(home),
      away: parseLineup(away),
    };

    setSofaCache(cacheKey, result, 30_000);
    return result;
  } catch (err) {
    logger.error({ err, eventId }, "Sofascore lineups fetch failed");
    setSofaCache(cacheKey, null, 60_000);
    return null;
  }
}

export async function fetchH2H(team1Id: number, team2Id: number): Promise<SofaH2HEntry[]> {
  const cacheKey = `h2h:${team1Id}:${team2Id}`;
  const cached = getSofaCache<SofaH2HEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await sofaFetch(`${SOFASCORE_API}/team/${team1Id}/versus/${team2Id}/events/last/10`) as Record<string, unknown>;
    const events = (data.events as Record<string, unknown>[]) ?? (data.h2H as Record<string, unknown>[]) ?? [];

    const results: SofaH2HEntry[] = events.map((ev) => {
      const tournament = ev.tournament as Record<string, unknown> | undefined;
      const homeTeam = ev.homeTeam as Record<string, unknown> | undefined;
      const awayTeam = ev.awayTeam as Record<string, unknown> | undefined;
      const homeScore = ev.homeScore as Record<string, unknown> | undefined;
      const awayScore = ev.awayScore as Record<string, unknown> | undefined;

      return {
        id: Number(ev.id ?? 0),
        homeTeam: {
          id: Number(homeTeam?.id ?? 0),
          name: String(homeTeam?.name ?? ""),
          slug: String(homeTeam?.slug ?? ""),
          imageUrl: homeTeam?.id ? `https://api.sofascore.app/api/v1/team/${homeTeam.id}/image` : null,
        },
        awayTeam: {
          id: Number(awayTeam?.id ?? 0),
          name: String(awayTeam?.name ?? ""),
          slug: String(awayTeam?.slug ?? ""),
          imageUrl: awayTeam?.id ? `https://api.sofascore.app/api/v1/team/${awayTeam.id}/image` : null,
        },
        homeScore: homeScore?.current != null ? Number(homeScore.current) : null,
        awayScore: awayScore?.current != null ? Number(awayScore.current) : null,
        tournament: tournament ? { id: Number(tournament.id ?? 0), name: String(tournament.name ?? ""), slug: String(tournament.slug ?? "") } : null,
        startTime: ev.startTimestamp ? new Date(Number(ev.startTimestamp) * 1000).toISOString() : "",
      };
    });

    setSofaCache(cacheKey, results, 30 * 60_000);
    return results;
  } catch (err) {
    logger.error({ err, team1Id, team2Id }, "Sofascore H2H fetch failed");
    return [];
  }
}

export async function fetchTeamRating(teamId: number): Promise<{ rating: number; players: { id: number; name: string; rating: number | null }[] } | null> {
  const cacheKey = `team-rating:${teamId}`;
  const cached = getSofaCache<{ rating: number; players: { id: number; name: string; rating: number | null }[] } | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const data = await sofaFetch(`${SOFASCORE_API}/team/${teamId}/players`) as Record<string, unknown>;
    const players = (data.players as Record<string, unknown>[]) ?? [];

    let totalRating = 0;
    let ratedCount = 0;
    const playerRatings = players.map((entry) => {
      const p = (entry.player as Record<string, unknown>) ?? {};
      const rating = entry.rating != null ? parseFloat(String(entry.rating)) : null;
      if (rating !== null) {
        totalRating += rating;
        ratedCount++;
      }
      return { id: Number(p.id ?? 0), name: String(p.name ?? ""), rating };
    });

    const avgRating = ratedCount > 0 ? Math.round((totalRating / ratedCount) * 10) / 10 : 0;

    const result = { rating: avgRating, players: playerRatings };
    setSofaCache(cacheKey, result, 30 * 60_000);
    return result;
  } catch (err) {
    logger.error({ err, teamId }, "Sofascore team rating fetch failed");
    setSofaCache(cacheKey, null, 60_000);
    return null;
  }
}
