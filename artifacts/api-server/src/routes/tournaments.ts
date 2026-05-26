import { Router } from "express";
import {
  ESPN_LEAGUES,
  SLUG_TO_LEAGUE,
  fetchLeagueMatches,
  fetchStandings,
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

    const groups = await fetchStandings(leagueId);

    // Flatten to single standings array (first group, or merge if multiple)
    const standings = (groups as Array<{ entries: unknown[] }>).flatMap((g, groupIdx) =>
      (g.entries as Array<Record<string, unknown>>).map((e, idx) => ({
        position: groupIdx === 0 ? idx + 1 : idx + 1,
        team: {
          id: String(e.teamId),
          name: String(e.teamName),
          shortName: String(e.teamShortName),
          logoUrl: String(e.teamLogoUrl),
        },
        played: Number(e.played),
        won: Number(e.won),
        drawn: Number(e.drawn),
        lost: Number(e.lost),
        goalsFor: Number(e.goalsFor),
        goalsAgainst: Number(e.goalsAgainst),
        goalDifference: String(e.goalDiff),
        points: Number(e.points),
        form: null,
      }))
    ).sort((a, b) => b.points - a.points).map((e, i) => ({ ...e, position: i + 1 }));

    res.json({ tournament, standings, round: null });
  } catch (err) {
    req.log.error({ err }, "Failed to get standings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id/scorers  (ESPN doesn't have free scorers, return empty gracefully)
router.get("/:id/scorers", async (req, res) => {
  const leagueId = req.params.id;
  const tournament = leagueToTournament(leagueId);
  if (!tournament) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ tournament, scorers: [] });
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
