import { Router } from "express";
import { db } from "@workspace/db";
import { tournamentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetTournamentParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const all = await db.select().from(tournamentsTable).orderBy(tournamentsTable.id);

    const destacados = all.filter((t) => t.category === "destacados");
    const argentina = all.filter((t) => t.category === "argentina");
    const world = all.filter((t) => t.category === "world");

    res.json({ destacados, argentina, world });
  } catch (err) {
    req.log.error({ err }, "Failed to list tournaments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const parsed = GetTournamentParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [tournament] = await db
      .select()
      .from(tournamentsTable)
      .where(eq(tournamentsTable.id, parsed.data.id))
      .limit(1);

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

export default router;
