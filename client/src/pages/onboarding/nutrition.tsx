import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

const OnboardingSteps = [
  { id: "basic-info", title: "Informações Básicas", path: "/onboarding/basic-info" },
  { id: "goals", title: "Seus Objetivos", path: "/onboarding/goals" },
  { id: "nutrition", title: "Nutrição", path: "/onboarding/nutrition" }
];

// Function to calculate TDEE based on onboarding data
function calculateNutritionTargets(data: any) {
  // Mifflin-St Jeor Equation
  let bmr = 0;
  
  if (data.gender === "male") {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
  } else {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
  }
  
  // Activity factor
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  };
  
  const activityFactor = activityFactors[data.activityLevel as keyof typeof activityFactors];
  
  // Calculate TDEE
  let tdee = Math.round(bmr * activityFactor);
  
  // Adjust for goal
  if (data.goal === "lose_weight") {
    tdee = Math.round(tdee * 0.85); // 15% deficit
  } else if (data.goal === "gain_muscle") {
    tdee = Math.round(tdee * 1.1); // 10% surplus
  }
  
  // Calculate macros (default macro split: 30% protein, 40% carbs, 30% fat)
  const proteinPercentage = 0.3;
  const carbPercentage = 0.4;
  const fatPercentage = 0.3;
  
  const proteinCalories = tdee * proteinPercentage;
  const carbCalories = tdee * carbPercentage;
  const fatCalories = tdee * fatPercentage;
  
  const proteinGrams = Math.round(proteinCalories / 4); // 4 calories per gram of protein
  const carbGrams = Math.round(carbCalories / 4); // 4 calories per gram of carbs
  const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram of fat
  
  return {
    calories: tdee,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams
  };
}

const nutritionSchema = z.object({
  calories: z.coerce.number().min(1000, "Mínimo de calorias: 1000").max(10000, "Máximo de calorias: 10000"),
  protein: z.coerce.number().min(30, "Mínimo de proteína: 30g").max(400, "Máximo de proteína: 400g"),
  carbs: z.coerce.number().min(30, "Mínimo de carboidratos: 30g").max(700, "Máximo de carboidratos: 700g"),
  fat: z.coerce.number().min(10, "Mínimo de gordura: 10g").max(200, "Máximo de gordura: 200g")
});

type NutritionFormValues = z.infer<typeof nutritionSchema>;

export default function Nutrition() {
  const [location, setLocation] = useLocation();
  const { user, updateUser } = useAuth();
  const { onboardingData, updateOnboardingData, completeOnboarding } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Calculate default nutrition values based on previous data
  const calculatedTargets = calculateNutritionTargets(onboardingData);
  
  const form = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      calories: onboardingData?.calories || calculatedTargets.calories,
      protein: onboardingData?.protein || calculatedTargets.protein,
      carbs: onboardingData?.carbs || calculatedTargets.carbs,
      fat: onboardingData?.fat || calculatedTargets.fat
    }
  });

  // Update form values when calculatedTargets change
  useEffect(() => {
    form.setValue("calories", calculatedTargets.calories);
    form.setValue("protein", calculatedTargets.protein);
    form.setValue("carbs", calculatedTargets.carbs);
    form.setValue("fat", calculatedTargets.fat);
  }, [calculatedTargets, form]);

  async function onSubmit(data: NutritionFormValues) {
    if (!user) {
      console.error("⛔ Tentando salvar sem usuário autenticado");
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para salvar os dados.",
        variant: "destructive"
      });
      return;
    }
    
    // Log reduzido em produção
    if (import.meta.env.DEV) {
      console.log("🔵 Salvando perfil nutricional");
    }
    
    setIsLoading(true);
    try {
      const finalOnboardingData = {
        ...onboardingData,
        ...data,
        onboardingCompleted: true
      };
      
      // Tentativa direta de criar o usuário no banco se ele ainda não existe
      try {
        // Tente obter o usuário primeiro via GET
        const getUserResponse = await apiRequest("GET", `/api/users/${user.uid}`);
        
        if (!getUserResponse.ok && getUserResponse.status === 404) {
          if (import.meta.env.DEV) {
            console.log("⚠️ Usuário não encontrado no banco, criando...");
          }
          
          // Prepare os dados completos do usuário para criação
          // Garantindo que os campos estejam no formato correto (snake_case para o banco)
          const createUserData = {
            uid: user.uid,
            email: user.email || 'user@example.com',
            name: onboardingData.name,
            age: onboardingData.age,
            gender: onboardingData.gender,
            height: onboardingData.height,
            weight: onboardingData.weight,
            profession: onboardingData.profession,
            // Campos especiais que precisam ser convertidos
            target_weight: onboardingData.targetWeight,
            target_body_fat: onboardingData.targetBodyFat,
            activity_level: onboardingData.activityLevel,
            goal: onboardingData.goal,
            // Dados de nutrição
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            // Flag de completude
            onboarding_completed: true
          };
          
          // Tentativa de criar o usuário
          const createResponse = await apiRequest("POST", `/api/users`, createUserData);
          
          if (!createResponse.ok) {
            // Se POST falhar, tente PUT
            const putResponse = await apiRequest("PUT", `/api/users/${user.uid}`, createUserData);
            
            if (!putResponse.ok) {
              console.error("❌ Falha ao criar usuário");
            }
          }
        }
      } catch (dbError) {
        console.error("❌ Erro ao verificar/criar usuário no banco");
      }
      
      // Update Firebase profile
      try {
        await updateUserProfile(user.uid, finalOnboardingData);
      } catch (profileError) {
        console.error("❌ Erro ao atualizar perfil via API");
        // Continuamos mesmo com erro para garantir que pelo menos o state local seja atualizado
      }
      
      // Update local state
      updateOnboardingData(finalOnboardingData);
      completeOnboarding();
      
      // Update auth user state with onboardingCompleted flag
      // Force explicit setting of onboardingCompleted to true in both formats for consistency
      updateUser({
        ...data,
        onboardingCompleted: true,
        onboarding_completed: true
      });
      
      toast({
        title: "Configuração concluída!",
        description: "Seu perfil está pronto para uso."
      });
      
      // Force redirect to dashboard after a short delay
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500); // Aumentamos o delay para dar mais tempo ao processamento
    } catch (error: any) {
      console.error("❌ Erro ao salvar perfil");
      
      let errorMessage = "Ocorreu um erro ao salvar seu perfil.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao salvar perfil",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    setLocation(OnboardingSteps[1].path);
  }

  // Calculate progress percentage
  const currentStepIndex = OnboardingSteps.findIndex(step => step.id === "nutrition");
  const progress = ((currentStepIndex + 1) / OnboardingSteps.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-neutral-light">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-1 bg-primary" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mx-2 text-sm font-medium text-primary">
              {currentStepIndex + 1}/{OnboardingSteps.length}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-secondary mb-6">Nutrição</h2>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Com base nos seus dados, nós calculamos valores nutricionais recomendados.
              Você pode ajustá-los conforme sua preferência.
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calorias diárias (kcal)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Baseado no método Mifflin-St Jeor, ajustado para seu objetivo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proteína (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carboidratos (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gordura (g)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Anterior
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Concluir"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
