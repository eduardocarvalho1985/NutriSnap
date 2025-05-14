import { initializeApp } from "firebase/app";
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword as firebaseSignUpWithEmail,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseAuthUser
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";

// Check if we have the Firebase API keys
const hasFirebaseKeys = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_APP_ID;

// Firebase configuration
const firebaseConfig = hasFirebaseKeys ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} : null;

// Initialize Firebase services
let app;
let auth;
let db;

// Firebase User type
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// If we have Firebase config, initialize Firebase; otherwise use mocks
if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn('Firebase keys not found, using mock implementation');
  // Mock auth object with current user state
  auth = {
    currentUser: null,
    onAuthStateChanged: null,
  };
  // Mock DB (in-memory)
  db = {
    users: new Map(),
    foodLogs: new Map(),
    weightLogs: new Map()
  };
}

// Collection names
const USERS_COLLECTION = 'users';
const FOOD_LOGS_COLLECTION = 'food_logs';
const WEIGHT_LOGS_COLLECTION = 'weight_logs';

// Mock data setup for fallback
const mockUser: FirebaseUser = {
  uid: "mock-user-123",
  email: "user@example.com",
  displayName: "Mock User",
  photoURL: null,
};

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

if (!firebaseConfig) {
  // Set up initial mock data if not using Firebase
  db.users.set(mockUser.uid, mockUserProfile);
  db.foodLogs.set(mockUser.uid, mockFoodLogs);
  db.weightLogs.set(mockUser.uid, mockWeightLogs);
}

// Helper to simulate async response (for mock mode)
const asyncResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 500);
  });
};

// Handle converting Firebase Auth User to our FirebaseUser type
const convertUser = (user: FirebaseAuthUser | null): FirebaseUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

// Auth functions
export async function signInWithEmail(email: string, password: string) {
  if (firebaseConfig) {
    const result = await firebaseSignInWithEmail(auth, email, password);
    return { user: convertUser(result.user) };
  } else {
    // Mock version
    auth.currentUser = mockUser;
    if (auth.onAuthStateChanged) {
      auth.onAuthStateChanged(mockUser);
    }
    return asyncResponse({ user: mockUser });
  }
}

export async function signUpWithEmail(email: string, password: string) {
  if (firebaseConfig) {
    const result = await firebaseSignUpWithEmail(auth, email, password);
    return { user: convertUser(result.user) };
  } else {
    // Mock version
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
}

export async function signInWithGoogle() {
  if (firebaseConfig) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: convertUser(result.user) };
  } else {
    // Mock version
    auth.currentUser = mockUser;
    if (auth.onAuthStateChanged) {
      auth.onAuthStateChanged(mockUser);
    }
    return asyncResponse({ user: mockUser });
  }
}

export async function signInWithApple() {
  if (firebaseConfig) {
    // Firebase doesn't have direct Apple sign-in, would normally use OAuthProvider
    throw new Error("Apple sign-in not implemented yet");
  } else {
    // Mock version
    auth.currentUser = mockUser;
    if (auth.onAuthStateChanged) {
      auth.onAuthStateChanged(mockUser);
    }
    return asyncResponse({ user: mockUser });
  }
}

export async function signOut() {
  if (firebaseConfig) {
    await firebaseSignOut(auth);
    return undefined;
  } else {
    // Mock version
    auth.currentUser = null;
    if (auth.onAuthStateChanged) {
      auth.onAuthStateChanged(null);
    }
    return asyncResponse(undefined);
  }
}

export async function resetPassword(email: string) {
  if (firebaseConfig) {
    await firebaseSendPasswordResetEmail(auth, email);
    return undefined;
  } else {
    return asyncResponse(undefined);
  }
}

// Setup onAuthStateChanged handler
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  if (firebaseConfig) {
    return firebaseOnAuthStateChanged(auth, (user) => {
      callback(convertUser(user));
    });
  } else {
    // Mock version
    auth.onAuthStateChanged = callback;
    callback(auth.currentUser);
    return () => {
      auth.onAuthStateChanged = null;
    };
  }
}

// User profile functions
export async function createUserProfile(uid: string, userData: any) {
  if (firebaseConfig) {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const newProfile = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, newProfile);
    return undefined;
  } else {
    // Mock version
    const newProfile = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.users.set(uid, newProfile);
    return asyncResponse(undefined);
  }
}

export async function getUserProfile(uid: string) {
  if (firebaseConfig) {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return { id: uid, ...docSnap.data() };
    }
    return null;
  } else {
    // Mock version
    const userProfile = db.users.get(uid);
    if (userProfile) {
      return asyncResponse({ id: uid, ...userProfile });
    }
    return asyncResponse(null);
  }
}

export async function updateUserProfile(uid: string, userData: any) {
  if (firebaseConfig) {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return undefined;
  } else {
    // Mock version
    const existingProfile = db.users.get(uid);
    if (!existingProfile) {
      throw new Error("User not found");
    }
    const updatedProfile = {
      ...existingProfile,
      ...userData,
      updatedAt: new Date()
    };
    db.users.set(uid, updatedProfile);
    return asyncResponse(undefined);
  }
}

// Nutrition targets functions - same as updateUserProfile for our use case
export async function updateNutritionTargets(uid: string, targets: any) {
  return updateUserProfile(uid, targets);
}

// Food logging functions
export async function addFoodLog(uid: string, date: string, mealType: string, foodData: any) {
  if (firebaseConfig) {
    const foodLogsCollectionRef = collection(db, FOOD_LOGS_COLLECTION);
    const newDocRef = doc(foodLogsCollectionRef);
    const newLog = {
      userId: uid,
      date,
      mealType,
      ...foodData,
      createdAt: serverTimestamp()
    };
    await setDoc(newDocRef, newLog);
    return { id: newDocRef.id };
  } else {
    // Mock version
    if (!db.foodLogs.has(uid)) {
      db.foodLogs.set(uid, []);
    }
    const logs = db.foodLogs.get(uid) || [];
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
}

export async function getFoodLogs(uid: string, date: string) {
  if (firebaseConfig) {
    const foodLogsRef = collection(db, FOOD_LOGS_COLLECTION);
    const q = query(
      foodLogsRef,
      where("userId", "==", uid),
      where("date", "==", date)
    );
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } else {
    // Mock version
    const logs = db.foodLogs.get(uid) || [];
    const filteredLogs = logs.filter(log => log.date === date);
    return asyncResponse(filteredLogs);
  }
}

// Weight tracking functions
export async function addWeightLog(uid: string, date: string, weight: number) {
  if (firebaseConfig) {
    // Add the weight log
    const weightLogsCollectionRef = collection(db, WEIGHT_LOGS_COLLECTION);
    const newDocRef = doc(weightLogsCollectionRef);
    const newLog = {
      userId: uid,
      date,
      weight,
      createdAt: serverTimestamp()
    };
    await setDoc(newDocRef, newLog);
    
    // Update user's current weight
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      weight,
      updatedAt: serverTimestamp()
    });
    
    return { id: newDocRef.id };
  } else {
    // Mock version
    if (!db.weightLogs.has(uid)) {
      db.weightLogs.set(uid, []);
    }
    const logs = db.weightLogs.get(uid) || [];
    const newWeightLog = {
      id: `weight-${Date.now()}`,
      date,
      weight,
      createdAt: new Date()
    };
    logs.push(newWeightLog);
    
    // Also update the user's weight
    const userProfile = db.users.get(uid);
    if (userProfile) {
      db.users.set(uid, {
        ...userProfile,
        weight,
        updatedAt: new Date()
      });
    }
    return asyncResponse({ id: newWeightLog.id });
  }
}

export async function getWeightLogs(uid: string, limit = 30) {
  if (firebaseConfig) {
    const weightLogsRef = collection(db, WEIGHT_LOGS_COLLECTION);
    const q = query(
      weightLogsRef,
      where("userId", "==", uid),
      orderBy("date", "desc"),
      firestoreLimit(limit)
    );
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } else {
    // Mock version
    const logs = db.weightLogs.get(uid) || [];
    const sortedLogs = [...logs].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return asyncResponse(sortedLogs.slice(0, limit));
  }
}

export { auth };
export { db };
