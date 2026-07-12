import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
  fetchTeamData,
  fetchRounds,
  fetchTeamStats,
  fetchMatchSummary,
  fetchTeamSchedule,
  cacheStats,
} from "./lib/espn.js";
import { fetchBrackets } from "./lib/promiedos.js";
import { fetchNews } from "./lib/news.js";
import { fetchTrending, fetchTrendingTopic, trendingToRSS } from "./lib/trending.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const isProduction = process.env.NODE_ENV === "production";

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

if (isProduction) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
}

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
      const all = await fetchTodayMatches();
      let found = all.find((m) => m.id === rawId);
      if (!found) {
        const mundialMatches = await fetchLeagueMatches("fifa.world");
        found = mundialMatches.find((m) => m.id === rawId);
      }
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

// ---------- Tournament detail ----------
app.get("/api/tournaments/:slug/fixtures", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const round = req.query.round as string | undefined;
    const matches = await fetchLeagueMatches(leagueId, undefined, round);
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

app.get("/api/tournaments/:slug/rounds", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const rounds = await fetchRounds(leagueId);
    res.json({ rounds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/tournaments/:slug/team-stats", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const teamStats = await fetchTeamStats(leagueId);
    res.json(teamStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Team data (Promiedos) ----------
app.get("/api/teams/:teamId", async (req, res) => {
  try {
    const teamData = await fetchTeamData(req.params.teamId);
    if (!teamData) {
      res.status(404).json({ error: "Equipo no encontrado" });
      return;
    }
    res.json(teamData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Match Summary (goals, cards, lineups, H2H, stats) ----------
app.get("/api/matches/:id/summary", async (req, res) => {
  try {
    const rawId = req.params.id;
    let matchId = rawId;
    let leagueId = "";

    if (rawId.includes(":")) {
      const [lid, mid] = rawId.split(":");
      leagueId = lid!;
      matchId = mid!;
    } else {
      const all = await fetchTodayMatches();
      const found = all.find((m) => m.id === rawId);
      if (found) leagueId = found.leagueId;
    }

    if (!leagueId) {
      // Try to find league from all leagues
      const all = await fetchTodayMatches();
      for (const m of all) {
        if (m.id === rawId) { leagueId = m.leagueId; break; }
      }
    }

    if (!leagueId) {
      res.status(404).json({ error: "Partido no encontrado" });
      return;
    }

    const summary = await fetchMatchSummary(matchId, leagueId);
    if (!summary) {
      res.status(404).json({ error: "Resumen no disponible" });
      return;
    }
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Team Schedule ----------
app.get("/api/teams/:teamId/schedule", async (req, res) => {
  try {
    const leagueId = req.query.league as string ?? "arg.1";
    const schedule = await fetchTeamSchedule(req.params.teamId, leagueId);
    res.json({ schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Tournament Brackets (knockout rounds) ----------
app.get("/api/tournaments/:slug/brackets", async (req, res) => {
  try {
    const leagueId = SLUG_TO_LEAGUE[req.params.slug];
    if (!leagueId) {
      res.status(404).json({ error: "Torneo no encontrado" });
      return;
    }
    const brackets = await fetchBrackets(leagueId);
    if (!brackets) {
      res.json({ stages: [] });
      return;
    }
    res.json(brackets);
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
app.get("/api/news", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const allNews = await fetchNews();
    const news = category && category !== "general"
      ? allNews.filter((n) => n.category === category)
      : allNews;
    res.json({ news, count: news.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Trending ----------
app.get("/api/trending", async (_req, res) => {
  try {
    const trending = await fetchTrending();
    res.json(trending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/trending/rss", async (_req, res) => {
  try {
    const trending = await fetchTrending();
    const rss = trendingToRSS(trending.items);
    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.send(rss);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.get("/api/trending/:slug", async (req, res) => {
  try {
    const topic = await fetchTrendingTopic(req.params.slug);
    if (!topic) return res.status(404).json({ error: "Tema no encontrado" });
    res.json(topic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------- Dynamic Sitemap ----------
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const trending = await fetchTrending();
    const base = "https://tribuna-8b8r.onrender.com";

    const tournamentSlugs = Object.keys(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      await import("./lib/espn.js").then((m) => m.LEAGUES)
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/live</loc>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${base}/tournaments</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${base}/tendencias</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;

    for (const slug of tournamentSlugs) {
      xml += `
  <url>
    <loc>${base}/tournament/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    for (const topic of trending.topics.slice(0, 20)) {
      xml += `
  <url>
    <loc>${base}/tendencias/${topic.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    xml += "\n</urlset>";

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating sitemap");
  }
});

// ---------- RSS Feed ----------
app.get("/feed.xml", async (_req, res) => {
  try {
    const trending = await fetchTrending();
    const rss = trendingToRSS(trending.items);
    res.set("Content-Type", "application/rss+xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=1800");
    res.send(rss);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// ---------- 404 API + error handler ----------
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// SPA fallback: any non-API route → index.html
if (isProduction) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

const server = app.listen(PORT, () => {
  console.log(`\n  ⚽  Tribuna API escuchando en http://localhost:${PORT}\n`);
});

server.on("error", (err: Error) => {
  console.error("[server] Listen error:", err);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error("[process] Uncaught exception:", err);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[process] Unhandled rejection:", reason);
});
