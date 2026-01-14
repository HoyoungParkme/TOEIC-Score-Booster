import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWords,
  getDaysProgress,
  getWordsForDay,
  saveQuizResult,
  updateWordProgress,
  type DayProgress,
  type QuizSubmitInput,
  type UpdateProgressInput,
} from "@/lib/wordStore";

export type DayProgressStats = DayProgress;

export function useDaysList(level: number) {
  return useQuery({
    queryKey: ["days", level],
    queryFn: async () => getDaysProgress(level),
  });
}

export function useWordsByDay(level: number, day: number) {
  return useQuery({
    queryKey: ["words", level, day],
    queryFn: async () => getWordsForDay(level, day),
  });
}

export function useAllWords(level: number) {
  return useQuery({
    queryKey: ["words-all", level],
    queryFn: async () => getAllWords(level),
    enabled: false,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProgressInput) =>
      updateWordProgress(data.wordId, data.isKnown, data.isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
      queryClient.invalidateQueries({ queryKey: ["words"] });
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: QuizSubmitInput) => saveQuizResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-history"] });
    },
  });
}
