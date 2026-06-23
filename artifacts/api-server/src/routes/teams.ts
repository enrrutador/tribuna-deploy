import { Router } from "express";
import { fetchTodayMatches, ESPN_LEAGUES, type EspnMatch } from "../lib/espnService";

const router = Router();

router.get("/", async (_req, res) => {
  res.json({ teams: [] });
});

router.get("/:id", async (req, res) => {
  try {
    const teamId = req.params.id;
    const season = (req.query.season as string) || undefined;

    const allLeagues = Object.keys(ESPN_LEAGUES);
    const { fetchLeagueMatches } = await import("../lib/espnService");

    const results = await Promise.allSettled(
      allLeagues.map((lid) => fetchLeagueMatches(lid))
    );

    const allMatches: EspnMatch[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allMatches.push(...r.value);
    }

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
      // Fallback: try Transfermarkt directly
      try {
        const { fetchTeamInfoTM } = await import("../lib/transfermarktService");
        const tmInfo = await fetchTeamInfoTM(teamId, season);
        if (tmInfo) {
          res.json({
            team: {
              id: teamId,
              name: tmInfo.name ?? `Team ${teamId}`,
              shortName: tmInfo.name ?? `Team ${teamId}`,
              logoUrl: tmInfo.imageUrl ?? null,
              slug: tmInfo.slug ?? `team-${teamId}`,
              stadium: tmInfo.stadium ?? null,
              capacity: tmInfo.capacity ?? null,
              city: null,
              country: tmInfo.country ?? null,
              founded: tmInfo.founded ?? null,
              coach: tmInfo.coach ?? null,
              description: null,
              marketValue: tmInfo.marketValue ?? null,
              squadSize: tmInfo.squadSize ?? null,
              averageAge: tmInfo.averageAge ?? null,
              foreigners: tmInfo.foreigners ?? null,
            },
            recentMatches: [],
          });
          return;
        }
      } catch {
        // TM also failed
      }

      res.status(404).json({ error: "Team not found" });
      return;
    }

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
      venue: m.venue,
    }));

    // Try Transfermarkt for rich team info
    let tmInfo: any = null;
    try {
      const { fetchTeamInfoTM } = await import("../lib/transfermarktService");
      tmInfo = await fetchTeamInfoTM(teamId, season);
    } catch (_e) {
      // TM fallback failed, that's fine
    }

    res.json({
      team: {
        id: teamInfo.id,
        name: teamInfo.name,
        shortName: teamInfo.shortName,
        logoUrl: tmInfo?.imageUrl ?? teamInfo.logoUrl,
        slug: teamInfo.abbreviation.toLowerCase(),
        stadium: tmInfo?.stadium ?? null,
        capacity: tmInfo?.capacity ?? null,
        city: null,
        country: tmInfo?.country ?? null,
        founded: tmInfo?.founded ?? null,
        coach: tmInfo?.coach ?? null,
        description: null,
        marketValue: tmInfo?.marketValue ?? null,
        squadSize: tmInfo?.squadSize ?? null,
        averageAge: tmInfo?.averageAge ?? null,
        foreigners: tmInfo?.foreigners ?? null,
      },
      recentMatches,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get team");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
