import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, optionalAuth, AuthenticatedRequest } from "./middleware/auth";
import { insertCriterionSchema, insertRatingSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes - authenticated
  app.get("/api/users", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:username", authenticateUser, async (req: AuthenticatedRequest, res) => {
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

  // Criteria routes - user-specific
  app.get("/api/criteria", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const criteria = await storage.getCriteriaByUser(req.user!.uid);
      res.json(criteria);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch criteria" });
    }
  });

  app.post("/api/criteria", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCriterionSchema.omit({ userId: true }).parse(req.body);
      const criterion = await storage.createCriterion({
        ...validatedData,
        userId: req.user!.uid,
      });
      res.status(201).json(criterion);
    } catch (error) {
      res.status(400).json({ error: "Invalid criterion data" });
    }
  });

  app.put("/api/criteria/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // First check if the criterion belongs to the user
      const existingCriterion = await storage.getCriterion(req.params.id);
      if (!existingCriterion || existingCriterion.userId !== req.user!.uid) {
        return res.status(404).json({ error: "Criterion not found" });
      }
      
      const updates = insertCriterionSchema.omit({ userId: true }).partial().parse(req.body);
      const criterion = await storage.updateCriterion(req.params.id, updates);
      if (!criterion) {
        return res.status(404).json({ error: "Criterion not found" });
      }
      res.json(criterion);
    } catch (error) {
      res.status(400).json({ error: "Invalid criterion data" });
    }
  });

  app.delete("/api/criteria/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // First check if the criterion belongs to the user
      const existingCriterion = await storage.getCriterion(req.params.id);
      if (!existingCriterion || existingCriterion.userId !== req.user!.uid) {
        return res.status(404).json({ error: "Criterion not found" });
      }
      
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

  // Ratings routes - user-specific
  app.get("/api/ratings", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { stateCode } = req.query;
      
      if (stateCode) {
        const ratings = await storage.getRatingsByState(stateCode as string);
        // Filter to only show the authenticated user's ratings
        const userRatings = ratings.filter(r => r.userId === req.user!.uid);
        return res.json(userRatings);
      }
      
      // Always return only the authenticated user's ratings
      const ratings = await storage.getRatingsByUser(req.user!.uid);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  app.post("/api/ratings", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertRatingSchema.omit({ userId: true }).parse(req.body);
      const ratingData = {
        ...validatedData,
        userId: req.user!.uid,
      };
      
      // Check if rating already exists for this user/state/criterion combination
      const existingRating = await storage.getRating(
        ratingData.userId,
        ratingData.stateCode,
        ratingData.criterionId
      );
      
      let rating;
      if (existingRating) {
        // Update existing rating
        rating = await storage.updateRating(existingRating.id, ratingData);
      } else {
        // Create new rating
        rating = await storage.createRating(ratingData);
      }
      
      res.status(201).json(rating);
    } catch (error) {
      res.status(400).json({ error: "Invalid rating data" });
    }
  });

  app.put("/api/ratings/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // First check if the rating belongs to the user
      const existingRating = await storage.getRatingById(req.params.id);
      if (!existingRating || existingRating.userId !== req.user!.uid) {
        return res.status(404).json({ error: "Rating not found" });
      }
      
      const updates = insertRatingSchema.omit({ userId: true }).partial().parse(req.body);
      const rating = await storage.updateRating(req.params.id, updates);
      if (!rating) {
        return res.status(404).json({ error: "Rating not found" });
      }
      res.json(rating);
    } catch (error) {
      res.status(400).json({ error: "Invalid rating data" });
    }
  });

  app.delete("/api/ratings/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // First check if the rating belongs to the user
      const existingRating = await storage.getRatingById(req.params.id);
      if (!existingRating || existingRating.userId !== req.user!.uid) {
        return res.status(404).json({ error: "Rating not found" });
      }
      
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
