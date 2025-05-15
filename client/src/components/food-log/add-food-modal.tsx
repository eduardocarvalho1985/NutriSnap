import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addFoodLog } from "@/lib/firebase";
import { XIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Form validation schema
const foodLogSchema = z.object({
  mealType: z.string().min(1, "Selecione um tipo de refeição"),
  name: z.string().min(1, "Nome do alimento é obrigatório"),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unit: z.string().min(1, "Selecione uma unidade"),
  calories: z.coerce.number().nonnegative("Calorias não podem ser negativas"),
  protein: z.coerce.number().nonnegative("Proteína não pode ser negativa").optional().default(0),
  carbs: z.coerce.number().nonnegative("Carboidratos não podem ser negativos").optional().default(0),
  fat: z.coerce.number().nonnegative("Gordura não pode ser negativa").optional().default(0)
});

type FoodLogFormValues = z.infer<typeof foodLogSchema>;

type AddFoodModalProps = {
  onClose: () => void;
  date: string;
  selectedMeal: string | null;
};

export function AddFoodModal({ onClose, date, selectedMeal }: AddFoodModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveForLater, setSaveForLater] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FoodLogFormValues>({
    resolver: zodResolver(foodLogSchema),
    defaultValues: {
      mealType: selectedMeal || "",
      name: "",
      quantity: undefined,
      unit: "g",
      calories: undefined,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });

  async function onSubmit(data: FoodLogFormValues) {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Adicionar o alimento ao registro diário
      await addFoodLog(user.uid, date, data.mealType, {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      });
      
      // Invalidate food logs query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs", user.uid, date] });
      
      // Se a opção de salvar estiver marcada, salvar o alimento para uso futuro
      if (saveForLater) {
        try {
          await apiRequest("POST", `/api/users/${user.uid}/saved-foods`, {
            name: data.name,
            quantity: data.quantity,
            unit: data.unit,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat
          });
          
          toast({
            title: "Alimento salvo",
            description: `${data.name} foi salvo para uso futuro.`,
          });
          
          // Invalidar a query de alimentos salvos para atualizar a lista
          queryClient.invalidateQueries({ queryKey: ["/api/users", user.uid, "saved-foods"] });
        } catch (saveError: any) {
          console.error("Erro ao salvar alimento:", saveError);
          toast({
            title: "Erro ao salvar alimento",
            description: "Ocorreu um erro ao salvar este alimento para uso futuro.",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Alimento adicionado",
        description: `${data.name} foi adicionado ao seu registro.`
      });
      
      // Fechar o modal após a submissão bem-sucedida
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar alimento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const mealOptions = [
    { value: "Café da Manhã", label: "Café da Manhã" },
    { value: "Almoço", label: "Almoço" },
    { value: "Lanche", label: "Lanche" },
    { value: "Jantar", label: "Jantar" },
    { value: "Ceia", label: "Ceia" }
  ];
  
  const unitOptions = [
    { value: "g", label: "gramas (g)" },
    { value: "ml", label: "mililitros (ml)" },
    { value: "unit", label: "unidade(s)" },
    { value: "portion", label: "porção" }
  ];

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">Adicionar Alimento</DialogTitle>
            <button 
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => onClose()}
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refeição</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a refeição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mealOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Alimento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Arroz Integral" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
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
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calorias (kcal)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="150" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
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
                          placeholder="5" 
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
                          placeholder="30" 
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
                          placeholder="2" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="save-for-later"
                  checked={saveForLater}
                  onCheckedChange={(checked) => setSaveForLater(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="save-for-later" className="text-sm font-medium">
                  Salvar este alimento para uso futuro
                </Label>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
