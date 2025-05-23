import { useState, useEffect, useContext, createContext } from "react";
import { useAuth } from "@/hooks/use-auth";

// Define the onboarding data type
type OnboardingData = {
  currentStep: string;
  // Basic info
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  profession?: string;
  // Goals
  targetWeight?: number;
  targetBodyFat?: number;
  activityLevel?: string;
  goal?: string;
  // Nutrition
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  // Status
  onboardingCompleted?: boolean;
};

interface OnboardingContextType {
  onboardingData: OnboardingData;
  currentStep: string;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
}

// Create context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  onboardingData: { currentStep: "basic-info" },
  currentStep: "basic-info",
  updateOnboardingData: () => {},
  completeOnboarding: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    currentStep: "basic-info",
  });
  
  // Initialize onboarding data from user profile (if available)
  useEffect(() => {
    if (user) {
      // Always consider onboarding as completed to bypass the onboarding flow
      const isOnboardingCompleted = true;
        
      console.log("Onboarding check in useOnboarding: (bypassed - always true)");
      
      setOnboardingData({
        currentStep: "completed", // Always set as completed
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        profession: user.profession,
        targetWeight: user.targetWeight,
        targetBodyFat: user.targetBodyFat,
        activityLevel: user.activityLevel,
        goal: user.goal,
        calories: user.calories,
        protein: user.protein,
        carbs: user.carbs,
        fat: user.fat,
        onboardingCompleted: true // Always set to true
      });
    }
  }, [user]);
  
  // Update onboarding data
  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prevData => ({ ...prevData, ...data }));
  };
  
  // Complete onboarding
  const completeOnboarding = () => {
    console.log("Completing onboarding - setting onboardingCompleted to true");
    setOnboardingData(prevData => {
      const updatedData = { 
        ...prevData, 
        currentStep: "completed",
        onboardingCompleted: true 
      };
      console.log("Updated onboarding data:", updatedData);
      return updatedData;
    });
  };
  
  const value = {
    onboardingData,
    currentStep: onboardingData.currentStep,
    updateOnboardingData,
    completeOnboarding
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
