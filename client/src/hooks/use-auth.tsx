import React, { useState, useEffect, createContext, useContext } from "react";
import { FirebaseUser, getUserProfile, updateUserProfile, listenToAuthChanges } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

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
  id?: number; // Added for PostgreSQL ID
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
          // User is signed in - First set basic user info immediately
          const basicUserInfo: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            onboardingCompleted: false, // Default value in case we can't fetch the profile
          };
          
          // Set basic user data right away to allow navigation
          setUser(basicUserInfo);
          setLoading(false);
          
          // Try to fetch profile from API without blocking auth flow
          console.log("Fetching user profile from API for:", firebaseUser.uid);
          getUserProfile(firebaseUser.uid)
            .then(userProfile => {
              if (userProfile) {
                console.log("User profile found in database, merging data:", userProfile);
                // Update user with profile data 
                setUser(prevUser => ({
                  ...(prevUser || basicUserInfo),
                  ...userProfile,
                }));
              } else {
                console.log("No user profile found in database, keeping basic auth data");
                // Basic user info already set, nothing to do
              }
            })
            .catch(profileError => {
              console.error("Error fetching user profile from API:", profileError);
              // We already set basic user info, so authentication still works
            });
        } else {
          // User is signed out
          console.log("Setting user to null (signed out)");
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error processing auth state change:", error);
        setLoading(false);
      }
    };
    
    // Set up the auth state listener
    const unsubscribe = listenToAuthChanges(handleAuthStateChanged);
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Function to update user data in state and in PostgreSQL via API
  const updateUser = (data: Partial<User>) => {
    // Log only em ambiente de desenvolvimento
    if (import.meta.env.DEV) {
      console.log("🔄 Atualizando dados do usuário");
    }
    
    setUser(prevUser => {
      if (!prevUser) {
        console.warn("❌ Tentativa de atualizar usuário inexistente");
        return null;
      }
      
      // Create updated user object with new values
      const updatedUser = { ...prevUser, ...data };
      
      // Persist changes to database via API
      updateUserProfile(prevUser.uid, data)
        .then(() => {
          if (import.meta.env.DEV) {
            console.log("✅ Perfil atualizado com sucesso");
          }
        })
        .catch(err => {
          console.error("❌ Erro ao atualizar perfil:", err.message || "Erro desconhecido");
          
          // Se tiver o erro de usuário não encontrado, tente criar
          if (prevUser.uid && prevUser.email) {
            const basicUser = {
              uid: prevUser.uid,
              email: prevUser.email,
              ...data,
            };
            
            apiRequest("POST", `/api/users`, basicUser)
              .then(response => {
                if (response.ok) {
                  if (import.meta.env.DEV) {
                    console.log("✅ Usuário criado e atualizado com sucesso");
                  }
                  
                  // Agora que o usuário foi criado, tente a atualização novamente
                  updateUserProfile(prevUser.uid, data)
                    .catch(updateErr => console.error("❌ Erro na atualização após criação"));
                } else {
                  console.error("❌ Falha ao criar usuário");
                }
              })
              .catch(createErr => console.error("❌ Erro ao criar usuário:", createErr.message || "Erro desconhecido"));
          }
        });
      
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
