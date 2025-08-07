import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCriterionSchema, insertRatingSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Criteria routes
  app.get("/api/criteria", async (req, res) => {
    try {
      const criteria = await storage.getAllCriteria();
      res.json(criteria);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch criteria" });
    }
  });

  app.post("/api/criteria", async (req, res) => {
    try {
      const validatedData = insertCriterionSchema.parse(req.body);
      const criterion = await storage.createCriterion(validatedData);
      res.status(201).json(criterion);
    } catch (error) {
      res.status(400).json({ error: "Invalid criterion data" });
    }
  });

  app.put("/api/criteria/:id", async (req, res) => {
    try {
      const updates = insertCriterionSchema.partial().parse(req.body);
      const criterion = await storage.updateCriterion(req.params.id, updates);
      if (!criterion) {
        return res.status(404).json({ error: "Criterion not found" });
      }
      res.json(criterion);
    } catch (error) {
      res.status(400).json({ error: "Invalid criterion data" });
    }
  });

  app.delete("/api/criteria/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCriterion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Criterion not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete criterion" });
    }
  });

  // States routes
  app.get("/api/states", async (req, res) => {
    try {
      const states = await storage.getAllStates();
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  app.get("/api/states/:code", async (req, res) => {
    try {
      const state = await storage.getState(req.params.code);
      if (!state) {
        return res.status(404).json({ error: "State not found" });
      }
      res.json(state);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch state" });
    }
  });

  // Ratings routes
  app.get("/api/ratings", async (req, res) => {
    try {
      const { userId, stateCode } = req.query;
      
      if (userId) {
        const ratings = await storage.getRatingsByUser(userId as string);
        return res.json(ratings);
      }
      
      if (stateCode) {
        const ratings = await storage.getRatingsByState(stateCode as string);
        return res.json(ratings);
      }
      
      const ratings = await storage.getAllRatings();
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  app.post("/api/ratings", async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body);
      
      // Check if rating already exists for this user/state/criterion combination
      const existingRating = await storage.getRating(
        validatedData.userId,
        validatedData.stateCode,
        validatedData.criterionId
      );
      
      let rating;
      if (existingRating) {
        // Update existing rating
        rating = await storage.updateRating(existingRating.id, validatedData);
      } else {
        // Create new rating
        rating = await storage.createRating(validatedData);
      }
      
      res.status(201).json(rating);
    } catch (error) {
      res.status(400).json({ error: "Invalid rating data" });
    }
  });

  app.put("/api/ratings/:id", async (req, res) => {
    try {
      const updates = insertRatingSchema.partial().parse(req.body);
      const rating = await storage.updateRating(req.params.id, updates);
      if (!rating) {
        return res.status(404).json({ error: "Rating not found" });
      }
      res.json(rating);
    } catch (error) {
      res.status(400).json({ error: "Invalid rating data" });
    }
  });

  app.delete("/api/ratings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRating(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Rating not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rating" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
