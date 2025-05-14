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
  limit,
  serverTimestamp
} from "firebase/firestore";

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
const db = getFirestore(app);
console.log('Firebase initialized successfully');

// Collection names
const USERS_COLLECTION = 'users';
const FOOD_LOGS_COLLECTION = 'food_logs';
const WEIGHT_LOGS_COLLECTION = 'weight_logs';

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

// Auth functions - real implementations only
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: convertUser(result.user) };
  } catch (error: any) {
    console.error("Email sign-in error:", error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: convertUser(result.user) };
  } catch (error: any) {
    console.error("Email sign-up error:", error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: convertUser(result.user) };
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

// User profile functions
export async function createUserProfile(uid: string, userData: any) {
  try {
    console.log(`Creating user profile for ${uid}:`, userData);
    const userRef = doc(db, USERS_COLLECTION, uid);
    const newProfile = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, newProfile);
    console.log(`User profile created successfully for ${uid}`);
    return true;
  } catch (error: any) {
    console.error("Create user profile error:", error);
    throw error;
  }
}

export async function getUserProfile(uid: string) {
  try {
    console.log(`Getting user profile for ${uid}`);
    const userRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const profileData = { id: uid, ...docSnap.data() };
      console.log(`User profile found for ${uid}:`, profileData);
      return profileData;
    }
    console.log(`No user profile found for ${uid}`);
    return null;
  } catch (error: any) {
    console.error("Get user profile error:", error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, userData: any) {
  try {
    console.log(`Updating user profile for ${uid}:`, userData);
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    console.log(`User profile updated successfully for ${uid}`);
    return true;
  } catch (error: any) {
    console.error("Update user profile error:", error);
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
    console.log(`Adding food log for ${uid} on ${date}:`, foodData);
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
    console.log(`Food log added successfully with ID: ${newDocRef.id}`);
    return { id: newDocRef.id };
  } catch (error: any) {
    console.error("Add food log error:", error);
    throw error;
  }
}

export async function getFoodLogs(uid: string, date: string) {
  try {
    console.log(`Getting food logs for ${uid} on ${date}`);
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
    console.log(`Found ${logs.length} food logs for ${uid} on ${date}`);
    return logs;
  } catch (error: any) {
    console.error("Get food logs error:", error);
    throw error;
  }
}

// Weight tracking functions
export async function addWeightLog(uid: string, date: string, weight: number) {
  try {
    console.log(`Adding weight log for ${uid} on ${date}: ${weight}kg`);
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
    
    console.log(`Weight log added successfully with ID: ${newDocRef.id}`);
    return { id: newDocRef.id };
  } catch (error: any) {
    console.error("Add weight log error:", error);
    throw error;
  }
}

export async function getWeightLogs(uid: string, limitCount = 30) {
  try {
    console.log(`Getting weight logs for ${uid} (limit: ${limitCount})`);
    const weightLogsRef = collection(db, WEIGHT_LOGS_COLLECTION);
    const q = query(
      weightLogsRef,
      where("userId", "==", uid),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    console.log(`Found ${logs.length} weight logs for ${uid}`);
    return logs;
  } catch (error: any) {
    console.error("Get weight logs error:", error);
    throw error;
  }
}

export { auth };
export { db };
