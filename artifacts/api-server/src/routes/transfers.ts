import { Router } from "express";
import { fetchTransfers } from "../lib/transfermarktService";

const router = Router();

// GET /transfers?league=argentina&season=2025
router.get("/", async (req, res) => {
  try {
    const league = String(req.query.league ?? "argentina");
    const season = String(req.query.season ?? "2025");
    const transfers = await fetchTransfers(league, season);
    res.json({ transfers, league, season });
  } catch (err) {
    req.log.error({ err }, "Transfers fetch failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
