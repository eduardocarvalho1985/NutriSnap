import { useState } from "react";
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
  age: z.coerce.number().min(14, "Idade mínima: 14 anos").max(120, "Idade máxima: 120 anos"),
  gender: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(100, "Altura mínima: 100 cm").max(250, "Altura máxima: 250 cm"),
  weight: z.coerce.number().min(30, "Peso mínimo: 30 kg").max(300, "Peso máximo: 300 kg"),
  profession: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      age: user?.age || undefined,
      gender: user?.gender || undefined,
      height: user?.height || undefined,
      weight: user?.weight || undefined,
      profession: user?.profession || ""
    }
  });

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
              <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center">
                <span className="font-medium">{user?.height} cm</span>
              </div>
              <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center">
                <span className="font-medium">{user?.weight} kg</span>
              </div>
              <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="font-medium">{user?.age} anos</span>
              </div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-md text-center mb-2">
              <p className="text-sm text-primary-dark">
                {user?.goal === "lose_weight" ? "Meta: Perder Peso" :
                 user?.goal === "maintain" ? "Meta: Manter Peso" :
                 user?.goal === "gain_muscle" ? "Meta: Ganhar Massa Muscular" : "Meta não definida"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
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
                
                <Button 
                  type="submit" 
                  className="w-full mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
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
