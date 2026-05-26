import { db } from "@workspace/db";
import { matchesTable } from "@workspace/db";
import { sql, max } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Keeps match dates current so the app always has data for today.
 * On startup, if today has no matches, shifts all match dates forward
 * by the number of days since the most recent match date.
 */
export async function syncMatchDatesToToday(): Promise<void> {
  try {
    const todayStr = new Date().toISOString().split("T")[0]!;

    // Count how many matches are scheduled for today
    const [todayCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matchesTable)
      .where(sql`${matchesTable.matchDate} = ${todayStr}`);

    if ((todayCount?.count ?? 0) > 0) {
      logger.info({ today: todayStr, count: todayCount?.count }, "Match dates already current");
      return;
    }

    // Find the most recent date in the DB
    const [latestRow] = await db
      .select({ latestDate: max(matchesTable.matchDate) })
      .from(matchesTable);

    const latestDateStr = latestRow?.latestDate;
    if (!latestDateStr) {
      logger.warn("No matches found in DB — skipping date sync");
      return;
    }

    const latestDate = new Date(latestDateStr + "T00:00:00Z");
    const today = new Date(todayStr + "T00:00:00Z");
    const daysDiff = Math.round((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) {
      logger.info("Match dates are ahead of today — no shift needed");
      return;
    }

    // Shift all match dates and kickoff times forward by daysDiff days
    await db.execute(
      sql`UPDATE matches SET 
        match_date = match_date + (${daysDiff} || ' days')::interval,
        kickoff_time = kickoff_time + (${daysDiff} || ' days')::interval`
    );

    logger.info({ shifted: daysDiff, from: latestDateStr, to: todayStr }, "Shifted all match dates to current week");
  } catch (err) {
    logger.error({ err }, "Failed to sync match dates");
  }
}
