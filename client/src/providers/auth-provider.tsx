import { AuthProvider as FirebaseAuthProvider } from "@/hooks/use-auth";
import { OnboardingProvider } from "@/hooks/use-onboarding";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </FirebaseAuthProvider>
  );
}
