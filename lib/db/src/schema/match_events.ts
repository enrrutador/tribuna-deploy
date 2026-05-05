import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { matchesTable } from "./matches";
import { teamsTable } from "./teams";

export const eventTypeEnum = pgEnum("event_type", [
  "goal",
  "owngoal",
  "yellow_card",
  "red_card",
  "substitution",
  "penalty",
  "penalty_miss",
  "var_review",
]);

export const matchEventsTable = pgTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matchesTable.id),
  teamId: integer("team_id").references(() => teamsTable.id),
  eventType: eventTypeEnum("event_type").notNull(),
  minute: integer("minute").notNull(),
  playerName: text("player_name"),
  assistName: text("assist_name"),
  description: text("description"),
});

export const insertMatchEventSchema = createInsertSchema(matchEventsTable).omit({ id: true });
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;
export type MatchEvent = typeof matchEventsTable.$inferSelect;
