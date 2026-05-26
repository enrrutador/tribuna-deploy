import { Router } from "express";
import { fetchTodayMatches, ESPN_LEAGUES, type EspnMatch } from "../lib/espnService";

const router = Router();

// GET /teams — not used heavily but kept for compatibility
router.get("/", async (_req, res) => {
  res.json({ teams: [] });
});

// GET /teams/:id — ESPN team ID (string like "5" for Boca)
router.get("/:id", async (req, res) => {
  try {
    const teamId = req.params.id;

    // Search across all leagues for this team's matches
    const allLeagues = Object.keys(ESPN_LEAGUES);
    const { fetchLeagueMatches } = await import("../lib/espnService");

    const results = await Promise.allSettled(
      allLeagues.map((lid) => fetchLeagueMatches(lid))
    );

    const allMatches: EspnMatch[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allMatches.push(...r.value);
    }

    // Find team info from any match involving this team
    let teamInfo: { id: string; name: string; shortName: string; abbreviation: string; logoUrl: string; color: string } | null = null;
    const teamMatches: EspnMatch[] = [];

    for (const m of allMatches) {
      const isHome = m.homeTeam.id === teamId;
      const isAway = m.awayTeam.id === teamId;
      if (isHome || isAway) {
        teamMatches.push(m);
        if (!teamInfo) teamInfo = isHome ? m.homeTeam : m.awayTeam;
      }
    }

    if (!teamInfo) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    // Sort by kickoff time descending
    teamMatches.sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime());

    const recentMatches = teamMatches.slice(0, 10).map((m) => ({
      id: m.id,
      homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName, logoUrl: m.homeTeam.logoUrl },
      awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName, logoUrl: m.awayTeam.logoUrl },
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      kickoffTime: m.kickoffTime,
      status: m.status,
      minute: m.minute,
      tournamentId: m.leagueId,
      tournamentName: m.tournamentName,
      tournamentSlug: m.tournamentSlug,
      round: m.round,
      date: m.kickoffTime.split("T")[0],
      broadcastChannel: m.broadcastChannel,
    }));

    res.json({
      team: {
        id: teamInfo.id,
        name: teamInfo.name,
        shortName: teamInfo.shortName,
        logoUrl: teamInfo.logoUrl,
        slug: teamInfo.abbreviation.toLowerCase(),
        stadium: null,
        city: null,
        country: null,
        founded: null,
        coach: null,
        description: null,
      },
      recentMatches,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get team");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
