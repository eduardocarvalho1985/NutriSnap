import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserIcon, CalendarIcon, ChevronDownIcon } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional(),
  age: z.coerce.number().min(14, "Idade mínima: 14 anos").max(120, "Idade máxima: 120 anos").optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.coerce.number().min(100, "Altura mínima: 100 cm").max(250, "Altura máxima: 250 cm").optional(),
  weight: z.coerce.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg").optional(),
  profession: z.string().optional(),
  // Meta/Objetivos
  goal: z.string().optional(),
  targetWeight: z.coerce.number().min(30, "Peso alvo mínimo: 30 kg").max(300, "Peso alvo máximo: 300 kg").optional(),
  targetBodyFat: z.coerce.number().min(3, "% gordura mínima: 3%").max(50, "% gordura máxima: 50%").optional(),
  activityLevel: z.string().optional(),
  // Nutrição
  calories: z.coerce.number().min(800, "Calorias mínimas: 800").max(5000, "Calorias máximas: 5000").optional(),
  protein: z.coerce.number().min(30, "Proteína mínima: 30g").max(500, "Proteína máxima: 500g").optional(),
  carbs: z.coerce.number().min(50, "Carboidratos mínimos: 50g").max(800, "Carboidratos máximos: 800g").optional(),
  fat: z.coerce.number().min(20, "Gordura mínima: 20g").max(300, "Gordura máxima: 300g").optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Show a notification for users to complete their profile if key information is missing
  useEffect(() => {
    if (user && (!user.height || !user.weight || !user.age || !user.gender || !user.goal)) {
      toast({
        title: "Complete seu perfil",
        description: "Por favor, preencha suas informações básicas para uma experiência personalizada.",
        duration: 7000,
      });
    }
  }, [user, toast]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Configurar o formulário com valores padrão
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      age: user?.age || undefined,
      gender: user?.gender || undefined,
      height: user?.height || undefined,
      weight: user?.weight || undefined,
      profession: user?.profession || "",
      // Meta/Objetivos
      goal: user?.goal || undefined,
      targetWeight: user?.targetWeight || undefined,
      targetBodyFat: user?.targetBodyFat || undefined,
      activityLevel: user?.activityLevel || undefined,
      // Nutrição
      calories: user?.calories || undefined,
      protein: user?.protein || undefined,
      carbs: user?.carbs || undefined,
      fat: user?.fat || undefined
    }
  });
  
  // Atualizar o formulário quando o usuário for carregado
  useEffect(() => {
    if (user) {
      // Reset do formulário com os valores do usuário
      form.reset({
        name: user.name || "",
        email: user.email || "",
        age: user.age || undefined,
        gender: user.gender || undefined,
        height: user.height || undefined,
        weight: user.weight || undefined,
        profession: user.profession || "",
        // Meta/Objetivos
        goal: user.goal || undefined,
        targetWeight: user.targetWeight || undefined,
        targetBodyFat: user.targetBodyFat || undefined,
        activityLevel: user.activityLevel || undefined,
        // Nutrição
        calories: user.calories || undefined,
        protein: user.protein || undefined,
        carbs: user.carbs || undefined,
        fat: user.fat || undefined
      });
      
      if (import.meta.env.DEV) {
        console.log("Dados do usuário carregados no formulário:", user);
      }
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, data);
      updateUser(data);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-secondary">Perfil</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.name || "Usuário"} />
                <AvatarFallback className="text-xl bg-primary text-white">
                  {user?.name ? getInitials(user.name) : <UserIcon />}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold">{user?.name || "Usuário"}</h2>
                <p className="text-sm text-gray-500">Membro desde {format(user?.createdAt instanceof Date ? user.createdAt : new Date(), "MMMM yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {user?.height ? (
                <div 
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer transition-colors"
                  onClick={() => {
                    document.getElementById('height-input')?.focus();
                    document.getElementById('height-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <span className="font-medium">{user.height} cm</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
                </div>
              ) : (
                <div 
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer transition-colors border-2 border-dashed border-gray-300"
                  onClick={() => {
                    document.getElementById('height-input')?.focus();
                    document.getElementById('height-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <span className="font-medium text-gray-500">Adicionar altura</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
                </div>
              )}
              
              {user?.weight ? (
                <div 
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer transition-colors"
                  onClick={() => {
                    document.getElementById('weight-input')?.focus();
                    document.getElementById('weight-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <span className="font-medium">{user.weight} kg</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
                </div>
              ) : (
                <div 
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer transition-colors border-2 border-dashed border-gray-300"
                  onClick={() => {
                    document.getElementById('weight-input')?.focus();
                    document.getElementById('weight-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <span className="font-medium text-gray-500">Adicionar peso</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
                </div>
              )}
              
              {user?.age ? (
                <div 
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer transition-colors"
                  onClick={() => {
                    document.getElementById('age-input')?.focus();
                    document.getElementById('age-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="font-medium">{user.age} anos</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
                </div>
              ) : (
                <div 
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer transition-colors border-2 border-dashed border-gray-300"
                  onClick={() => {
                    document.getElementById('age-input')?.focus();
                    document.getElementById('age-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <CalendarIcon className="h-4 w-4 mr-1 opacity-60" />
                  <span className="font-medium text-gray-500">Adicionar idade</span>
                  <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
                </div>
              )}
            </div>
            
            <div 
              className="bg-primary/10 hover:bg-primary/20 p-3 rounded-md text-center mb-2 cursor-pointer transition-colors"
              onClick={() => {
                document.getElementById('edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <p className="text-sm text-primary-dark flex items-center justify-center">
                {user?.goal === "lose_weight" ? "Meta: Perder Peso" :
                 user?.goal === "maintain" ? "Meta: Manter Peso" :
                 user?.goal === "gain_muscle" ? "Meta: Ganhar Massa Muscular" : "Meta não definida"}
                <ChevronDownIcon className="h-3 w-3 ml-1 opacity-60" />
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6" id="edit-form">
            <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Seu email" disabled={true} />
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
                            id="age-input"
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
                            id="height-input"
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
                            id="weight-input"
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

                {/* Seção de Metas */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-md font-semibold mb-4 text-primary">🎯 Metas e Objetivos</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo Principal</FormLabel>
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
                              <SelectItem value="lose_weight">Perder Peso</SelectItem>
                              <SelectItem value="maintain">Manter Peso</SelectItem>
                              <SelectItem value="gain_muscle">Ganhar Massa Muscular</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targetWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso Alvo (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                {...field} 
                                placeholder="75.0" 
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
                            <FormLabel>% Gordura Alvo</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                placeholder="15" 
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
                          <FormLabel>Nível de Atividade</FormLabel>
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
                              <SelectItem value="sedentary">Sedentário (pouco/nenhum exercício)</SelectItem>
                              <SelectItem value="light">Leve (exercício leve 1-3 dias/semana)</SelectItem>
                              <SelectItem value="moderate">Moderado (exercício moderado 3-5 dias/semana)</SelectItem>
                              <SelectItem value="active">Ativo (exercício intenso 6-7 dias/semana)</SelectItem>
                              <SelectItem value="very_active">Muito Ativo (exercício muito intenso, trabalho físico)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção de Nutrição */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-md font-semibold mb-4 text-primary">🍎 Metas Nutricionais</h4>
                  
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calorias Diárias (kcal)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            placeholder="2000" 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4 mt-4">
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
                              placeholder="150" 
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
                              placeholder="200" 
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
                              placeholder="67" 
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Todas as Alterações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="profile" />
    </div>
  );
}
