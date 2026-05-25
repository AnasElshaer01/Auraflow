import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mentionsTable = pgTable("mentions", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull(),
  platform: text("platform").notNull().default("reddit"),
  title: text("title").notNull(),
  body: text("body"),
  url: text("url").notNull(),
  author: text("author").notNull(),
  subreddit: text("subreddit"),
  sentiment: text("sentiment", { enum: ["positive", "neutral", "negative"] }).notNull().default("neutral"),
  sentimentScore: real("sentiment_score"),
  upvotes: integer("upvotes").notNull().default(0),
  isUrgent: boolean("is_urgent").notNull().default(false),
  isComplaint: boolean("is_complaint").notNull().default(false),
  mentionedAt: timestamp("mentioned_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMentionSchema = createInsertSchema(mentionsTable).omit({ id: true, createdAt: true });
export type InsertMention = z.infer<typeof insertMentionSchema>;
export type Mention = typeof mentionsTable.$inferSelect;
