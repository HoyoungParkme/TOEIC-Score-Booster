/**
 * 모듈명: client.lib.wordStore
 * 설명: 오프라인 단어/진도/퀴즈 데이터 저장 및 조회
 * 작성일: 2025-01-13
 * 작성자: 프론트엔드 팀
 *
 * 주요 기능:
 * - 고정 단어 데이터 조회
 * - 로컬 스토리지 기반 진행/퀴즈 저장
 *
 * 의존성:
 * - 브라우저 localStorage
 */

import { wordData } from "@/lib/wordData";

export type Word = {
  id: number;
  level: number;
  day: number;
  word: string;
  meaningKo: string;
  exampleEn?: string | null;
  exampleKo?: string | null;
};

export type WordWithProgress = Word & {
  isKnown: boolean;
  isFavorite: boolean;
};

export type WordProgress = {
  wordId: number;
  isKnown: boolean;
  isFavorite: boolean;
  lastStudiedAt: string;
};

export type DayProgress = {
  day: number;
  total: number;
  known: number;
};

export type QuizSubmitInput = {
  level: number;
  score: number;
  totalQuestions: number;
  wrongWordIds?: number[];
};

export type QuizResult = QuizSubmitInput & {
  id: number;
  createdAt: string;
  wrongWordIds: number[];
};

export type UpdateProgressInput = {
  wordId: number;
  isKnown: boolean;
  isFavorite: boolean;
};

type ProgressMap = Record<string, WordProgress>;

const PROGRESS_KEY = "toeic_progress_v1";
const QUIZ_KEY = "toeic_quiz_v1";

const wordsCache = new Map<number, Word[]>();

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function getProgressMap(): ProgressMap {
  return loadJson<ProgressMap>(PROGRESS_KEY, {});
}

function setProgressMap(map: ProgressMap): void {
  saveJson(PROGRESS_KEY, map);
}

function mergeProgress(words: Word[]): WordWithProgress[] {
  const progressMap = getProgressMap();
  return words.map((word) => {
    const progress = progressMap[String(word.id)];
    return {
      ...word,
      isKnown: progress?.isKnown ?? false,
      isFavorite: progress?.isFavorite ?? false,
    };
  });
}

function getWordsByLevel(level: number): Word[] {
  if (wordsCache.has(level)) {
    return wordsCache.get(level) ?? [];
  }
  const words = wordData.filter((word) => word.level === level);
  wordsCache.set(level, words);
  return words;
}

/**
 * 전체 단어 목록을 조회합니다.
 */
export function getAllWords(level: number): WordWithProgress[] {
  return mergeProgress(getWordsByLevel(level));
}

/**
 * 특정 Day 단어 목록을 조회합니다.
 */
export function getWordsForDay(level: number, day: number): WordWithProgress[] {
  const words = getWordsByLevel(level).filter((word) => word.day === day);
  return mergeProgress(words);
}

/**
 * Day별 학습 진행률을 집계합니다.
 */
export function getDaysProgress(level: number): DayProgress[] {
  const allWords = getAllWords(level);
  const progressMap = new Map<number, { total: number; known: number }>();

  for (let day = 1; day <= 30; day += 1) {
    progressMap.set(day, { total: 0, known: 0 });
  }

  allWords.forEach((word) => {
    const entry = progressMap.get(word.day);
    if (!entry) return;
    entry.total += 1;
    if (word.isKnown) entry.known += 1;
  });

  return Array.from(progressMap.entries())
    .map(([day, stats]) => ({
      day,
      total: stats.total,
      known: stats.known,
    }))
    .sort((a, b) => a.day - b.day);
}

/**
 * 단어 학습 진행 상태를 저장합니다.
 */
export function updateWordProgress(
  wordId: number,
  isKnown: boolean,
  isFavorite: boolean,
): WordProgress {
  const map = getProgressMap();
  const updated: WordProgress = {
    wordId,
    isKnown,
    isFavorite,
    lastStudiedAt: new Date().toISOString(),
  };
  map[String(wordId)] = updated;
  setProgressMap(map);
  return updated;
}

/**
 * 퀴즈 결과를 저장합니다.
 */
export function saveQuizResult(input: QuizSubmitInput): QuizResult {
  const history = getQuizHistory();
  const result: QuizResult = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...input,
    wrongWordIds: input.wrongWordIds ?? [],
  };
  saveJson(QUIZ_KEY, [result, ...history]);
  return result;
}

/**
 * 퀴즈 히스토리를 조회합니다.
 */
export function getQuizHistory(): QuizResult[] {
  return loadJson<QuizResult[]>(QUIZ_KEY, []);
}
