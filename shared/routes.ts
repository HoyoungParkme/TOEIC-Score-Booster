import { z } from 'zod';
import { insertProgressSchema, insertQuizResultSchema, words, wordProgress, quizResults } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  words: {
    listDays: {
      method: 'GET' as const,
      path: '/api/levels/:level/days',
      responses: {
        200: z.array(z.object({
          day: z.number(),
          total: z.number(),
          known: z.number()
        })),
      },
    },
    getByDay: {
      method: 'GET' as const,
      path: '/api/levels/:level/days/:day/words',
      responses: {
        200: z.array(z.custom<typeof words.$inferSelect & { isKnown: boolean; isFavorite: boolean }>()),
      },
    },
    getAll: { // For "Test All Days"
      method: 'GET' as const,
      path: '/api/levels/:level/words', 
      responses: {
        200: z.array(z.custom<typeof words.$inferSelect & { isKnown: boolean; isFavorite: boolean }>()),
      },
    }
  },
  progress: {
    update: {
      method: 'POST' as const,
      path: '/api/progress',
      input: insertProgressSchema,
      responses: {
        200: z.custom<typeof wordProgress.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  quiz: {
    submit: {
      method: 'POST' as const,
      path: '/api/quiz',
      input: insertQuizResultSchema,
      responses: {
        201: z.custom<typeof quizResults.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/quiz/history',
      responses: {
        200: z.array(z.custom<typeof quizResults.$inferSelect>()),
      },
    }
  }
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
