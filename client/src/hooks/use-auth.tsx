import { useState, useEffect, useContext, createContext } from "react";
import { auth, FirebaseUser, getUserProfile, onAuthStateChanged } from "@/lib/firebase";

// Define the user type
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get user profile data from mock DB
        const userProfile = await getUserProfile(firebaseUser.uid);
        
        if (userProfile) {
          // Combine Firebase auth user with profile
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userProfile,
          });
        } else {
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
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to update user data in context (after profile updates)
  const updateUser = (data: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...data };
    });
  };

  const value = {
    user,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
