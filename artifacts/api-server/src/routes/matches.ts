import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, teamsTable, tournamentsTable, matchEventsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { ListMatchesQueryParams, GetMatchParams } from "@workspace/api-zod";

const router = Router();

type MatchRow = {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  kickoffTime: Date;
  status: "upcoming" | "live" | "finished";
  minute: number | null;
  tournamentId: number;
  round: string | null;
  matchDate: string;
  broadcastChannel: string | null;
  homeTeamName: string;
  homeTeamLogoUrl: string | null;
  homeTeamShortName: string | null;
  awayTeamName: string;
  awayTeamLogoUrl: string | null;
  awayTeamShortName: string | null;
  tournamentName: string;
  tournamentSlug: string;
  tournamentCategory: string;
  tournamentLogoUrl: string | null;
  tournamentFlagEmoji: string | null;
};

async function fetchMatches(filters: {
  date?: string;
  status?: "upcoming" | "live" | "finished";
  tournamentId?: number;
}) {
  const homeTeams = db
    .$with("home_teams")
    .as(db.select().from(teamsTable));
  const awayTeams = db
    .$with("away_teams")
    .as(db.select().from(teamsTable));

  const conditions = [];
  if (filters.date) {
    conditions.push(eq(matchesTable.matchDate, filters.date));
  }
  if (filters.status) {
    conditions.push(eq(matchesTable.status, filters.status));
  }
  if (filters.tournamentId) {
    conditions.push(eq(matchesTable.tournamentId, filters.tournamentId));
  }

  const homeT = { id: teamsTable.id, name: teamsTable.name, logoUrl: teamsTable.logoUrl, shortName: teamsTable.shortName };

  const rows = await db
    .select({
      id: matchesTable.id,
      homeTeamId: matchesTable.homeTeamId,
      awayTeamId: matchesTable.awayTeamId,
      homeScore: matchesTable.homeScore,
      awayScore: matchesTable.awayScore,
      kickoffTime: matchesTable.kickoffTime,
      status: matchesTable.status,
      minute: matchesTable.minute,
      tournamentId: matchesTable.tournamentId,
      round: matchesTable.round,
      matchDate: matchesTable.matchDate,
      broadcastChannel: matchesTable.broadcastChannel,
      tournamentName: tournamentsTable.name,
      tournamentSlug: tournamentsTable.slug,
      tournamentCategory: tournamentsTable.category,
      tournamentLogoUrl: tournamentsTable.logoUrl,
      tournamentFlagEmoji: tournamentsTable.flagEmoji,
    })
    .from(matchesTable)
    .innerJoin(tournamentsTable, eq(matchesTable.tournamentId, tournamentsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(matchesTable.kickoffTime);

  // Load team info separately
  const teamIds = [...new Set([...rows.map(r => r.homeTeamId), ...rows.map(r => r.awayTeamId)])];
  let teamMap: Map<number, { id: number; name: string; logoUrl: string | null; shortName: string | null }> = new Map();

  if (teamIds.length > 0) {
    const teams = await db.select().from(teamsTable).where(
      sql`${teamsTable.id} = ANY(${sql.raw(`ARRAY[${teamIds.join(",")}]`)})`
    );
    for (const t of teams) {
      teamMap.set(t.id, t);
    }
  }

  return rows.map((r) => {
    const home = teamMap.get(r.homeTeamId);
    const away = teamMap.get(r.awayTeamId);
    return {
      id: r.id,
      homeTeam: {
        id: r.homeTeamId,
        name: home?.name ?? "Unknown",
        logoUrl: home?.logoUrl ?? null,
        shortName: home?.shortName ?? null,
      },
      awayTeam: {
        id: r.awayTeamId,
        name: away?.name ?? "Unknown",
        logoUrl: away?.logoUrl ?? null,
        shortName: away?.shortName ?? null,
      },
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      kickoffTime: r.kickoffTime.toISOString(),
      status: r.status,
      minute: r.minute,
      tournamentId: r.tournamentId,
      tournamentName: r.tournamentName,
      tournamentSlug: r.tournamentSlug,
      tournamentFlagEmoji: r.tournamentFlagEmoji,
      round: r.round,
      date: r.matchDate,
      broadcastChannel: r.broadcastChannel,
    };
  });
}

function groupByTournament(matches: ReturnType<typeof formatMatch>[], tournamentsMap: Map<number, { id: number; name: string; slug: string; category: string; logoUrl: string | null; flagEmoji: string | null }>) {
  const groups: Map<number, { tournament: typeof tournamentsMap extends Map<number, infer V> ? V : never; round: string | null; matches: typeof matches }> = new Map();

  for (const m of matches) {
    if (!groups.has(m.tournamentId)) {
      const t = tournamentsMap.get(m.tournamentId);
      if (t) {
        groups.set(m.tournamentId, { tournament: t, round: m.round, matches: [] });
      }
    }
    groups.get(m.tournamentId)?.matches.push(m);
  }

  return Array.from(groups.values());
}

function formatMatch(m: Awaited<ReturnType<typeof fetchMatches>>[0]) {
  return m;
}

router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const matches = await fetchMatches({ date: today });

    const allTournaments = await db.select().from(tournamentsTable);
    const tMap = new Map(allTournaments.map((t) => [t.id, t]));

    const groups = groupByTournament(matches, tMap);

    const liveCount = matches.filter((m) => m.status === "live").length;
    const finishedCount = matches.filter((m) => m.status === "finished").length;
    const upcomingCount = matches.filter((m) => m.status === "upcoming").length;

    res.json({
      date: today,
      groups,
      totalMatches: matches.length,
      liveCount,
      finishedCount,
      upcomingCount,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get today matches");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/live", async (req, res) => {
  try {
    const matches = await fetchMatches({ status: "live" });

    const allTournaments = await db.select().from(tournamentsTable);
    const tMap = new Map(allTournaments.map((t) => [t.id, t]));

    const groups = groupByTournament(matches, tMap);

    res.json({
      groups,
      totalMatches: matches.length,
      liveCount: matches.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get live matches");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const parsed = ListMatchesQueryParams.safeParse({
      date: req.query.date,
      status: req.query.status,
      tournamentId: req.query.tournamentId ? Number(req.query.tournamentId) : undefined,
    });

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query params" });
      return;
    }

    const matches = await fetchMatches({
      date: parsed.data.date ?? undefined,
      status: parsed.data.status ?? undefined,
      tournamentId: parsed.data.tournamentId ?? undefined,
    });

    const allTournaments = await db.select().from(tournamentsTable);
    const tMap = new Map(allTournaments.map((t) => [t.id, t]));

    const groups = groupByTournament(matches, tMap);
    const liveCount = matches.filter((m) => m.status === "live").length;

    res.json({
      groups,
      totalMatches: matches.length,
      liveCount,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list matches");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetMatchParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const matches = await fetchMatches({});
    const match = matches.find((m) => m.id === parsed.data.id);

    if (!match) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Fetch match events
    const events = await db
      .select({
        id: matchEventsTable.id,
        eventType: matchEventsTable.eventType,
        minute: matchEventsTable.minute,
        playerName: matchEventsTable.playerName,
        assistName: matchEventsTable.assistName,
        description: matchEventsTable.description,
        teamId: matchEventsTable.teamId,
        teamName: teamsTable.name,
      })
      .from(matchEventsTable)
      .leftJoin(teamsTable, eq(matchEventsTable.teamId, teamsTable.id))
      .where(eq(matchEventsTable.matchId, parsed.data.id))
      .orderBy(matchEventsTable.minute);

    res.json({
      ...match,
      events: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        minute: e.minute,
        playerName: e.playerName,
        assistName: e.assistName,
        description: e.description,
        teamId: e.teamId,
        teamName: e.teamName,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get match");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
