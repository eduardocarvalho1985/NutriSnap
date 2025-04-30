import { users, User, InsertUser, foodLogs, FoodLog, InsertFoodLog, weightLogs, WeightLog, InsertWeightLog } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foodLogs: Map<number, FoodLog>;
  private weightLogs: Map<number, WeightLog>;
  private userIdCounter: number;
  private foodLogIdCounter: number;
  private weightLogIdCounter: number;

  constructor() {
    this.users = new Map();
    this.foodLogs = new Map();
    this.weightLogs = new Map();
    this.userIdCounter = 1;
    this.foodLogIdCounter = 1;
    this.weightLogIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async createUser(userData: Partial<InsertUser>): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      id,
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
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(uid: string, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId,
      updatedAt: new Date()
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  // Food log methods
  async getFoodLogsByDate(uid: string, date: string): Promise<FoodLog[]> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return [];
    }
    
    return Array.from(this.foodLogs.values())
      .filter(log => log.userId === user.id && log.date.toString() === date);
  }

  async createFoodLog(uid: string, foodLogData: Partial<InsertFoodLog>): Promise<FoodLog> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const id = this.foodLogIdCounter++;
    const now = new Date();
    
    const foodLog: FoodLog = {
      id,
      userId: user.id,
      date: new Date(foodLogData.date!),
      mealType: foodLogData.mealType!,
      name: foodLogData.name!,
      quantity: foodLogData.quantity!,
      unit: foodLogData.unit!,
      calories: foodLogData.calories!,
      protein: foodLogData.protein || 0,
      carbs: foodLogData.carbs || 0,
      fat: foodLogData.fat || 0,
      createdAt: now
    };
    
    this.foodLogs.set(id, foodLog);
    return foodLog;
  }

  // Weight log methods
  async getWeightLogs(uid: string, limit?: number): Promise<WeightLog[]> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      return [];
    }
    
    const logs = Array.from(this.weightLogs.values())
      .filter(log => log.userId === user.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? logs.slice(0, limit) : logs;
  }

  async createWeightLog(uid: string, weightLogData: Partial<InsertWeightLog>): Promise<WeightLog> {
    const user = await this.getUserByUid(uid);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const id = this.weightLogIdCounter++;
    const now = new Date();
    
    const weightLog: WeightLog = {
      id,
      userId: user.id,
      date: new Date(weightLogData.date!),
      weight: weightLogData.weight!,
      createdAt: now
    };
    
    this.weightLogs.set(id, weightLog);
    
    // Update the user's current weight
    await this.updateUser(uid, { weight: weightLogData.weight });
    
    return weightLog;
  }
}

export const storage = new MemStorage();
