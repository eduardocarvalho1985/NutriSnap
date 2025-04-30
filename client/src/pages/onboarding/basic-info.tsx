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
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const OnboardingSteps = [
  { id: "basic-info", title: "Informações Básicas", path: "/onboarding/basic-info" },
  { id: "goals", title: "Seus Objetivos", path: "/onboarding/goals" },
  { id: "nutrition", title: "Nutrição", path: "/onboarding/nutrition" }
];

const basicInfoSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.coerce.number().min(14, "Idade mínima: 14 anos").max(120, "Idade máxima: 120 anos"),
  gender: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(100, "Altura mínima: 100 cm").max(250, "Altura máxima: 250 cm"),
  weight: z.coerce.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg"),
  profession: z.string().optional()
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export default function BasicInfo() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: user?.displayName || "",
      age: onboardingData?.age || undefined,
      gender: onboardingData?.gender || undefined,
      height: onboardingData?.height || undefined,
      weight: onboardingData?.weight || undefined,
      profession: onboardingData?.profession || ""
    }
  });

  function onSubmit(data: BasicInfoFormValues) {
    setIsLoading(true);
    
    updateOnboardingData({ 
      ...onboardingData,
      ...data,
      currentStep: "goals" 
    });
    
    setLocation(OnboardingSteps[1].path);
    setIsLoading(false);
  }

  // Calculate progress percentage
  const currentStepIndex = OnboardingSteps.findIndex(step => step.id === "basic-info");
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
          
          <h2 className="text-2xl font-bold text-secondary mb-6">Informações Básicas</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Seu nome" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          placeholder="25" 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          placeholder="175" 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field} 
                          placeholder="70.5" 
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
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sua profissão" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
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
