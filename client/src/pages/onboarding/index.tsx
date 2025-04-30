import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";

const OnboardingSteps = [
  { id: "basic-info", title: "Informações Básicas", path: "/onboarding/basic-info" },
  { id: "goals", title: "Seus Objetivos", path: "/onboarding/goals" },
  { id: "nutrition", title: "Nutrição", path: "/onboarding/nutrition" }
];

export default function Onboarding() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { currentStep, onboardingData } = useOnboarding();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Calculate progress percentage
    const stepIndex = OnboardingSteps.findIndex(step => step.id === currentStep);
    const percentage = ((stepIndex + 1) / OnboardingSteps.length) * 100;
    setProgress(percentage);

    // Redirect to the first step if we're on the onboarding index
    if (location === "/onboarding") {
      setLocation(OnboardingSteps[0].path);
    }
  }, [user, currentStep, location, setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-neutral-light">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-secondary">
              <span className="text-primary">Nutri</span>Snap
            </h1>
            <p className="mt-2 text-sm text-gray-600">Vamos personalizar sua experiência</p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-1 bg-primary" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mx-2 text-sm font-medium text-primary">
              {Math.round(progress / (100 / OnboardingSteps.length))}/{OnboardingSteps.length}
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <h2 className="text-xl font-semibold">Bem-vindo ao Nutri Snap!</h2>
            <p className="text-gray-600">
              Vamos configurar seu perfil para criar um plano nutricional personalizado para suas necessidades e objetivos.
            </p>
            
            <Button 
              className="w-full"
              onClick={() => setLocation(OnboardingSteps[0].path)}
            >
              Começar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
