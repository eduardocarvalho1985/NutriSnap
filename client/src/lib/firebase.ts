// Mock Firebase Implementation
// This replaces real Firebase integration with in-memory mock data

// Mock Firebase User type
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Mock auth object with current user state
const auth = {
  currentUser: null as FirebaseUser | null,
  onAuthStateChanged: null as ((user: FirebaseUser | null) => void) | null,
};

// In-memory database
const mockDB = {
  users: new Map<string, any>(),
  foodLogs: new Map<string, any[]>(),
  weightLogs: new Map<string, any[]>(),
};

// Sample mock user for instant login
const mockUser: FirebaseUser = {
  uid: "mock-user-123",
  email: "user@example.com",
  displayName: "Mock User",
  photoURL: null,
};

// Mock profile data
const mockUserProfile = {
  name: "Mock User",
  age: 28,
  gender: "male",
  height: 175,
  weight: 70,
  profession: "Developer",
  targetWeight: 68,
  targetBodyFat: 15,
  activityLevel: "moderate",
  goal: "lose_weight",
  calories: 2200,
  protein: 150,
  carbs: 220,
  fat: 73,
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Sample food logs
const mockFoodLogs = [
  {
    id: "food-1",
    date: new Date().toISOString().split('T')[0],
    mealType: "Café da Manhã",
    name: "Ovos Mexidos",
    quantity: 100,
    unit: "g",
    calories: 150,
    protein: 12,
    carbs: 1,
    fat: 11,
    createdAt: new Date()
  },
  {
    id: "food-2",
    date: new Date().toISOString().split('T')[0],
    mealType: "Almoço",
    name: "Arroz Integral",
    quantity: 150,
    unit: "g",
    calories: 180,
    protein: 4,
    carbs: 38,
    fat: 1,
    createdAt: new Date()
  },
  {
    id: "food-3",
    date: new Date().toISOString().split('T')[0],
    mealType: "Almoço",
    name: "Frango Grelhado",
    quantity: 120,
    unit: "g",
    calories: 200,
    protein: 35,
    carbs: 0,
    fat: 8,
    createdAt: new Date()
  }
];

// Sample weight logs
const mockWeightLogs = [
  {
    id: "weight-1",
    date: new Date().toISOString().split('T')[0],
    weight: 70,
    createdAt: new Date(),
  },
  {
    id: "weight-2",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    weight: 70.3,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: "weight-3",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    weight: 70.5,
    createdAt: new Date(Date.now() - 86400000 * 2)
  }
];

// Set up initial mock data
mockDB.users.set(mockUser.uid, mockUserProfile);
mockDB.foodLogs.set(mockUser.uid, mockFoodLogs);
mockDB.weightLogs.set(mockUser.uid, mockWeightLogs);

// Helper to simulate async response
const asyncResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 500);
  });
};

// Auth functions
export async function signInWithEmail(email: string, password: string) {
  // Simulate successful authentication with mock user
  auth.currentUser = mockUser;
  
  if (auth.onAuthStateChanged) {
    auth.onAuthStateChanged(mockUser);
  }
  
  return asyncResponse({ user: mockUser });
}

export async function signUpWithEmail(email: string, password: string) {
  // Create a new mock user
  const newUser: FirebaseUser = {
    uid: `user-${Date.now()}`,
    email,
    displayName: null,
    photoURL: null,
  };
  
  auth.currentUser = newUser;
  
  if (auth.onAuthStateChanged) {
    auth.onAuthStateChanged(newUser);
  }
  
  return asyncResponse({ user: newUser });
}

export async function signInWithGoogle() {
  auth.currentUser = mockUser;
  
  if (auth.onAuthStateChanged) {
    auth.onAuthStateChanged(mockUser);
  }
  
  return asyncResponse({ user: mockUser });
}

export async function signInWithApple() {
  auth.currentUser = mockUser;
  
  if (auth.onAuthStateChanged) {
    auth.onAuthStateChanged(mockUser);
  }
  
  return asyncResponse({ user: mockUser });
}

export async function signOut() {
  auth.currentUser = null;
  
  if (auth.onAuthStateChanged) {
    auth.onAuthStateChanged(null);
  }
  
  return asyncResponse(undefined);
}

export async function resetPassword(email: string) {
  return asyncResponse(undefined);
}

// Setup onAuthStateChanged handler
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  auth.onAuthStateChanged = callback;
  // Call immediately with current state
  callback(auth.currentUser);
  
  // Return unsubscribe function
  return () => {
    auth.onAuthStateChanged = null;
  };
}

// User profile functions
export async function createUserProfile(uid: string, userData: any) {
  const newProfile = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockDB.users.set(uid, newProfile);
  
  return asyncResponse(undefined);
}

export async function getUserProfile(uid: string) {
  const userProfile = mockDB.users.get(uid);
  
  if (userProfile) {
    return asyncResponse({ id: uid, ...userProfile });
  }
  
  return asyncResponse(null);
}

export async function updateUserProfile(uid: string, userData: any) {
  const existingProfile = mockDB.users.get(uid);
  
  if (!existingProfile) {
    throw new Error("User not found");
  }
  
  const updatedProfile = {
    ...existingProfile,
    ...userData,
    updatedAt: new Date()
  };
  
  mockDB.users.set(uid, updatedProfile);
  
  return asyncResponse(undefined);
}

// Nutrition targets functions
export async function updateNutritionTargets(uid: string, targets: any) {
  const existingProfile = mockDB.users.get(uid);
  
  if (!existingProfile) {
    throw new Error("User not found");
  }
  
  const updatedProfile = {
    ...existingProfile,
    ...targets,
    updatedAt: new Date()
  };
  
  mockDB.users.set(uid, updatedProfile);
  
  return asyncResponse(undefined);
}

// Food logging functions
export async function addFoodLog(uid: string, date: string, mealType: string, foodData: any) {
  if (!mockDB.foodLogs.has(uid)) {
    mockDB.foodLogs.set(uid, []);
  }
  
  const logs = mockDB.foodLogs.get(uid) || [];
  
  const newFoodLog = {
    id: `food-${Date.now()}`,
    date,
    mealType,
    ...foodData,
    createdAt: new Date()
  };
  
  logs.push(newFoodLog);
  
  return asyncResponse({ id: newFoodLog.id });
}

export async function getFoodLogs(uid: string, date: string) {
  const logs = mockDB.foodLogs.get(uid) || [];
  const filteredLogs = logs.filter(log => log.date === date);
  
  return asyncResponse(filteredLogs);
}

// Weight tracking functions
export async function addWeightLog(uid: string, date: string, weight: number) {
  if (!mockDB.weightLogs.has(uid)) {
    mockDB.weightLogs.set(uid, []);
  }
  
  const logs = mockDB.weightLogs.get(uid) || [];
  
  const newWeightLog = {
    id: `weight-${Date.now()}`,
    date,
    weight,
    createdAt: new Date()
  };
  
  logs.push(newWeightLog);
  
  // Also update the user's weight
  const userProfile = mockDB.users.get(uid);
  if (userProfile) {
    mockDB.users.set(uid, {
      ...userProfile,
      weight,
      updatedAt: new Date()
    });
  }
  
  return asyncResponse({ id: newWeightLog.id });
}

export async function getWeightLogs(uid: string, limit = 30) {
  const logs = mockDB.weightLogs.get(uid) || [];
  
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return asyncResponse(sortedLogs.slice(0, limit));
}

export { auth };
export const db = {}; // Stub for compatibility
