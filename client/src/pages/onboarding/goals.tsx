import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useState } from "react";

const OnboardingSteps = [
  { id: "basic-info", title: "Informações Básicas", path: "/onboarding/basic-info" },
  { id: "goals", title: "Seus Objetivos", path: "/onboarding/goals" },
  { id: "nutrition", title: "Nutrição", path: "/onboarding/nutrition" }
];

const goalsSchema = z.object({
  targetWeight: z.coerce.number().min(30, "Peso alvo mínimo: 30 kg").max(300, "Peso alvo máximo: 300 kg"),
  targetBodyFat: z.coerce.number().min(5, "Gordura corporal mínima: 5%").max(50, "Gordura corporal máxima: 50%").optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "extreme"]),
  goal: z.enum(["lose_weight", "maintain", "gain_muscle"])
});

type GoalsFormValues = z.infer<typeof goalsSchema>;

export default function Goals() {
  const [location, setLocation] = useLocation();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<GoalsFormValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      targetWeight: onboardingData?.targetWeight || undefined,
      targetBodyFat: onboardingData?.targetBodyFat || undefined,
      activityLevel: onboardingData?.activityLevel || undefined,
      goal: onboardingData?.goal || undefined
    }
  });

  function onSubmit(data: GoalsFormValues) {
    setIsLoading(true);
    
    updateOnboardingData({ 
      ...onboardingData,
      ...data,
      currentStep: "nutrition" 
    });
    
    setLocation(OnboardingSteps[2].path);
    setIsLoading(false);
  }

  function handleBack() {
    setLocation(OnboardingSteps[0].path);
  }

  // Calculate progress percentage
  const currentStepIndex = OnboardingSteps.findIndex(step => step.id === "goals");
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
          
          <h2 className="text-2xl font-bold text-secondary mb-6">Seus Objetivos</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso alvo (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field} 
                          placeholder="70.0" 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetBodyFat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gordura corporal alvo (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          placeholder="12" 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de atividade física</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu nível de atividade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                        <SelectItem value="light">Leve (exercício 1-3 dias por semana)</SelectItem>
                        <SelectItem value="moderate">Moderado (exercício 3-5 dias por semana)</SelectItem>
                        <SelectItem value="active">Muito ativo (exercício 6-7 dias por semana)</SelectItem>
                        <SelectItem value="extreme">Extremamente ativo (exercício intenso, trabalho físico)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo principal</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lose_weight">Perder peso</SelectItem>
                        <SelectItem value="maintain">Manter peso</SelectItem>
                        <SelectItem value="gain_muscle">Ganhar massa muscular</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  Próximo
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
