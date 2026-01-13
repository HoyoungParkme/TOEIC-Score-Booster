import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertProgressSchema, insertQuizResultSchema, type WordWithProgress } from "@shared/schema";
import type { z } from "zod";

// Types derived from schema/routes
export type DayProgressStats = {
  day: number;
  total: number;
  known: number;
};

// GET /api/levels/:level/days
export function useDaysList(level: number) {
  return useQuery({
    queryKey: [api.words.listDays.path, level],
    queryFn: async () => {
      const url = buildUrl(api.words.listDays.path, { level });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch days");
      return api.words.listDays.responses[200].parse(await res.json());
    },
  });
}

// GET /api/levels/:level/days/:day/words
export function useWordsByDay(level: number, day: number) {
  return useQuery({
    queryKey: [api.words.getByDay.path, level, day],
    queryFn: async () => {
      const url = buildUrl(api.words.getByDay.path, { level, day });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch words");
      return api.words.getByDay.responses[200].parse(await res.json());
    },
  });
}

// GET /api/levels/:level/words (All words for "Test All")
export function useAllWords(level: number) {
  return useQuery({
    queryKey: [api.words.getAll.path, level],
    queryFn: async () => {
      const url = buildUrl(api.words.getAll.path, { level });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch all words");
      return api.words.getAll.responses[200].parse(await res.json());
    },
    enabled: false, // Don't fetch automatically, only when needed for big test
  });
}

// POST /api/progress
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertProgressSchema>) => {
      const res = await fetch(api.progress.update.path, {
        method: api.progress.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return api.progress.update.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: [api.words.listDays.path] });
      queryClient.invalidateQueries({ queryKey: [api.words.getByDay.path] });
      // Optimistic updates could be added here for even faster feel
    },
  });
}

// POST /api/quiz
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertQuizResultSchema>) => {
      const res = await fetch(api.quiz.submit.path, {
        method: api.quiz.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      return api.quiz.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quiz.history.path] });
    },
  });
}
