import { Router } from "express";
import {
  fetchTodayMatches,
  fetchLeagueMatches,
  fetchMatchEvents,
  ESPN_LEAGUES,
  SLUG_TO_LEAGUE,
  type EspnMatch,
} from "../lib/espnService";

const router = Router();

function formatMatch(m: EspnMatch) {
  return {
    id: m.id,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.shortName,
      logoUrl: m.homeTeam.logoUrl,
      color: m.homeTeam.color,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.shortName,
      logoUrl: m.awayTeam.logoUrl,
      color: m.awayTeam.color,
    },
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

function groupByTournament(matches: EspnMatch[]) {
  const groups = new Map<string, { tournament: { id: string; name: string; slug: string; category: string; flagEmoji: string }; round: string | null; matches: ReturnType<typeof formatMatch>[] }>();

  for (const m of matches) {
    if (!groups.has(m.leagueId)) {
      groups.set(m.leagueId, {
        tournament: {
          id: m.leagueId,
          name: m.tournamentName,
          slug: m.tournamentSlug,
          category: m.tournamentCategory,
          flagEmoji: m.tournamentFlag,
        },
        round: m.round,
        matches: [],
      });
    }
    groups.get(m.leagueId)!.matches.push(formatMatch(m));
  }

  return Array.from(groups.values());
}

// GET /matches/today
router.get("/today", async (req, res) => {
  try {
    const matches = await fetchTodayMatches();
    const groups = groupByTournament(matches);
    const liveCount = matches.filter((m) => m.status === "live").length;
    const finishedCount = matches.filter((m) => m.status === "finished").length;
    const upcomingCount = matches.filter((m) => m.status === "upcoming").length;
    const today = new Date().toISOString().split("T")[0];

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

// GET /matches/live
router.get("/live", async (req, res) => {
  try {
    const all = await fetchTodayMatches();
    const live = all.filter((m) => m.status === "live");
    const groups = groupByTournament(live);

    res.json({ groups, totalMatches: live.length, liveCount: live.length });
  } catch (err) {
    req.log.error({ err }, "Failed to get live matches");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /matches  (with optional ?status= and ?date= filters)
router.get("/", async (req, res) => {
  try {
    const { status, date } = req.query as { status?: string; date?: string };

    const all = await fetchTodayMatches();
    let matches = all;

    if (date) {
      matches = matches.filter((m) => m.kickoffTime.startsWith(date));
    }
    if (status) {
      matches = matches.filter((m) => m.status === status);
    }

    const groups = groupByTournament(matches);
    const liveCount = matches.filter((m) => m.status === "live").length;

    res.json({
      groups,
      totalMatches: matches.length,
      liveCount,
      finishedCount: matches.filter((m) => m.status === "finished").length,
      upcomingCount: matches.filter((m) => m.status === "upcoming").length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list matches");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /matches/:id  (ESPN match id, prefixed by leagueId with colon e.g. "conmebol.libertadores:401865560")
router.get("/:id", async (req, res) => {
  try {
    const rawId = req.params.id;

    // Find the match across all leagues
    const allLeagues = Object.keys(ESPN_LEAGUES);
    let found: EspnMatch | null = null;
    let foundLeagueId = "";

    // Support "leagueId:matchId" format
    if (rawId.includes(":")) {
      const [leagueId, matchId] = rawId.split(":");
      const matches = await fetchLeagueMatches(leagueId!);
      found = matches.find((m) => m.id === matchId) ?? null;
      foundLeagueId = leagueId!;
    } else {
      // Search all leagues
      const results = await Promise.allSettled(
        allLeagues.map(async (lid) => {
          const ms = await fetchLeagueMatches(lid);
          const m = ms.find((m) => m.id === rawId);
          return m ? { match: m, leagueId: lid } : null;
        })
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          found = r.value.match;
          foundLeagueId = r.value.leagueId;
          break;
        }
      }
    }

    if (!found) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const events = await fetchMatchEvents(found.id, foundLeagueId);

    res.json({
      ...formatMatch(found),
      events: events.map((e) => ({
        id: e.id,
        eventType: e.type,
        minute: parseInt(e.minute) || 0,
        playerName: e.playerName,
        assistName: e.assistName,
        teamId: e.teamId,
        teamName: e.teamName,
        text: e.text,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get match");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
