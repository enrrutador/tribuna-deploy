import { Router } from "express";
import { fetchTeamSquad, fetchTeamRating } from "../lib/sofascoreService";
import { fetchTeamSquadTM, fetchTeamInfoTM } from "../lib/transfermarktService";

const router = Router();

// GET /squads/:teamId — auto fallback Sofascore → Transfermarkt
router.get("/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const numericId = parseInt(teamId);
    const season = (req.query.season as string) || undefined;

    // Try Sofascore first
    let squad: any[] = [];
    let rating: number | null = null;
    let source = "none";

    if (numericId) {
      try {
        const [sfSquad, sfRating] = await Promise.all([
          fetchTeamSquad(numericId),
          fetchTeamRating(numericId),
        ]);
        if (sfSquad && sfSquad.length > 0) {
          squad = sfSquad;
          rating = sfRating?.rating ?? null;
          source = "sofascore";
        }
      } catch {
        // Sofascore failed
      }
    }

    // Fallback to Transfermarkt
    if (squad.length === 0) {
      try {
        const [tmSquad, teamInfo] = await Promise.all([
          fetchTeamSquadTM(teamId, season),
          fetchTeamInfoTM(teamId, season),
        ]);
        if (tmSquad && tmSquad.length > 0) {
          squad = tmSquad;
          source = "transfermarkt";
          rating = null;
        }
      } catch {
        // TM also failed
      }
    }

    if (squad.length === 0) {
      res.status(404).json({ error: "Squad not found", squad: [], source });
      return;
    }

    res.json({ squad, rating, source });
  } catch (err) {
    req.log.error({ err, teamId: req.params.teamId }, "Squad fetch failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
