import { users, User, InsertUser, foodLogs, FoodLog, InsertFoodLog, weightLogs, WeightLog, InsertWeightLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: Partial<InsertUser>): Promise<User>;
  updateUser(uid: string, userData: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(uid: string, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined>;
  
  // Food log methods
  getFoodLogsByDate(uid: string, date: string): Promise<FoodLog[]>;
  createFoodLog(uid: string, foodLog: Partial<InsertFoodLog>): Promise<FoodLog>;
  
  // Weight log methods
  getWeightLogs(uid: string, limit?: number): Promise<WeightLog[]>;
  createWeightLog(uid: string, weightLog: Partial<InsertWeightLog>): Promise<WeightLog>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
    return user;
  }

  async createUser(userData: Partial<InsertUser>): Promise<User> {
    const now = new Date();
    
    // Criando um objeto de inserção limpo, mapeando explicitamente cada campo
    const insertData: Record<string, any> = {
      uid: userData.uid!,
      email: userData.email!,
      
      // Campos básicos
      name: userData.name || null,
      photo_url: userData.photoURL || userData.photo_url || null,
      
      // Campos de informações pessoais
      age: userData.age || null,
      gender: userData.gender || null,
      height: userData.height || null,
      weight: userData.weight || null,
      profession: userData.profession || null,
      
      // Campos específicos que podem vir em ambos os formatos (camelCase e snake_case)
      target_weight: userData.targetWeight || userData.target_weight || null,
      target_body_fat: userData.targetBodyFat || userData.target_body_fat || null,
      activity_level: userData.activityLevel || userData.activity_level || null,
      
      goal: userData.goal || null,
      calories: userData.calories || null,
      protein: userData.protein || null,
      carbs: userData.carbs || null,
      fat: userData.fat || null,
      
      // Campos de Stripe
      stripe_customer_id: userData.stripeCustomerId || userData.stripe_customer_id || null,
      stripe_subscription_id: userData.stripeSubscriptionId || userData.stripe_subscription_id || null,
      
      // Conversão explícita para boolean
      onboarding_completed: Boolean(userData.onboardingCompleted || userData.onboarding_completed || false),
      
      // Timestamps
      created_at: now,
      updated_at: now
    };
    
    // Log para depuração
    console.log("Data validated successfully:", insertData);
    
    // Inserir usuário
    const [user] = await db.insert(users).values(insertData).returning();
    
    console.log("User created successfully:", user);
    return user;
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return undefined;
    }
    
    // Vamos transformar o objeto para garantir que os campos estejam no formato correto
    const formattedData: Record<string, any> = {};
    
    // Adicionando manualmente cada campo para garantir que estejam no formato correto
    if ('name' in userData) formattedData.name = userData.name;
    if ('email' in userData) formattedData.email = userData.email;
    if ('photo_url' in userData) formattedData.photo_url = userData.photo_url;
    if ('photoURL' in userData) formattedData.photo_url = userData.photoURL;
    if ('age' in userData) formattedData.age = userData.age;
    if ('gender' in userData) formattedData.gender = userData.gender;
    if ('height' in userData) formattedData.height = userData.height;
    if ('weight' in userData) formattedData.weight = userData.weight;
    if ('profession' in userData) formattedData.profession = userData.profession;
    
    // Campos com snake_case
    if ('target_weight' in userData) formattedData.target_weight = userData.target_weight;
    if ('targetWeight' in userData) formattedData.target_weight = userData.targetWeight;
    
    if ('target_body_fat' in userData) formattedData.target_body_fat = userData.target_body_fat;
    if ('targetBodyFat' in userData) formattedData.target_body_fat = userData.targetBodyFat;
    
    if ('activity_level' in userData) formattedData.activity_level = userData.activity_level;
    if ('activityLevel' in userData) formattedData.activity_level = userData.activityLevel;
    
    if ('goal' in userData) formattedData.goal = userData.goal;
    if ('calories' in userData) formattedData.calories = userData.calories;
    if ('protein' in userData) formattedData.protein = userData.protein;
    if ('carbs' in userData) formattedData.carbs = userData.carbs;
    if ('fat' in userData) formattedData.fat = userData.fat;
    
    if ('stripe_customer_id' in userData) formattedData.stripe_customer_id = userData.stripe_customer_id;
    if ('stripeCustomerId' in userData) formattedData.stripe_customer_id = userData.stripeCustomerId;
    
    if ('stripe_subscription_id' in userData) formattedData.stripe_subscription_id = userData.stripe_subscription_id;
    if ('stripeSubscriptionId' in userData) formattedData.stripe_subscription_id = userData.stripeSubscriptionId;
    
    // Conversão manual e explícita do booleano
    if ('onboarding_completed' in userData) {
      formattedData.onboarding_completed = Boolean(userData.onboarding_completed);
    }
    if ('onboardingCompleted' in userData) {
      formattedData.onboarding_completed = Boolean(userData.onboardingCompleted);
    }
    
    // Adicionar timestamp de atualização
    formattedData.updatedAt = new Date();
    
    console.log("Formatted data for database:", formattedData);
    
    const [updatedUser] = await db.update(users)
      .set(formattedData)
      .where(eq(users.uid, uid))
      .returning();
    
    return updatedUser;
  }

  async updateUserStripeInfo(uid: string, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return undefined;
    }
    
    const [updatedUser] = await db.update(users)
      .set({
        stripeCustomerId: stripeInfo.stripeCustomerId,
        stripeSubscriptionId: stripeInfo.stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.uid, uid))
      .returning();
    
    return updatedUser;
  }

  // Food log methods
  async getFoodLogsByDate(uid: string, date: string): Promise<FoodLog[]> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return [];
    }
    
    // Use SQL query for date comparison
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const foodLogsResult = await db.select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, user.id),
          sql`${foodLogs.date}::text = ${formattedDate}`
        )
      );
    
    return foodLogsResult;
  }

  async createFoodLog(uid: string, foodLogData: Partial<InsertFoodLog>): Promise<FoodLog> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Format date as ISO string
    const dateStr = foodLogData.date 
      ? new Date(foodLogData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    // Create the food log
    const insertValues = {
      userId: user.id,
      date: dateStr,
      mealType: foodLogData.mealType!,
      name: foodLogData.name!,
      quantity: foodLogData.quantity!,
      unit: foodLogData.unit!,
      calories: foodLogData.calories!,
      protein: foodLogData.protein || 0,
      carbs: foodLogData.carbs || 0,
      fat: foodLogData.fat || 0,
    };
    
    const [foodLog] = await db.insert(foodLogs)
      .values(insertValues)
      .returning();
    
    return foodLog;
  }

  // Weight log methods
  async getWeightLogs(uid: string, limit?: number): Promise<WeightLog[]> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return [];
    }
    
    const weightLogsResult = await db.query.weightLogs.findMany({
      where: (weightLog, { eq }) => eq(weightLog.userId, user.id),
      orderBy: (weightLog, { desc }) => [desc(weightLog.date)],
      limit: limit || undefined
    });
    
    return weightLogsResult;
  }

  async createWeightLog(uid: string, weightLogData: Partial<InsertWeightLog>): Promise<WeightLog> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Format date as ISO string
    const dateStr = weightLogData.date 
      ? new Date(weightLogData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    // Create the weight log
    const insertValues = {
      userId: user.id,
      date: dateStr,
      weight: weightLogData.weight!,
    };
    
    const [weightLog] = await db.insert(weightLogs)
      .values(insertValues)
      .returning();
    
    // Update the user's current weight
    await this.updateUser(uid, { weight: weightLogData.weight });
    
    return weightLog;
  }
}

export const storage = new DatabaseStorage();
