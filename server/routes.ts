import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  await storage.seedWords();

  // Words API
  app.get(api.words.listDays.path, async (req, res) => {
    const level = parseInt(req.params.level);
    const progress = await storage.getDaysProgress(level);
    res.json(progress);
  });

  app.get(api.words.getByDay.path, async (req, res) => {
    const level = parseInt(req.params.level);
    const day = parseInt(req.params.day);
    const words = await storage.getWordsForDay(level, day);
    res.json(words);
  });

  app.get(api.words.getAll.path, async (req, res) => {
    const level = parseInt(req.params.level);
    const words = await storage.getAllWords(level);
    res.json(words);
  });

  // Progress API
  app.post(api.progress.update.path, async (req, res) => {
    const { wordId, isKnown, isFavorite } = api.progress.update.input.parse(req.body);
    const updated = await storage.updateWordProgress(wordId, isKnown ?? false, isFavorite ?? false);
    res.json(updated);
  });

  // Quiz API
  app.post(api.quiz.submit.path, async (req, res) => {
    const input = api.quiz.submit.input.parse(req.body);
    const result = await storage.saveQuizResult(input);
    res.status(201).json(result);
  });

  app.get(api.quiz.history.path, async (req, res) => {
    const history = await storage.getQuizHistory();
    res.json(history);
  });

  return httpServer;
}
