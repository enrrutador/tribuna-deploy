import { Router } from "express";
import { fetchAllNews, fetchRSSNews, fetchTyCHeadlines, fetchOleHeadlines } from "../lib/newsService";

const router = Router();

// GET /news?source=all|rss|tyc|ole&team=<teamName>
router.get("/", async (req, res) => {
  try {
    const source = String(req.query.source ?? "all");
    const teamFilter = req.query.team ? String(req.query.team).toLowerCase() : null;
    let articles;

    switch (source) {
      case "rss":
        articles = await fetchRSSNews();
        break;
      case "tyc":
        articles = await fetchTyCHeadlines();
        break;
      case "ole":
        articles = await fetchOleHeadlines();
        break;
      default:
        articles = await fetchAllNews();
    }

    if (teamFilter) {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(teamFilter) ||
          a.summary.toLowerCase().includes(teamFilter)
      );
    }

    res.json({ articles, total: articles.length });
  } catch (err) {
    req.log.error({ err }, "News fetch failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
