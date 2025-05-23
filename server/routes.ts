import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import chalk from "chalk";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    console.log(chalk.green("💓 Health check endpoint called"));
    return res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

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
      console.log("POST /api/users - Request body:", JSON.stringify(req.body));
      
      const userSchema = z.object({
        uid: z.string(),
        email: z.string().min(1, "Email é obrigatório"),
        name: z.string().optional().nullable(),
        photoURL: z.string().optional().nullable(),
        onboardingCompleted: z.boolean().optional()
      });
      
      try {
        const validatedData = userSchema.parse(req.body);
        console.log("Data validated successfully:", JSON.stringify(validatedData));
        
        const user = await storage.createUser(validatedData);
        console.log("User created successfully:", JSON.stringify(user));
        
        return res.status(201).json(user);
      } catch (validationError: any) {
        console.error("Validation error:", validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.errors || validationError.message 
        });
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const userData = req.body;
      
      console.log(`PUT /api/users/${uid} - Request body:`, JSON.stringify(userData));
      
      // Primeiro verificamos se o usuário existe
      let user = await storage.getUserByUid(uid);
      
      // Se o usuário não existir, vamos criar
      if (!user) {
        console.log(`User ${uid} not found, creating new user`);
        
        // Preparamos dados básicos para criar um novo usuário
        const basicUserData = {
          uid: uid,
          email: userData.email || 'user@example.com', // Precisamos de um email padrão se não tiver
          name: userData.name,
          onboardingCompleted: userData.onboardingCompleted || false
        };
        
        try {
          // Tentamos criar o usuário
          user = await storage.createUser(basicUserData);
          console.log(`User ${uid} created successfully`);
        } catch (createError: any) {
          console.error(`Error creating user ${uid}:`, createError);
          return res.status(500).json({ 
            message: "Failed to create user", 
            details: createError.message 
          });
        }
      }
      
      // Atualizamos o usuário com os dados recebidos
      const updatedUser = await storage.updateUser(uid, userData);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      console.log(`User ${uid} updated successfully`);
      return res.json(updatedUser);
    } catch (error: any) {
      console.error(`Error updating user:`, error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  // API routes for food logs
  app.get("/api/users/:uid/food-logs/:date", async (req, res) => {
    try {
      const { uid, date } = req.params;
      console.log(`GET /api/users/${uid}/food-logs/${date}`);
      
      // Verificamos se o usuário existe
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        console.log(`User ${uid} not found when getting food logs`);
        // Retornamos array vazio em vez de erro para maior robustez
        return res.json([]);
      }
      
      try {
        const foodLogs = await storage.getFoodLogsByDate(uid, date);
        console.log(`Retrieved ${foodLogs.length} food logs for user ${uid} on ${date}`);
        return res.json(foodLogs);
      } catch (dbError: any) {
        console.error(`Database error getting food logs: ${dbError.message}`);
        console.error(`Stack: ${dbError.stack}`);
        return res.status(500).json({ message: "Database error retrieving food logs", details: dbError.message });
      }
    } catch (error: any) {
      console.error(`Unexpected error getting food logs:`, error);
      console.error(`Stack: ${error.stack}`);
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:uid/food-logs", async (req, res) => {
    try {
      const { uid } = req.params;
      console.log(`POST /api/users/${uid}/food-logs - Request body:`, JSON.stringify(req.body));
      
      // Verificamos se o usuário existe
      let user = await storage.getUserByUid(uid);
      
      // Se o usuário não existe, criamos primeiro
      if (!user) {
        console.log(`User ${uid} not found when creating food log, creating user first`);
        
        // Tentamos extrair email do token ou usamos um placeholder
        const email = req.body.email || 'user@example.com';
        
        try {
          user = await storage.createUser({
            uid,
            email,
            onboardingCompleted: false
          });
          console.log(`Created user ${uid} for food log creation`);
        } catch (createError: any) {
          console.error(`Failed to create user for food log:`, createError);
          return res.status(500).json({ 
            message: "Failed to create user for food log", 
            details: createError.message 
          });
        }
      }
      
      // Validamos os dados do food log
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
      
      try {
        const validatedData = foodLogSchema.parse(req.body);
        const foodLog = await storage.createFoodLog(uid, validatedData);
        console.log(`Created food log for user ${uid}:`, JSON.stringify(foodLog));
        
        return res.status(201).json(foodLog);
      } catch (validationError: any) {
        console.error(`Validation error for food log:`, validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.errors || validationError.message 
        });
      }
    } catch (error: any) {
      console.error(`Error creating food log:`, error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/users/:uid/food-logs/:id", async (req, res) => {
    try {
      const { uid, id } = req.params;
      const foodData = req.body;
      
      console.log(`PUT /api/users/${uid}/food-logs/${id} - Request body:`, JSON.stringify(foodData));
      
      // Validate the food log data
      const foodLogSchema = z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
        mealType: z.string(),
        date: z.string()
      });
      
      try {
        const validatedData = foodLogSchema.parse(foodData);
        const updatedFoodLog = await storage.updateFoodLog(uid, parseInt(id), validatedData);
        
        if (!updatedFoodLog) {
          return res.status(404).json({ message: "Food log entry not found" });
        }
        
        console.log(`Updated food log for user ${uid}, id ${id}:`, JSON.stringify(updatedFoodLog));
        return res.json(updatedFoodLog);
      } catch (validationError: any) {
        console.error(`Validation error for food log update:`, validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.errors || validationError.message 
        });
      }
    } catch (error: any) {
      console.error(`Error updating food log:`, error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  // DELETE endpoint for food logs
  app.delete("/api/users/:uid/food-logs/:id", async (req, res) => {
    try {
      const { uid, id } = req.params;
      console.log(`DELETE /api/users/${uid}/food-logs/${id}`);
      
      // Check if user exists
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        console.log(`User ${uid} not found when deleting food log`);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Call storage method to delete the food log
      const deleted = await storage.deleteFoodLog(uid, parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Food log entry not found" });
      }
      
      console.log(`Deleted food log for user ${uid}, id ${id}`);
      return res.json({ success: true, message: "Food log deleted successfully" });
    } catch (error: any) {
      console.error(`Error deleting food log:`, error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  // API routes for weight logs
  app.get("/api/users/:uid/weight-logs", async (req, res) => {
    try {
      const { uid } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      console.log(`GET /api/users/${uid}/weight-logs - limit: ${limit}`);
      
      // Verificamos se o usuário existe
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        console.log(`User ${uid} not found when getting weight logs`);
        // Retornamos array vazio em vez de erro para maior robustez
        return res.json([]);
      }
      
      const weightLogs = await storage.getWeightLogs(uid, limit);
      console.log(`Retrieved ${weightLogs.length} weight logs for user ${uid}`);
      
      return res.json(weightLogs);
    } catch (error: any) {
      console.error(`Error getting weight logs:`, error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:uid/weight-logs", async (req, res) => {
    try {
      const { uid } = req.params;
      console.log(`POST /api/users/${uid}/weight-logs - Request body:`, JSON.stringify(req.body));
      
      // Verificamos se o usuário existe
      let user = await storage.getUserByUid(uid);
      
      // Se o usuário não existe, criamos primeiro
      if (!user) {
        console.log(`User ${uid} not found when creating weight log, creating user first`);
        
        // Tentamos extrair email do token ou usamos um placeholder
        const email = req.body.email || 'user@example.com';
        
        try {
          user = await storage.createUser({
            uid,
            email,
            onboardingCompleted: false
          });
          console.log(`Created user ${uid} for weight log creation`);
        } catch (createError: any) {
          console.error(`Failed to create user for weight log:`, createError);
          return res.status(500).json({ 
            message: "Failed to create user for weight log", 
            details: createError.message 
          });
        }
      }
      
      // Validamos os dados do weight log
      const weightLogSchema = z.object({
        date: z.string(),
        weight: z.number()
      });
      
      try {
        const validatedData = weightLogSchema.parse(req.body);
        const weightLog = await storage.createWeightLog(uid, validatedData);
        console.log(`Created weight log for user ${uid}:`, JSON.stringify(weightLog));
        
        return res.status(201).json(weightLog);
      } catch (validationError: any) {
        console.error(`Validation error for weight log:`, validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.errors || validationError.message 
        });
      }
    } catch (error: any) {
      console.error(`Error creating weight log:`, error);
      return res.status(500).json({ message: error.message });
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
  
  // API routes for saved foods
  app.get("/api/users/:uid/saved-foods", async (req, res) => {
    try {
      const { uid } = req.params;
      console.log(`GET /api/users/${uid}/saved-foods`);
      
      // Verificamos se o usuário existe
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        console.log(`User ${uid} not found when getting saved foods`);
        // Retornamos array vazio em vez de erro para maior robustez
        return res.json([]);
      }
      
      const savedFoods = await storage.getSavedFoods(uid);
      console.log(`Retrieved ${savedFoods.length} saved foods for user ${uid}`);
      
      return res.json(savedFoods);
    } catch (error: any) {
      console.error(`Error getting saved foods:`, error);
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/:uid/saved-foods", async (req, res) => {
    try {
      const { uid } = req.params;
      console.log(`POST /api/users/${uid}/saved-foods - Request body:`, JSON.stringify(req.body));
      
      // Verificamos se o usuário existe
      let user = await storage.getUserByUid(uid);
      
      // Se o usuário não existe, criamos primeiro
      if (!user) {
        console.log(`User ${uid} not found when saving food, creating user first`);
        
        // Tentamos extrair email do token ou usamos um placeholder
        const email = req.body.email || 'user@example.com';
        
        try {
          user = await storage.createUser({
            uid,
            email,
            onboardingCompleted: false
          });
          console.log(`Created user ${uid} for saving food`);
        } catch (createError: any) {
          console.error(`Failed to create user for saving food:`, createError);
          return res.status(500).json({ 
            message: "Failed to create user for saving food", 
            details: createError.message 
          });
        }
      }
      
      // Validamos os dados do alimento
      const foodSchema = z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        calories: z.number(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional()
      });
      
      try {
        const validatedData = foodSchema.parse(req.body);
        const savedFood = await storage.saveFoodItem(uid, validatedData);
        console.log(`Saved food for user ${uid}:`, JSON.stringify(savedFood));
        
        return res.status(201).json(savedFood);
      } catch (validationError: any) {
        console.error(`Validation error for saved food:`, validationError);
        return res.status(400).json({ 
          message: "Validation error", 
          details: validationError.errors || validationError.message 
        });
      }
    } catch (error: any) {
      console.error(`Error saving food:`, error);
      return res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
