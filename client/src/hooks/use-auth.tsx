import React, { useState, useEffect, createContext, useContext } from "react";
import { FirebaseUser, getUserProfile, updateUserProfile, onAuthStateChanged } from "@/lib/firebase";

// Define the User type for our application
export type User = {
  uid: string;
  email: string | null;
  name?: string;
  displayName?: string | null;
  photoURL?: string | null;
  onboardingCompleted?: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  profession?: string;
  targetWeight?: number;
  targetBodyFat?: number;
  activityLevel?: string;
  goal?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt?: any;
};

// Define the shape of our Authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUser: (data: Partial<User>) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUser: () => {}, // No-op function as placeholder
});

// Custom hook to access the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// AuthProvider component to wrap the application
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Handle auth state changes
    const handleAuthStateChanged = async (firebaseUser: FirebaseUser | null) => {
      try {
        console.log("Auth state changed:", firebaseUser ? "User logged in" : "User logged out");
        
        if (firebaseUser) {
          // User is signed in
          console.log("Fetching user profile for:", firebaseUser.uid);
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          if (userProfile) {
            console.log("User profile found, merging data");
            // Combine Firebase auth user with profile data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              ...userProfile,
            });
          } else {
            console.log("No user profile found, using auth data only");
            // If no profile exists yet, only use auth data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              onboardingCompleted: false,
            });
          }
        } else {
          // User is signed out
          console.log("Setting user to null (signed out)");
          setUser(null);
        }
      } catch (error) {
        console.error("Error processing auth state change:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(handleAuthStateChanged);
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Function to update user data in state and optionally in Firebase
  const updateUser = (data: Partial<User>) => {
    console.log("Updating user data:", data);
    
    setUser(prevUser => {
      if (!prevUser) {
        console.log("No user to update, returning null");
        return null;
      }
      
      // Create updated user object with new values
      const updatedUser = { ...prevUser, ...data };
      
      // If onboarding completed flag is being set, persist to Firebase
      if (data.onboardingCompleted) {
        console.log("Onboarding completed, updating Firebase profile");
        updateUserProfile(prevUser.uid, { onboardingCompleted: true })
          .catch(err => console.error("Failed to update user profile:", err));
      }
      
      return updatedUser;
    });
  };

  // Create the context value object to provide
  const contextValue = {
    user,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
