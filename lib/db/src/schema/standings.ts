import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tournamentsTable } from "./tournaments";
import { teamsTable } from "./teams";

export const standingsTable = pgTable("standings", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournamentsTable.id),
  teamId: integer("team_id").notNull().references(() => teamsTable.id),
  position: integer("position").notNull(),
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  points: integer("points").notNull().default(0),
  form: text("form"),
});

export const insertStandingSchema = createInsertSchema(standingsTable).omit({ id: true });
export type InsertStanding = z.infer<typeof insertStandingSchema>;
export type Standing = typeof standingsTable.$inferSelect;
