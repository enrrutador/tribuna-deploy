import { pgTable, serial, text, integer, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { teamsTable } from "./teams";
import { tournamentsTable } from "./tournaments";

export const matchStatusEnum = pgEnum("match_status", ["upcoming", "live", "finished"]);

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id").notNull().references(() => teamsTable.id),
  awayTeamId: integer("away_team_id").notNull().references(() => teamsTable.id),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  kickoffTime: timestamp("kickoff_time", { withTimezone: true }).notNull(),
  status: matchStatusEnum("status").notNull().default("upcoming"),
  minute: integer("minute"),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id),
  round: text("round"),
  matchDate: date("match_date").notNull(),
  broadcastChannel: text("broadcast_channel"),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
