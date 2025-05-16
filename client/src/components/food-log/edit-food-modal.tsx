import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import { Loader2Icon, Trash2Icon } from "lucide-react";

interface FoodItem {
  id: string | number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType?: string;
}

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem: FoodItem | null;
  date: string;
  onDelete?: () => void;
}

export function EditFoodModal({
  isOpen = false,
  onClose,
  foodItem,
  date,
  onDelete,
}: EditFoodModalProps) {
  console.log("EditFoodModal opened with:", { isOpen, foodItem, date });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Common units for food measurements
  const commonUnits = ["g", "kg", "ml", "l", "oz", "lb", "unidade", "porção", "colher", "xícara"];

  // Available meal types
  const mealTypes = [
    "Café da Manhã",
    "Lanche da Manhã", 
    "Almoço", 
    "Lanche da Tarde", 
    "Jantar", 
    "Ceia"
  ];

  // Populate form with food data when opened
  useEffect(() => {
    if (foodItem) {
      setName(foodItem.name);
      setQuantity(foodItem.quantity.toString());
      setUnit(foodItem.unit);
      setCalories(foodItem.calories.toString());
      setProtein(foodItem.protein?.toString() || "0");
      setCarbs(foodItem.carbs?.toString() || "0");
      setFat(foodItem.fat?.toString() || "0");
      setMealType(foodItem.mealType || "");
    }
  }, [foodItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid || !foodItem) return;

    try {
      setIsLoading(true);

      // Prepare the updated food data
      const updatedFood = {
        id: foodItem.id,
        name,
        quantity: parseFloat(quantity),
        unit,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        mealType: mealType,
        date
      };

      // Call API to update the food log
      const response = await apiRequest(
        "PUT", 
        `/api/users/${user.uid}/food-logs/${foodItem.id}`, 
        updatedFood
      );

      if (!response.ok) {
        throw new Error("Failed to update food entry");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs", user.uid, date] });

      toast({
        title: "Alimento atualizado",
        description: `${name} foi atualizado com sucesso.`,
      });

      onClose();
    } catch (error) {
      console.error("Error updating food:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o alimento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-lg">
        <DialogHeader className="mb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-center text-xl font-semibold">
              Editar Alimento
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Alimento</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Frango Grelhado"
                required
              />
            </div>

            <div>
              <Label htmlFor="mealType">Refeição</Label>
              <Select 
                value={mealType} 
                onValueChange={setMealType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a refeição" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select 
                  value={unit} 
                  onValueChange={setUnit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonUnits.map((unitOption) => (
                      <SelectItem key={unitOption} value={unitOption}>
                        {unitOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="calories">Calorias (kcal)</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Ex: 165"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="protein">Proteína (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Ex: 25"
                />
              </div>

              <div>
                <Label htmlFor="carbs">Carboidratos (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <Label htmlFor="fat">Gorduras (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="Ex: 5"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : "Atualizar Alimento"}
            </Button>
            
            <div className="flex w-full justify-between gap-2">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onDelete && typeof onDelete === 'function') {
                    try {
                      onDelete();
                    } catch (error) {
                      console.error("Error in delete handler:", error);
                    }
                  }
                  onClose();
                }}
                className="flex-1"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Excluir
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onClose()}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}