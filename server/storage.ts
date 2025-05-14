import { users, User, InsertUser, foodLogs, FoodLog, InsertFoodLog, weightLogs, WeightLog, InsertWeightLog } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
    
    const [user] = await db.insert(users).values({
      uid: userData.uid!,
      email: userData.email!,
      name: userData.name || null,
      photoURL: userData.photoURL || null,
      age: userData.age || null,
      gender: userData.gender || null,
      height: userData.height || null,
      weight: userData.weight || null,
      profession: userData.profession || null,
      targetWeight: userData.targetWeight || null,
      targetBodyFat: userData.targetBodyFat || null,
      activityLevel: userData.activityLevel || null,
      goal: userData.goal || null,
      calories: userData.calories || null,
      protein: userData.protein || null,
      carbs: userData.carbs || null,
      fat: userData.fat || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      stripeSubscriptionId: userData.stripeSubscriptionId || null,
      onboardingCompleted: userData.onboardingCompleted || false,
      createdAt: now,
      updatedAt: now
    }).returning();
    
    return user;
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return undefined;
    }
    
    const [updatedUser] = await db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
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
    
    // Use SQL query to handle date comparison
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const foodLogsResult = await db.query.foodLogs.findMany({
      where: (foodLog, { eq, and }) => 
        and(
          eq(foodLog.userId, user.id),
          eq(foodLog.date, formattedDate)
        )
    });
    
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
    
    const [foodLog] = await db.insert(foodLogs)
      .values({
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
      })
      .returning();
    
    return foodLog;
  }

  // Weight log methods
  async getWeightLogs(uid: string, limit?: number): Promise<WeightLog[]> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return [];
    }
    
    const query = db.select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, user.id))
      .orderBy(desc(weightLogs.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    const weightLogsResult = await query;
    
    return weightLogsResult;
  }

  async createWeightLog(uid: string, weightLogData: Partial<InsertWeightLog>): Promise<WeightLog> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const dateValue = weightLogData.date ? new Date(weightLogData.date) : new Date();
    
    const [weightLog] = await db.insert(weightLogs)
      .values({
        userId: user.id,
        date: dateValue,
        weight: weightLogData.weight!,
      })
      .returning();
    
    // Update the user's current weight
    await this.updateUser(uid, { weight: weightLogData.weight });
    
    return weightLog;
  }
}

export const storage = new DatabaseStorage();
