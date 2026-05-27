import { Router } from "express";
import {
  ESPN_LEAGUES,
  SLUG_TO_LEAGUE,
  fetchLeagueMatches,
  fetchStandings,
  fetchScorers,
  type EspnMatch,
} from "../lib/espnService";

const router = Router();

function formatMatch(m: EspnMatch) {
  return {
    id: m.id,
    homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName, logoUrl: m.homeTeam.logoUrl, color: m.homeTeam.color },
    awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName, logoUrl: m.awayTeam.logoUrl, color: m.awayTeam.color },
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    kickoffTime: m.kickoffTime,
    status: m.status,
    minute: m.minute,
    tournamentId: m.leagueId,
    tournamentName: m.tournamentName,
    tournamentSlug: m.tournamentSlug,
    tournamentFlagEmoji: m.tournamentFlag,
    round: m.round,
    date: m.kickoffTime.split("T")[0],
    broadcastChannel: m.broadcastChannel,
    venue: m.venue,
  };
}

function leagueToTournament(leagueId: string) {
  const info = ESPN_LEAGUES[leagueId];
  if (!info) return null;
  return {
    id: leagueId,
    name: info.name,
    slug: info.slug,
    category: info.category,
    flagEmoji: info.flag,
    logoUrl: null,
    description: null,
    country: null,
    format: null,
    participantCount: null,
    currentChampion: null,
  };
}

// GET /tournaments
router.get("/", async (_req, res) => {
  const destacados = [];
  const argentina = [];
  const world = [];

  for (const [id, info] of Object.entries(ESPN_LEAGUES)) {
    const t = leagueToTournament(id)!;
    if (info.category === "destacados") destacados.push(t);
    else if (info.category === "argentina") argentina.push(t);
    else world.push(t);
  }

  res.json({ destacados, argentina, world });
});

// GET /tournaments/by-slug/:slug
router.get("/by-slug/:slug", async (req, res) => {
  const leagueId = SLUG_TO_LEAGUE[req.params.slug];
  if (!leagueId) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const tournament = leagueToTournament(leagueId);
  res.json(tournament);
});

// GET /tournaments/:id  (id is a league slug like "arg.1")
router.get("/:id", async (req, res) => {
  const leagueId = req.params.id;
  const tournament = leagueToTournament(leagueId);
  if (!tournament) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(tournament);
});

// GET /tournaments/:id/standings
router.get("/:id/standings", async (req, res) => {
  try {
    const leagueId = req.params.id;
    const tournament = leagueToTournament(leagueId);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const rawGroups = await fetchStandings(leagueId);

    const formatEntry = (e: ReturnType<typeof rawGroups>[0]["entries"][0], idx: number) => ({
      position: idx + 1,
      team: {
        id: e.teamId,
        name: e.teamName,
        shortName: e.teamShortName,
        logoUrl: e.teamLogoUrl,
      },
      played: e.played,
      won: e.won,
      drawn: e.drawn,
      lost: e.lost,
      goalsFor: e.goalsFor,
      goalsAgainst: e.goalsAgainst,
      goalDifference: e.goalDiff,
      points: e.points,
      form: null,
    });

    // groups = named sections (Group A, Group B… or single "League Phase")
    const groups = rawGroups.map((g) => ({
      name: g.name,
      standings: g.entries.map(formatEntry),
    }));

    // flat standings = first group entries re-sorted (for backward-compat single-table leagues)
    const firstGroup = rawGroups[0]?.entries ?? [];
    const standings = firstGroup
      .map(formatEntry)
      .sort((a, b) => b.points - a.points)
      .map((e, i) => ({ ...e, position: i + 1 }));

    res.json({ tournament, standings, groups, round: null });
  } catch (err) {
    req.log.error({ err }, "Failed to get standings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id/scorers
router.get("/:id/scorers", async (req, res) => {
  try {
    const leagueId = req.params.id;
    const tournament = leagueToTournament(leagueId);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const rawScorers = await fetchScorers(leagueId);

    const scorers = rawScorers.map((s) => ({
      position: s.rank,
      player: { id: `${leagueId}:${s.playerName}`, name: s.playerName, nationality: null },
      team: { id: s.teamId, name: s.teamName, shortName: s.teamName, logoUrl: s.teamLogoUrl },
      goals: s.goals,
      assists: s.assists,
      played: s.played,
    }));

    res.json({ tournament, scorers });
  } catch (err) {
    req.log.error({ err }, "Failed to get scorers");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id/fixtures
router.get("/:id/fixtures", async (req, res) => {
  try {
    const leagueId = req.params.id;
    const tournament = leagueToTournament(leagueId);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const matches = await fetchLeagueMatches(leagueId);
    const formatted = matches.map(formatMatch);

    // Group by round
    const roundGroups = new Map<string, typeof formatted>();
    for (const m of formatted) {
      const key = m.round ?? "General";
      if (!roundGroups.has(key)) roundGroups.set(key, []);
      roundGroups.get(key)!.push(m);
    }

    const groups = Array.from(roundGroups.entries()).map(([round, ms]) => ({
      tournament,
      round,
      matches: ms,
    }));

    res.json({
      groups,
      totalMatches: formatted.length,
      liveCount: formatted.filter((m) => m.status === "live").length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get fixtures");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
