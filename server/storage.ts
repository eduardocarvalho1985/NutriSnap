import { users, User, InsertUser, foodLogs, FoodLog, InsertFoodLog, weightLogs, WeightLog, InsertWeightLog, savedFoods, SavedFood, InsertSavedFood, foodDatabase, FoodDatabase, InsertFoodDatabase } from "@shared/schema";
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
  updateFoodLog(uid: string, id: number, foodLogData: Partial<FoodLog>): Promise<FoodLog | undefined>;
  deleteFoodLog(uid: string, id: number): Promise<boolean>;

  // Weight log methods
  getWeightLogs(uid: string, limit?: number): Promise<WeightLog[]>;
  createWeightLog(uid: string, weightLog: Partial<InsertWeightLog>): Promise<WeightLog>;

  // Saved food methods
  getSavedFoods(uid: string): Promise<SavedFood[]>;
  saveFoodItem(uid: string, foodData: Partial<InsertSavedFood>): Promise<SavedFood>;

  // Food database methods (shared across all users)
  searchFoodDatabase(query: string): Promise<FoodDatabase[]>;
  getFoodDatabaseByCategory(category: string): Promise<FoodDatabase[]>;
  getAllFoodCategories(): Promise<string[]>;
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


  async updateFoodLog(uid: string, id: number, foodLogData: Partial<FoodLog>): Promise<FoodLog | undefined> {
    try {
      console.log(`Updating food log for user ${uid}, id ${id} with data:`, foodLogData);

      // First, get the user's ID from their UID
      const user = await this.getUserByUid(uid);

      if (!user) {
        console.log(`User ${uid} not found when updating food log`);
        return undefined;
      }

      // Format the data for updating
      const updateData: Partial<FoodLog> = {
        name: foodLogData.name,
        quantity: foodLogData.quantity,
        unit: foodLogData.unit,
        calories: foodLogData.calories,
        protein: foodLogData.protein,
        carbs: foodLogData.carbs,
        fat: foodLogData.fat,
        mealType: foodLogData.mealType
      };

      // Update the food log entry
      const [updatedFoodLog] = await db
        .update(foodLogs)
        .set(updateData)
        .where(
          and(
            eq(foodLogs.id, id),
            eq(foodLogs.userId, user.id)
          )
        )
        .returning();

      if (!updatedFoodLog) {
        console.log(`No food log found with id ${id} for user ${uid}`);
        return undefined;
      }

      console.log(`Food log updated successfully:`, updatedFoodLog);
      return updatedFoodLog;
    } catch (error) {
      console.error(`Error updating food log:`, error);
      throw error;
    }
  }

  async deleteFoodLog(uid: string, id: number): Promise<boolean> {
    try {
      console.log(`Deleting food log for user ${uid}, id ${id}`);

      // First, get the user's ID from their UID
      const user = await this.getUserByUid(uid);

      if (!user) {
        console.log(`User ${uid} not found when deleting food log`);
        return false;
      }

      // Delete the food log entry
      const result = await db
        .delete(foodLogs)
        .where(
          and(
            eq(foodLogs.id, id),
            eq(foodLogs.userId, user.id)
          )
        );

      // If affected rows is 0, no food log was found/deleted
      if (result.rowCount === 0) {
        console.log(`No food log found with id ${id} for user ${uid}`);
        return false;
      }

      console.log(`Food log deleted successfully for user ${uid}, id ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting food log:`, error);
      throw error;
    }
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

  // Métodos para alimentos salvos
  async getSavedFoods(uid: string): Promise<SavedFood[]> {
    const user = await this.getUserByUid(uid);

    if (!user) {
      return [];
    }

    const savedFoodsList = await db.select()
      .from(savedFoods)
      .where(eq(savedFoods.userId, user.id))
      .orderBy(desc(savedFoods.createdAt));

    return savedFoodsList;
  }

  async saveFoodItem(uid: string, foodData: Partial<InsertSavedFood>): Promise<SavedFood> {
    const user = await this.getUserByUid(uid);

    if (!user) {
      throw new Error("User not found");
    }

    // Formatar os valores para inserção
    const insertValues = {
      userId: user.id,
      name: foodData.name!,
      quantity: foodData.quantity!,
      unit: foodData.unit!,
      calories: foodData.calories!,
      protein: foodData.protein || 0,
      carbs: foodData.carbs || 0,
      fat: foodData.fat || 0,
    };

    const [savedFood] = await db.insert(savedFoods)
      .values(insertValues)
      .returning();

    return savedFood;
  }

  // Food database methods (shared across all users)
  async searchFoodDatabase(query: string): Promise<FoodDatabase[]> {
    const foods = await db.select()
      .from(foodDatabase)
      .where(sql`LOWER(${foodDatabase.name}) LIKE LOWER(${`%${query}%`})`)
      .limit(20);

    return foods;
  }

  async getFoodDatabaseByCategory(category: string): Promise<FoodDatabase[]> {
    const foods = await db.select()
      .from(foodDatabase)
      .where(eq(foodDatabase.category, category));

    return foods;
  }

  async getAllFoodCategories(): Promise<string[]> {
    const categories = await db.select({ category: foodDatabase.category })
      .from(foodDatabase)
      .groupBy(foodDatabase.category);

    return categories.map(c => c.category);
  }
}

export const storage = new DatabaseStorage();
async updateUser(uid: string, data: any) {
    try {
      // Ensure that required fields are not modified
      delete data.id;
      delete data.uid;

      // Log incoming data for debugging
      console.log(`Storage updateUser for ${uid}, onboarding fields:`, {
        onboardingCompleted: data.onboardingCompleted,
        onboarding_completed: data.onboarding_completed
      });

      // Convert camelCase to snake_case for specific fields
      if (data.targetWeight !== undefined) {
        data.target_weight = data.targetWeight;
        delete data.targetWeight;
      }

      if (data.targetBodyFat !== undefined) {
        data.target_body_fat = data.targetBodyFat;
        delete data.targetBodyFat;
      }

      if (data.activityLevel !== undefined) {
        data.activity_level = data.activityLevel;
        delete data.activityLevel;
      }

      if (data.photoURL !== undefined) {
        data.photo_url = data.photoURL;
        delete data.photoURL;
      }

      if (data.stripeCustomerId !== undefined) {
        data.stripe_customer_id = data.stripeCustomerId;
        delete data.stripeCustomerId;
      }

      if (data.stripeSubscriptionId !== undefined) {
        data.stripe_subscription_id = data.stripeSubscriptionId;
        delete data.stripeSubscriptionId;
      }

      // Special handling for onboarding status to ensure it's properly converted
      if (data.onboardingCompleted === true || data.onboarding_completed === true) {
        data.onboarding_completed = true;
        console.log(`Explicitly setting onboarding_completed to TRUE for user ${uid}`);
        delete data.onboardingCompleted;
      } else if (data.onboardingCompleted !== undefined) {
        data.onboarding_completed = data.onboardingCompleted;
        delete data.onboardingCompleted;
      }
      
      // Add the rest of the method implementation
      const updatedUser = await this.getUserByUid(uid);
      if (!updatedUser) {
        console.error(`Failed to update user ${uid}: User not found`);
        return undefined;
      }
      
      // Update the database with normalized data
      const [user] = await db.update(users)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(users.uid, uid))
        .returning();
      
      console.log(`User ${uid} successfully updated with onboarding_completed=${data.onboarding_completed}`);
      return user;
    } catch (error) {
      console.error(`Error updating user ${uid}:`, error);
      throw error;
    }
}