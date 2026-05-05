import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tournamentCategoryEnum = pgEnum("tournament_category", [
  "destacados",
  "argentina",
  "world",
]);

export const tournamentsTable = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: tournamentCategoryEnum("category").notNull(),
  logoUrl: text("logo_url"),
  flagEmoji: text("flag_emoji"),
  description: text("description"),
  country: text("country"),
  currentChampion: text("current_champion"),
  format: text("format"),
  participantCount: integer("participant_count"),
  website: text("website"),
});

export const insertTournamentSchema = createInsertSchema(tournamentsTable).omit({ id: true });
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournamentsTable.$inferSelect;
