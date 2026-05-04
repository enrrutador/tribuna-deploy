import { Router } from "express";
import { db } from "@workspace/db";
import { tournamentsTable, standingsTable, teamsTable, scorersTable, playersTable, matchesTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { GetTournamentParams, GetTournamentBySlugParams, GetTournamentStandingsParams, GetTournamentScorersParams, GetTournamentFixturesParams, GetTournamentFixturesQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /tournaments
router.get("/", async (req, res) => {
  try {
    const all = await db.select().from(tournamentsTable).orderBy(tournamentsTable.id);
    res.json({
      destacados: all.filter((t) => t.category === "destacados"),
      argentina: all.filter((t) => t.category === "argentina"),
      world: all.filter((t) => t.category === "world"),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list tournaments");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/by-slug/:slug  (must be before /:id to avoid conflict)
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const parsed = GetTournamentBySlugParams.safeParse({ slug: req.params.slug });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid slug" });
      return;
    }
    const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.slug, parsed.data.slug)).limit(1);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(tournament);
  } catch (err) {
    req.log.error({ err }, "Failed to get tournament by slug");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id
router.get("/:id", async (req, res) => {
  try {
    const parsed = GetTournamentParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, parsed.data.id)).limit(1);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(tournament);
  } catch (err) {
    req.log.error({ err }, "Failed to get tournament");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id/standings
router.get("/:id/standings", async (req, res) => {
  try {
    const parsed = GetTournamentStandingsParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, parsed.data.id)).limit(1);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const rows = await db.select().from(standingsTable)
      .where(eq(standingsTable.tournamentId, parsed.data.id))
      .orderBy(asc(standingsTable.position));

    const teamIds = rows.map((r) => r.teamId);
    const teams = teamIds.length > 0
      ? await db.select().from(teamsTable).where(eq(teamsTable.id, teamIds[0]))
      : [];

    // Load all teams
    const allTeams = await db.select().from(teamsTable);
    const teamMap = new Map(allTeams.map((t) => [t.id, t]));

    const standings = rows.map((row) => {
      const team = teamMap.get(row.teamId);
      return {
        position: row.position,
        team: {
          id: row.teamId,
          name: team?.name ?? "Unknown",
          logoUrl: team?.logoUrl ?? null,
          shortName: team?.shortName ?? null,
        },
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalsFor - row.goalsAgainst,
        points: row.points,
        form: row.form ?? null,
      };
    });

    res.json({ tournament, standings, round: null });
  } catch (err) {
    req.log.error({ err }, "Failed to get standings");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id/scorers
router.get("/:id/scorers", async (req, res) => {
  try {
    const parsed = GetTournamentScorersParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, parsed.data.id)).limit(1);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const rows = await db.select().from(scorersTable)
      .where(eq(scorersTable.tournamentId, parsed.data.id))
      .orderBy(asc(scorersTable.position));

    const allPlayers = await db.select().from(playersTable);
    const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

    const allTeams = await db.select().from(teamsTable);
    const teamMap = new Map(allTeams.map((t) => [t.id, t]));

    const scorers = rows.map((row) => {
      const player = playerMap.get(row.playerId);
      const team = teamMap.get(row.teamId);
      return {
        position: row.position,
        player: {
          id: row.playerId,
          name: player?.name ?? "Unknown",
          nationality: player?.nationality ?? null,
        },
        team: {
          id: row.teamId,
          name: team?.name ?? "Unknown",
          logoUrl: team?.logoUrl ?? null,
          shortName: team?.shortName ?? null,
        },
        goals: row.goals,
        assists: row.assists,
        played: row.played,
      };
    });

    res.json({ tournament, scorers });
  } catch (err) {
    req.log.error({ err }, "Failed to get scorers");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tournaments/:id/fixtures
router.get("/:id/fixtures", async (req, res) => {
  try {
    const parsed = GetTournamentFixturesParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [tournament] = await db.select().from(tournamentsTable).where(eq(tournamentsTable.id, parsed.data.id)).limit(1);
    if (!tournament) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const matchRows = await db.select().from(matchesTable)
      .where(eq(matchesTable.tournamentId, parsed.data.id))
      .orderBy(matchesTable.kickoffTime);

    const allTeams = await db.select().from(teamsTable);
    const teamMap = new Map(allTeams.map((t) => [t.id, t]));

    const matches = matchRows.map((m) => {
      const home = teamMap.get(m.homeTeamId);
      const away = teamMap.get(m.awayTeamId);
      return {
        id: m.id,
        homeTeam: { id: m.homeTeamId, name: home?.name ?? "Unknown", logoUrl: home?.logoUrl ?? null, shortName: home?.shortName ?? null },
        awayTeam: { id: m.awayTeamId, name: away?.name ?? "Unknown", logoUrl: away?.logoUrl ?? null, shortName: away?.shortName ?? null },
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        kickoffTime: m.kickoffTime.toISOString(),
        status: m.status,
        minute: m.minute,
        tournamentId: m.tournamentId,
        tournamentName: tournament.name,
        round: m.round,
        date: m.matchDate,
        broadcastChannel: m.broadcastChannel,
      };
    });

    res.json({
      groups: [{ tournament, round: null, matches }],
      totalMatches: matches.length,
      liveCount: matches.filter((m) => m.status === "live").length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get fixtures");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
