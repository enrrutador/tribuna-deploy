import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamsTable = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  logoUrl: text("logo_url"),
  slug: text("slug"),
  stadium: text("stadium"),
  city: text("city"),
  country: text("country"),
  founded: integer("founded"),
  coach: text("coach"),
  description: text("description"),
});

export const insertTeamSchema = createInsertSchema(teamsTable).omit({ id: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamsTable.$inferSelect;
