import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(), // 800 or 900
  day: integer("day").notNull(),     // 1 to 30
  word: text("word").notNull(),
  meaningKo: text("meaning_ko").notNull(),
  exampleEn: text("example_en"),
  exampleKo: text("example_ko"),
});

export const wordProgress = pgTable("word_progress", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id").notNull(), // Logically references words.id
  isKnown: boolean("is_known").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  lastStudiedAt: timestamp("last_studied_at").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  wrongWordIds: integer("wrong_word_ids").array(), // IDs of words got wrong
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertWordSchema = createInsertSchema(words).omit({ id: true });
export const insertProgressSchema = createInsertSchema(wordProgress).omit({ id: true, lastStudiedAt: true });
export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true, createdAt: true });

// === EXPLICIT API TYPES ===
export type Word = typeof words.$inferSelect;
export type WordProgress = typeof wordProgress.$inferSelect;
export type QuizResult = typeof quizResults.$inferSelect;

// Combined type for frontend convenience (Word + its progress)
export type WordWithProgress = Word & {
  isKnown: boolean;
  isFavorite: boolean;
};

// Response types
export interface DayProgress {
  day: integer;
  total: number;
  known: number;
}

export type WordsResponse = WordWithProgress[];
