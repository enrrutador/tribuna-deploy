import { Router } from "express";
import { searchPlayer } from "../lib/sofascoreService";
import { searchPlayersTM, TM_TEAM_SLUGS } from "../lib/transfermarktService";
import { ESPN_LEAGUES } from "../lib/espnService";

const router = Router();

function espnIdToName(id: string): { name: string; slug: string } | null {
  const slug = TM_TEAM_SLUGS[id];
  if (!slug) return null;
  const name = slug.split("/")[0]!.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { name, slug: slug.split("/")[0]! };
}

router.get("/", async (req, res) => {
  try {
    const q = (req.query.q as string ?? "").trim().toLowerCase();
    if (!q || q.length < 2) {
      return res.json({ players: [], teams: [], leagues: [] });
    }

    const [playerResults, tmResults] = await Promise.allSettled([
      searchPlayer(q),
      searchPlayersTM(q),
    ]);

    const players: any[] = [];
    if (playerResults.status === "fulfilled") {
      players.push(...playerResults.value);
    }
    if (tmResults.status === "fulfilled") {
      for (const tm of tmResults.value) {
        if (!players.some((p) => p.id === tm.id)) {
          players.push(tm);
        }
      }
    }

    // Search teams from TM_TEAM_SLUGS
    const teams = Object.entries(TM_TEAM_SLUGS)
      .filter(([_, slug]) => slug.toLowerCase().includes(q))
      .map(([id, slug]) => {
        const name = slug.split("/")[0]!.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const tmId = slug.match(/verein\/(\d+)/)?.[1] ?? id;
        return { id, name, slug: slug.split("/")[0]!, tmId };
      });

    // Search leagues from ESPN_LEAGUES
    const leagueEntries = Object.entries(ESPN_LEAGUES);
    const leagues = leagueEntries
      .filter(([_, league]) => {
        const name = (league.name ?? "").toLowerCase();
        const slug = (league.slug ?? "").toLowerCase();
        return name.includes(q) || slug.includes(q);
      })
      .map(([id, league]) => ({
        id,
        name: league.name ?? id,
        slug: league.slug ?? id,
        country: (league as any).country ?? null,
        flagEmoji: (league as any).flagEmoji ?? null,
      }));

    return res.json({ players, teams, leagues });
  } catch (err) {
    req.log.error({ err }, "Global search failed");
    return res.status(500).json({ error: "Search failed" });
  }
});

export default router;
