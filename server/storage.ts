import { db } from "./db";
import {
  words, wordProgress, quizResults,
  type Word, type WordWithProgress, type DayProgress,
  type WordProgress, type QuizResult
} from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Words & Progress
  getWordsForDay(level: number, day: number): Promise<WordWithProgress[]>;
  getAllWords(level: number): Promise<WordWithProgress[]>;
  getDaysProgress(level: number): Promise<DayProgress[]>;
  
  // Updates
  updateWordProgress(wordId: number, isKnown: boolean, isFavorite: boolean): Promise<WordProgress>;
  
  // Quiz
  saveQuizResult(result: typeof quizResults.$inferInsert): Promise<QuizResult>;
  getQuizHistory(): Promise<QuizResult[]>;

  // Seed
  seedWords(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getWordsForDay(level: number, day: number): Promise<WordWithProgress[]> {
    // Join words with progress
    const results = await db.select({
      word: words,
      progress: wordProgress
    })
    .from(words)
    .leftJoin(wordProgress, eq(words.id, wordProgress.wordId))
    .where(and(eq(words.level, level), eq(words.day, day)));

    return results.map(({ word, progress }) => ({
      ...word,
      isKnown: progress?.isKnown ?? false,
      isFavorite: progress?.isFavorite ?? false,
    }));
  }

  async getAllWords(level: number): Promise<WordWithProgress[]> {
     const results = await db.select({
      word: words,
      progress: wordProgress
    })
    .from(words)
    .leftJoin(wordProgress, eq(words.id, wordProgress.wordId))
    .where(eq(words.level, level));

    return results.map(({ word, progress }) => ({
      ...word,
      isKnown: progress?.isKnown ?? false,
      isFavorite: progress?.isFavorite ?? false,
    }));
  }

  async getDaysProgress(level: number): Promise<DayProgress[]> {
    // This is a bit complex in SQL, doing a simplified version
    // Get all words for level
    const allWords = await this.getAllWords(level);
    
    // Group by day
    const progressMap = new Map<number, { total: number, known: number }>();
    
    // Initialize for days 1-30
    for (let i = 1; i <= 30; i++) {
      progressMap.set(i, { total: 0, known: 0 });
    }

    allWords.forEach(w => {
      const entry = progressMap.get(w.day);
      if (entry) {
        entry.total++;
        if (w.isKnown) entry.known++;
      }
    });

    return Array.from(progressMap.entries()).map(([day, stats]) => ({
      day,
      total: stats.total,
      known: stats.known
    })).sort((a, b) => a.day - b.day);
  }

  async updateWordProgress(wordId: number, isKnown: boolean, isFavorite: boolean): Promise<WordProgress> {
    // Check if exists
    const existing = await db.select().from(wordProgress).where(eq(wordProgress.wordId, wordId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(wordProgress)
        .set({ isKnown, isFavorite, lastStudiedAt: new Date() })
        .where(eq(wordProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(wordProgress)
        .values({ wordId, isKnown, isFavorite, lastStudiedAt: new Date() })
        .returning();
      return created;
    }
  }

  async saveQuizResult(result: typeof quizResults.$inferInsert): Promise<QuizResult> {
    const [saved] = await db.insert(quizResults).values(result).returning();
    return saved;
  }

  async getQuizHistory(): Promise<QuizResult[]> {
    return await db.select().from(quizResults).orderBy(desc(quizResults.createdAt));
  }

  async seedWords(): Promise<void> {
    const count = await db.select({ count: sql<number>`count(*)` }).from(words);
    if (Number(count[0].count) > 0) return;

    // Seed data
    const seedData = [];
    
    // Level 900: 68 words per day
    // Level 800: 32 words per day
    
    // Better seed data for TOEIC context
    const toeicPrefixes = ["Global", "Business", "Strategic", "Innovative", "Corporate", "Financial", "Market", "Customer", "Product", "System"];
    const toeicNouns = ["Agreement", "Expansion", "Investment", "Review", "Analysis", "Proposal", "Contract", "Service", "Department", "Policy"];
    const toeicVerbs = ["increased", "finalized", "developed", "requested", "approved", "managed", "presented", "organized", "conducted", "launched"];

    for (let day = 1; day <= 30; day++) {
      // 900 Level (68 words)
      for (let i = 1; i <= 68; i++) {
        const prefix = toeicPrefixes[i % toeicPrefixes.length];
        const noun = toeicNouns[(i + day) % toeicNouns.length];
        const verb = toeicVerbs[(i * day) % toeicVerbs.length];
        seedData.push({
          level: 900,
          day: day,
          word: `${prefix} ${noun} ${i}`,
          meaningKo: `토익 900 필수 어휘 ${i}: ${prefix}한 ${noun}`,
          exampleEn: `The company ${verb} the ${prefix.toLowerCase()} ${noun.toLowerCase()}.`,
          exampleKo: `회사는 그 ${prefix.toLowerCase()}한 ${noun.toLowerCase()}을(를) ${verb}했다.`
        });
      }

      // 800 Level (32 words)
      for (let i = 1; i <= 32; i++) {
        const prefix = toeicPrefixes[(i + 5) % toeicPrefixes.length];
        const noun = toeicNouns[(i * 2) % toeicNouns.length];
        seedData.push({
          level: 800,
          day: day,
          word: `${prefix} ${noun} ${i}`,
          meaningKo: `토익 800 필수 어휘 ${i}: ${prefix}한 ${noun}`,
          exampleEn: `Please review this ${prefix.toLowerCase()} ${noun.toLowerCase()}.`,
          exampleKo: `이 ${prefix.toLowerCase()}한 ${noun.toLowerCase()}을(를) 검토해 주세요.`
        });
      }
    }

    // Insert in batches to avoid query size limits
    const batchSize = 500;
    for (let i = 0; i < seedData.length; i += batchSize) {
      await db.insert(words).values(seedData.slice(i, i + batchSize));
    }
  }
}

export const storage = new DatabaseStorage();
