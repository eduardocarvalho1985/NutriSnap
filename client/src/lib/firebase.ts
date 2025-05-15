import { initializeApp } from "firebase/app";
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseAuthUser
} from "firebase/auth";
import { apiRequest } from "./queryClient";

// Firebase User type
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Firebase configuration - always use real Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
console.log('Initializing Firebase with real configuration');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log('Firebase initialized successfully');

// Helper to convert Firebase User object to our simplified type
const convertUser = (user: FirebaseAuthUser | null): FirebaseUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

// Auth functions - Firebase authentication only
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const convertedUser = convertUser(result.user);
    
    // Ensure user exists in PostgreSQL
    if (convertedUser) {
      await ensureUserInDatabase(convertedUser);
    }
    
    return { user: convertedUser };
  } catch (error: any) {
    console.error("Email sign-in error:", error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const convertedUser = convertUser(result.user);
    
    // Create user in PostgreSQL
    if (convertedUser) {
      await createUserInDatabase(convertedUser);
    }
    
    return { user: convertedUser };
  } catch (error: any) {
    console.error("Email sign-up error:", error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const convertedUser = convertUser(result.user);
    
    // Ensure user exists in PostgreSQL
    if (convertedUser) {
      await ensureUserInDatabase(convertedUser);
    }
    
    return { user: convertedUser };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

export async function signInWithApple() {
  // Firebase doesn't have direct Apple sign-in
  throw new Error("Apple sign-in not implemented yet");
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return true;
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw error;
  }
}

// Setup auth state change listener
export function listenToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, (user: FirebaseAuthUser | null) => {
    callback(convertUser(user));
  });
}

// User Profile API Functions
async function ensureUserInDatabase(user: FirebaseUser) {
  try {
    console.log(`Ensuring user exists in database: ${user.uid}`);
    
    // First try to get the user
    const response = await apiRequest("GET", `/api/users/${user.uid}`);
    
    // If user exists, return true
    if (response.ok) {
      console.log(`User ${user.uid} found in database`);
      return true;
    }
    
    // If status is 404, create the user
    if (response.status === 404) {
      console.log(`User ${user.uid} not found in database, creating...`);
      return await createUserInDatabase(user);
    }
    
    throw new Error(`Unexpected response: ${response.status}`);
  } catch (error) {
    console.error("Error ensuring user in database:", error);
    // Create user if not found or other error (best effort)
    try {
      console.log(`Attempting to create user ${user.uid} after error...`);
      return await createUserInDatabase(user);
    } catch (createError) {
      console.error("Error creating user:", createError);
      return false;
    }
  }
}

async function createUserInDatabase(user: FirebaseUser) {
  try {
    console.log(`Creating user in database: ${user.uid}`);
    
    // Certifique-se de que todos os campos obrigatórios estão presentes e com valores válidos
    const userData = {
      uid: user.uid,
      email: user.email || 'user@example.com', // Email é obrigatório no schema
      name: user.displayName || null, // Pode ser null, mas deve ser explícito
      photoURL: user.photoURL || null, // Pode ser null, mas deve ser explícito
      onboardingCompleted: false
    };
    
    // Log da requisição para depuração
    console.log("[createUserInDatabase] Sending data:", JSON.stringify(userData));
    
    try {
      const response = await apiRequest("POST", `/api/users`, userData);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[createUserInDatabase] Error status: ${response.status}, Response:`, errorText);
        
        // Se não conseguir criar o usuário via POST, tente via PUT
        console.log(`[createUserInDatabase] Trying to create user via PUT instead`);
        const putResponse = await apiRequest("PUT", `/api/users/${user.uid}`, userData);
        
        if (!putResponse.ok) {
          const putErrorText = await putResponse.text();
          console.error(`[createUserInDatabase] PUT attempt also failed: ${putResponse.status}, Response:`, putErrorText);
          throw new Error(`Failed to create user via PUT: ${putErrorText}`);
        }
        
        console.log(`[createUserInDatabase] User ${user.uid} created via PUT successfully`);
        return true;
      }
      
      console.log(`[createUserInDatabase] User ${user.uid} created via POST successfully`);
      return true;
    } catch (fetchError) {
      console.error("[createUserInDatabase] Fetch error:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("[createUserInDatabase] Top-level error:", error);
    // Não propagamos o erro para permitir que o usuário continue usando o app
    return false;
  }
}

export async function getUserProfile(uid: string) {
  try {
    console.log(`Getting user profile for ${uid} from API`);
    const response = await apiRequest("GET", `/api/users/${uid}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting user profile from API:", error);
    return null;
  }
}

export async function updateUserProfile(uid: string, userData: any) {
  try {
    if (import.meta.env.DEV) {
      console.log(`Atualizando perfil para ${uid}`);
    }
    
    // Converter campos camelCase para snake_case para compatibilidade com o backend
    const formattedData: any = {...userData};
    
    // Verificar e converter os campos especiais
    if ('targetWeight' in userData && userData.targetWeight !== undefined) {
      formattedData.target_weight = userData.targetWeight;
      delete formattedData.targetWeight;
    }
    
    if ('targetBodyFat' in userData && userData.targetBodyFat !== undefined) {
      formattedData.target_body_fat = userData.targetBodyFat;
      delete formattedData.targetBodyFat;
    }
    
    if ('activityLevel' in userData && userData.activityLevel !== undefined) {
      formattedData.activity_level = userData.activityLevel;
      delete formattedData.activityLevel;
    }
    
    if ('onboardingCompleted' in userData && userData.onboardingCompleted !== undefined) {
      formattedData.onboarding_completed = userData.onboardingCompleted;
      delete formattedData.onboardingCompleted;
    }
    
    if ('photoURL' in userData && userData.photoURL !== undefined) {
      formattedData.photo_url = userData.photoURL;
      delete formattedData.photoURL;
    }
    
    if (import.meta.env.DEV) {
      console.log("Dados formatados para envio:", formattedData);
    }
    
    await apiRequest("PUT", `/api/users/${uid}`, formattedData);
    return true;
  } catch (error) {
    console.error("Error updating user profile via API:", error);
    throw error;
  }
}

// Nutrition targets functions
export async function updateNutritionTargets(uid: string, targets: any) {
  return updateUserProfile(uid, targets);
}

// Food logging functions
export async function addFoodLog(uid: string, date: string, mealType: string, foodData: any) {
  try {
    console.log(`Adding food log for ${uid} on ${date} via API:`, foodData);
    
    const payload = {
      date,
      mealType,
      ...foodData
    };
    
    const response = await apiRequest("POST", `/api/users/${uid}/food-logs`, payload);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding food log via API:", error);
    throw error;
  }
}

export async function getFoodLogs(uid: string, date: string) {
  try {
    console.log(`Getting food logs for ${uid} on ${date} via API`);
    const response = await apiRequest("GET", `/api/users/${uid}/food-logs/${date}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting food logs via API:", error);
    return [];
  }
}

// Weight tracking functions
export async function addWeightLog(uid: string, date: string, weight: number) {
  try {
    console.log(`Adding weight log for ${uid} on ${date} via API: ${weight}kg`);
    
    const payload = {
      date,
      weight
    };
    
    const response = await apiRequest("POST", `/api/users/${uid}/weight-logs`, payload);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding weight log via API:", error);
    throw error;
  }
}

export async function getWeightLogs(uid: string, limitCount = 30) {
  try {
    console.log(`Getting weight logs for ${uid} (limit: ${limitCount}) via API`);
    const response = await apiRequest("GET", `/api/users/${uid}/weight-logs?limit=${limitCount}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting weight logs via API:", error);
    return [];
  }
}

export { auth };
