import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";
import {
  LEAGUES,
  SLUG_TO_LEAGUE,
  fetchTodayMatches,
  fetchMatchesForDate,
  fetchLiveMatches,
  fetchLeagueMatches,
  fetchMatchDetail,
  fetchMatchEvents,
  fetchMatchStats,
  fetchStandings,
  fetchScorers,
  cacheStats,
  type CategoryId,
} from "./lib/espn";
import { fetchNews } from "./lib/news";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT ?? 8787);

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "..", "dist")));

// ---------- Tournaments ----------
type TournamentEntry = {
  id: string;
  slug: string;
  name: string;
  flag: string;
  category: CategoryId;
  country: string;
};

app.get("/api/tournaments", (_req, res) => {
  const byCategory: Record<CategoryId, TournamentEntry[]> = {
    destacados: [],
    argentina: [],
    sudamerica: [],
    world: [],
  };
  for (const [id, info] of Object.entries(LEAGUES)) {
    byCategory[info.category].push({
      id,
      slug: info.slug,
      name: info.name,
      flag: info.flag,
      category: info.category,
      country: info.country,
    });
  }
  res.json(byCategory);
});

app.get("/api/tournaments/:slug", (req, res) => {
  const leagueId = SLUG_TO_LEAGUE[req.params.slug];
  if (!leagueId) {
    res.status(404).json({ error: "Torneo no encontrado" });
    return;
  }
  const info = LEAGUES[leagueId];
  res.json({
    id: leagueId,
    slug: info.slug,
    name: info.name,
    flag: info.flag,
    category: info.category,
    country: info.country,
  });
});

// ---------- Matches ----------
function groupByTournament(
  list: Awaited<ReturnType<typeof fetchTodayMatches>>
) {
  const groups = new Map<
    string,
    {
      tournament: { id: string; name: string; slug: string; category: string; flag: string };
      round: string | null;
      matches: typeof list;
    }
  >();
  for (const m of list) {
    if (!groups.has(m.leagueId)) {
      groups.set(m.leagueId, {
        tournament: {
          id: m.leagueId,
          name: m.tournamentName,
          slug: m.tournamentSlug,
          category: m.tournamentCategory,
          flag: m.tournamentFlag,
        },
        round: m.round,
        matches: [],
      });
    }
    groups.get(m.leagueId)!.matches.push(m);
  }
  return Array.from(groups.values());
}

app.get("/api/matches", async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;

    const all = date ? await fetchMatchesForDate(date) : await fetchTodayMatches();
    const filtered = status ? all.filter((m) => m.status === status) : all;

    res.json({
      groups: groupByTournament(filtered),
      totalMatches: filtered.length,
      liveCount: all.filter((m) => m.status === "live").length,
      finishedCount: all.filter((m) => m.status === "finished").length,
      upcomingCount: all.filter((m) => m.status === "upcoming").length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/matches/today", async (_req, res) => {
  try {
    const matches = await fetchTodayMatches();
    res.json({
      groups: groupByTournament(matches),
      totalMatches: matches.length,
      liveCount: matches.filter((m) => m.status === "live").length,
      finishedCount: matches.filter((m) => m.status === "finished").length,
      upcomingCount: matches.filter((m) => m.status === "upcoming").length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/matches/live", async (_req, res) => {
  try {
    const live = await fetchLiveMatches();
    res.json({
      groups: groupByTournament(live),
      totalMatches: live.length,
      liveCount: live.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/matches/:id", async (req, res) => {
  try {
    const rawId = req.params.id;
    let matchId = rawId;
    let leagueId = "";

    if (rawId.includes(":")) {
      const [lid, mid] = rawId.split(":");
      leagueId = lid!;
      matchId = mid!;
    } else {
      // Search across all leagues
      const all = await fetchTodayMatches();
      const found = all.find((m) => m.id === rawId);
      if (found) leagueId = found.leagueId;
    }

    if (!leagueId) {
      res.status(404).json({ error: "Partido no encontrado" });
      return;
    }

    const [match, events, stats] = await Promise.all([
      fetchMatchDetail(matchId, leagueId),
      fetchMatchEvents(matchId, leagueId),
      fetchMatchStats(matchId, leagueId),
    ]);

    if (!match) {
      res.status(404).json({ error: "Partido no encontrado" });
      return;
    }

    res.json({ ...match, events, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Tournament detail (fixtures + standings + scorers) ----------
app.get("/api/tournaments/:slug/fixtures", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const matches = await fetchLeagueMatches(leagueId);
    res.json({
      groups: groupByTournament(matches),
      totalMatches: matches.length,
      liveCount: matches.filter((m) => m.status === "live").length,
      finishedCount: matches.filter((m) => m.status === "finished").length,
      upcomingCount: matches.filter((m) => m.status === "upcoming").length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/tournaments/:slug/standings", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const groups = await fetchStandings(leagueId);
    res.json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/tournaments/:slug/scorers", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const scorers = await fetchScorers(leagueId);
    res.json({ scorers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Health ----------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", cache: cacheStats(), timestamp: Date.now() });
});

// ---------- News ----------
app.get("/api/news", async (_req, res) => {
  try {
    const news = await fetchNews();
    res.json({ news, count: news.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- SPA fallback ----------
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// ---------- 404 + error handler ----------
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`\n  ⚽  Tribuna API escuchando en http://localhost:${PORT}\n`);
});
