import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tournamentsTable } from "./tournaments";
import { teamsTable } from "./teams";
import { playersTable } from "./players";

export const scorersTable = pgTable("scorers", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id),
  playerId: integer("player_id").notNull().references(() => playersTable.id),
  teamId: integer("team_id").notNull().references(() => teamsTable.id),
  position: integer("position").notNull(),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  played: integer("played").notNull().default(0),
});

export const insertScorerSchema = createInsertSchema(scorersTable).omit({ id: true });
export type InsertScorer = z.infer<typeof insertScorerSchema>;
export type Scorer = typeof scorersTable.$inferSelect;
