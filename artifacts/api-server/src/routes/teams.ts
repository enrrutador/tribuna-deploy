import { Router } from "express";
import { db } from "@workspace/db";
import { teamsTable, matchesTable, tournamentsTable, matchEventsTable } from "@workspace/db";
import { eq, or, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const teams = await db.select().from(teamsTable).orderBy(teamsTable.name);
    res.json({ teams });
  } catch (err) {
    req.log.error({ err }, "Failed to list teams");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, id));
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    const homeTeams = db.$with("ht").as(db.select().from(teamsTable));
    const awayTeams = db.$with("at").as(db.select().from(teamsTable));

    const recentMatches = await db
      .with(homeTeams, awayTeams)
      .select({
        id: matchesTable.id,
        homeScore: matchesTable.homeScore,
        awayScore: matchesTable.awayScore,
        kickoffTime: matchesTable.kickoffTime,
        status: matchesTable.status,
        minute: matchesTable.minute,
        round: matchesTable.round,
        matchDate: matchesTable.matchDate,
        broadcastChannel: matchesTable.broadcastChannel,
        homeTeamId: matchesTable.homeTeamId,
        awayTeamId: matchesTable.awayTeamId,
        homeTeamName: sql<string>`ht.name`,
        homeTeamLogoUrl: sql<string | null>`ht.logo_url`,
        homeTeamShortName: sql<string | null>`ht.short_name`,
        awayTeamName: sql<string>`at.name`,
        awayTeamLogoUrl: sql<string | null>`at.logo_url`,
        awayTeamShortName: sql<string | null>`at.short_name`,
        tournamentId: tournamentsTable.id,
        tournamentName: tournamentsTable.name,
        tournamentSlug: tournamentsTable.slug,
        tournamentFlagEmoji: tournamentsTable.flagEmoji,
      })
      .from(matchesTable)
      .innerJoin(homeTeams, eq(matchesTable.homeTeamId, sql`ht.id`))
      .innerJoin(awayTeams, eq(matchesTable.awayTeamId, sql`at.id`))
      .innerJoin(tournamentsTable, eq(matchesTable.tournamentId, tournamentsTable.id))
      .where(or(eq(matchesTable.homeTeamId, id), eq(matchesTable.awayTeamId, id)))
      .orderBy(desc(matchesTable.kickoffTime))
      .limit(20);

    const matches = recentMatches.map((m) => ({
      id: m.id,
      homeTeam: { id: m.homeTeamId, name: m.homeTeamName, logoUrl: m.homeTeamLogoUrl, shortName: m.homeTeamShortName },
      awayTeam: { id: m.awayTeamId, name: m.awayTeamName, logoUrl: m.awayTeamLogoUrl, shortName: m.awayTeamShortName },
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      kickoffTime: m.kickoffTime.toISOString(),
      status: m.status,
      minute: m.minute,
      tournamentId: m.tournamentId,
      tournamentName: m.tournamentName,
      tournamentSlug: m.tournamentSlug,
      round: m.round,
      date: m.matchDate,
      broadcastChannel: m.broadcastChannel,
    }));

    res.json({
      team: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        logoUrl: team.logoUrl,
        slug: team.slug,
        stadium: team.stadium,
        city: team.city,
        country: team.country,
        founded: team.founded,
        coach: team.coach,
        description: team.description,
      },
      recentMatches: matches,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get team");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/by-slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const [team] = await db.select().from(teamsTable).where(eq(teamsTable.slug, slug));
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.redirect(`/api/teams/${team.id}`);
  } catch (err) {
    req.log.error({ err }, "Failed to get team by slug");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
