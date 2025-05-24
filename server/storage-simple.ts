import { users, User, InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function updateUserSimple(uid: string, userData: Partial<User>): Promise<User | undefined> {
  try {
    console.log(`Simple updateUser for ${uid}, incoming data:`, userData);

    // Criar objeto de atualização usando apenas os campos válidos do schema
    const updateData: Partial<typeof users.$inferInsert> = {};

    // Mapear campos de forma simples e direta
    if (userData.dailyReminders !== undefined) updateData.dailyReminders = userData.dailyReminders;
    if (userData.weeklyReports !== undefined) updateData.weeklyReports = userData.weeklyReports;
    if (userData.weight !== undefined) updateData.weight = userData.weight;
    if (userData.onboardingCompleted !== undefined) updateData.onboardingCompleted = userData.onboardingCompleted;
    
    // Timestamp de atualização
    updateData.updatedAt = new Date();

    console.log("Simple update data:", updateData);

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.uid, uid))
      .returning();

    console.log(`User ${uid} updated successfully with simple method`);
    return updatedUser;
  } catch (error) {
    console.error(`Error in simple updateUser for ${uid}:`, error);
    throw error;
  }
}