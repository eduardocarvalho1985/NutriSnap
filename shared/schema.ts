import { pgTable, text, serial, integer, boolean, real, date, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase UID
  email: text("email").notNull(),
  name: text("name"),
  photoURL: text("photo_url"),
  age: integer("age"),
  gender: text("gender"),
  height: real("height"),
  weight: real("weight"),
  profession: text("profession"),
  targetWeight: real("target_weight"),
  targetBodyFat: real("target_body_fat"),
  activityLevel: text("activity_level"),
  goal: text("goal"),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  dailyReminders: boolean("daily_reminders").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Food logs table
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").default(0),
  carbs: real("carbs").default(0),
  fat: real("fat").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weight logs table
export const weightLogs = pgTable("weight_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  weight: real("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved foods table
export const savedFoods = pgTable("saved_foods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").default(0),
  carbs: real("carbs").default(0),
  fat: real("fat").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Food database table (shared across all users)
export const foodDatabase = pgTable("food_database", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  calories: real("calories").notNull(), // per 100g
  protein: real("protein").notNull(), // per 100g
  carbs: real("carbs").notNull(), // per 100g
  fat: real("fat").notNull(), // per 100g
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  foodLogs: many(foodLogs),
  weightLogs: many(weightLogs),
  savedFoods: many(savedFoods),
}));

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
  user: one(users, {
    fields: [foodLogs.userId],
    references: [users.id],
  }),
}));

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, {
    fields: [weightLogs.userId],
    references: [users.id],
  }),
}));

export const savedFoodsRelations = relations(savedFoods, ({ one }) => ({
  user: one(users, {
    fields: [savedFoods.userId],
    references: [users.id],
  }),
}));

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({
  id: true,
  createdAt: true
});

export const insertWeightLogSchema = createInsertSchema(weightLogs).omit({
  id: true,
  createdAt: true
});

export const insertSavedFoodSchema = createInsertSchema(savedFoods).omit({
  id: true,
  createdAt: true
});

export const insertFoodDatabaseSchema = createInsertSchema(foodDatabase).omit({
  id: true,
  createdAt: true
});

// Types for database operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogs.$inferSelect;

export type InsertWeightLog = z.infer<typeof insertWeightLogSchema>;
export type WeightLog = typeof weightLogs.$inferSelect;

export type InsertSavedFood = z.infer<typeof insertSavedFoodSchema>;
export type SavedFood = typeof savedFoods.$inferSelect;

export type InsertFoodDatabase = z.infer<typeof insertFoodDatabaseSchema>;
export type FoodDatabase = typeof foodDatabase.$inferSelect;
