import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for users
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(user);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const userSchema = z.object({
        uid: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
        photoURL: z.string().optional(),
        onboardingCompleted: z.boolean().optional()
      });
      
      const validatedData = userSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(uid, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(updatedUser);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  // API routes for food logs
  app.get("/api/users/:uid/food-logs/:date", async (req, res) => {
    try {
      const { uid, date } = req.params;
      const foodLogs = await storage.getFoodLogsByDate(uid, date);
      
      return res.json(foodLogs);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:uid/food-logs", async (req, res) => {
    try {
      const { uid } = req.params;
      const foodLogSchema = z.object({
        date: z.string(),
        mealType: z.string(),
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional()
      });
      
      const validatedData = foodLogSchema.parse(req.body);
      const foodLog = await storage.createFoodLog(uid, validatedData);
      
      return res.status(201).json(foodLog);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });
  
  // API routes for weight logs
  app.get("/api/users/:uid/weight-logs", async (req, res) => {
    try {
      const { uid } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const weightLogs = await storage.getWeightLogs(uid, limit);
      
      return res.json(weightLogs);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:uid/weight-logs", async (req, res) => {
    try {
      const { uid } = req.params;
      const weightLogSchema = z.object({
        date: z.string(),
        weight: z.number()
      });
      
      const validatedData = weightLogSchema.parse(req.body);
      const weightLog = await storage.createWeightLog(uid, validatedData);
      
      return res.status(201).json(weightLog);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Mock Stripe payment endpoints
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      // Mock payment intent
      const clientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.json({ 
        clientSecret,
        amount,
        status: "requires_payment_method"
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/get-subscription-status", async (req, res) => {
    try {
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Mocked subscription data
      const subscription = {
        id: user.stripeSubscriptionId || "sub_mock",
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        items: {
          data: [{
            price: {
              product: "prod_mock",
              unit_amount: 1490,
              currency: "brl",
              recurring: {
                interval: "month"
              }
            }
          }]
        }
      };
      
      return res.json({ subscription });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/get-or-create-subscription", async (req, res) => {
    try {
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create a mock client secret for the subscription
      const clientSecret = `seti_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
      const subscriptionId = `sub_mock_${Date.now()}`;
      
      // Update user with mock Stripe info
      await storage.updateUserStripeInfo(uid, {
        stripeCustomerId: `cus_mock_${Date.now()}`,
        stripeSubscriptionId: subscriptionId
      });
      
      return res.json({
        subscriptionId,
        clientSecret
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
