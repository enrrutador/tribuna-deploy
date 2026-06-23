import { Router } from "express";
import { fetchMatchLineups, fetchH2H } from "../lib/sofascoreService";

const router = Router();

// GET /lineups/:eventId — Sofascore match lineups
router.get("/:eventId", async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const lineups = await fetchMatchLineups(eventId);
    if (!lineups) {
      res.status(404).json({ error: "Lineups not available" });
      return;
    }

    res.json(lineups);
  } catch (err) {
    req.log.error({ err }, "Lineups fetch failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /lineups/h2h/:team1Id/:team2Id
router.get("/h2h/:team1Id/:team2Id", async (req, res) => {
  try {
    const team1Id = parseInt(req.params.team1Id);
    const team2Id = parseInt(req.params.team2Id);

    if (isNaN(team1Id) || isNaN(team2Id)) {
      res.status(400).json({ error: "Invalid team IDs" });
      return;
    }

    const matches = await fetchH2H(team1Id, team2Id);
    res.json({ matches, total: matches.length });
  } catch (err) {
    req.log.error({ err }, "H2H fetch failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
