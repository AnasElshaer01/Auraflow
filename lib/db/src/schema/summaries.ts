import { pgTable, text, serial, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const summariesTable = pgTable("summaries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  content: text("content").notNull(),
  topMentions: text("top_mentions").notNull(),
  mainComplaints: text("main_complaints").notNull(),
  trendingDiscussions: text("trending_discussions").notNull(),
  sentimentOverview: text("sentiment_overview").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSummarySchema = createInsertSchema(summariesTable).omit({ id: true, createdAt: true });
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summariesTable.$inferSelect;
