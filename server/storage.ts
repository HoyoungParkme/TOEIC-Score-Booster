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
    const sampleWords900 = [
      { w: "abandon", m: "버리다, 포기하다", e: "He abandoned the plan." },
      { w: "abbreviate", m: "요약하다, 단축하다", e: "The text was abbreviated." },
      { w: "calamity", m: "재난, 불행", e: "The war was a calamity." },
      { w: "deceive", m: "속이다, 기만하다", e: "Don't try to deceive me." },
      { w: "eccentric", m: "별난, 엉뚱한", e: "His behavior is eccentric." },
      { w: "facilitate", m: "용이하게 하다", e: "Tools facilitate work." },
      { w: "garrulous", m: "수다스러운", e: "She is a garrulous woman." },
      { w: "hinder", m: "방해하다", e: "Bad weather hindered us." },
      { w: "impartial", m: "공정한", e: "A judge must be impartial." },
      { w: "jeopardize", m: "위태롭게 하다", e: "Do not jeopardize your career." },
    ];
    
    const sampleWords800 = [
      { w: "access", m: "접근, 이용", e: "I have access to the file." },
      { w: "benefit", m: "이익, 혜택", e: "The new law benefits everyone." },
      { w: "cancel", m: "취소하다", e: "The meeting was canceled." },
      { w: "deadline", m: "마감일", e: "The deadline is tomorrow." },
      { w: "efficient", m: "효율적인", e: "This method is efficient." },
      { w: "feature", m: "특징, 기능", e: "The car has many features." },
      { w: "generate", m: "생성하다", e: "Windmills generate power." },
      { w: "hire", m: "고용하다", e: "We need to hire more staff." },
      { w: "implement", m: "시행하다", e: "We implemented the plan." },
      { w: "justify", m: "정당화하다", e: "Can you justify your actions?" },
    ];

    // Generate 30 days of data for each level
    for (let day = 1; day <= 30; day++) {
      // 900 Level (add 5-10 words per day)
      sampleWords900.forEach((item, idx) => {
        seedData.push({
          level: 900,
          day: day,
          word: `${item.w} (D${day})`, // Make unique for demo
          meaningKo: item.m,
          exampleEn: item.e,
          exampleKo: "예문 해석입니다."
        });
      });

      // 800 Level
      sampleWords800.forEach((item, idx) => {
        seedData.push({
          level: 800,
          day: day,
          word: `${item.w} (D${day})`,
          meaningKo: item.m,
          exampleEn: item.e,
          exampleKo: "예문 해석입니다."
        });
      });
    }

    await db.insert(words).values(seedData);
  }
}

export const storage = new DatabaseStorage();
