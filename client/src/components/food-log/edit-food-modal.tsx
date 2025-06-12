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
  mode?: 'edit' | 'add';
  onDelete?: () => void;
}

export function EditFoodModal({
  isOpen = false,
  onClose,
  foodItem,
  date,
  mode = 'edit',
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

  // Store original values for proportional calculations
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [originalUnit, setOriginalUnit] = useState("");
  const [originalCalories, setOriginalCalories] = useState(0);
  const [originalProtein, setOriginalProtein] = useState(0);
  const [originalCarbs, setOriginalCarbs] = useState(0);
  const [originalFat, setOriginalFat] = useState(0);

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

  // Function to convert units to grams for consistent calculations
  const convertToGrams = (quantity: number, unit: string): number => {
    const conversions: { [key: string]: number } = {
      'g': 1,
      'kg': 1000,
      'ml': 1, // Assuming 1ml = 1g for simplicity
      'l': 1000,
      'oz': 28.35,
      'lb': 453.59,
      'unidade': 1,
      'porção': 1,
      'colher': 15, // Assuming tablespoon = 15g
      'xícara': 240 // Assuming cup = 240g
    };
    return quantity * (conversions[unit.toLowerCase()] || 1);
  };

  // Function to calculate nutritional values based on quantity change
  const calculateProportionalValues = (newQuantity: number, newUnit: string) => {
    if (originalQuantity <= 0) return;

    const originalGrams = convertToGrams(originalQuantity, originalUnit);
    const newGrams = convertToGrams(newQuantity, newUnit);
    const ratio = newGrams / originalGrams;

    const newCalories = Math.round(originalCalories * ratio);
    const newProtein = Math.round((originalProtein * ratio) * 10) / 10; // Round to 1 decimal
    const newCarbs = Math.round((originalCarbs * ratio) * 10) / 10;
    const newFat = Math.round((originalFat * ratio) * 10) / 10;

    setCalories(newCalories.toString());
    setProtein(newProtein.toString());
    setCarbs(newCarbs.toString());
    setFat(newFat.toString());
  };

  // Handle quantity change with automatic macro adjustment
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      calculateProportionalValues(numValue, unit);
    }
  };

  // Handle unit change with automatic macro adjustment
  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    const numQuantity = parseFloat(quantity);
    if (!isNaN(numQuantity) && numQuantity > 0) {
      calculateProportionalValues(numQuantity, newUnit);
    }
  };

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

      // Store original values for calculations
      setOriginalQuantity(foodItem.quantity);
      setOriginalUnit(foodItem.unit);
      setOriginalCalories(foodItem.calories);
      setOriginalProtein(foodItem.protein || 0);
      setOriginalCarbs(foodItem.carbs || 0);
      setOriginalFat(foodItem.fat || 0);
    }
  }, [foodItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid || !foodItem) return;

    // Validate meal type is required
    if (!mealType || mealType.trim() === "") {
      toast({
        title: "Tipo de refeição obrigatório",
        description: "Por favor, selecione o tipo de refeição.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Prepare the food data
      const foodData = {
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

      let response;

      if (mode === 'add') {
        // Add new food log
        response = await apiRequest(
          "POST", 
          `/api/users/${user.uid}/food-logs`, 
          foodData
        );
      } else {
        // Update existing food log
        response = await apiRequest(
          "PUT", 
          `/api/users/${user.uid}/food-logs/${foodItem.id}`, 
          { ...foodData, id: foodItem.id }
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to ${mode === 'add' ? 'add' : 'update'} food entry`);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs", user.uid, date] });

      toast({
        title: mode === 'add' ? "Alimento adicionado" : "Alimento atualizado",
        description: `${name} foi ${mode === 'add' ? 'adicionado' : 'atualizado'} com sucesso.`,
      });

      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'add' ? 'adding' : 'updating'} food:`, error);
      toast({
        title: `Erro ao ${mode === 'add' ? 'adicionar' : 'atualizar'}`,
        description: `Não foi possível ${mode === 'add' ? 'adicionar' : 'atualizar'} o alimento. Tente novamente.`,
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
              {mode === 'add' ? 'Adicionar Alimento' : 'Editar Alimento'}
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
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="Ex: 100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select 
                  value={unit} 
                  onValueChange={handleUnitChange}
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
              <Label htmlFor="calories">
                Calorias (kcal) 
                <span className="text-xs text-gray-500 ml-1">
                  - ajustado automaticamente
                </span>
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Ex: 165"
                required
                className="bg-blue-50 border-blue-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="protein">
                  Proteína (g)
                  <span className="text-xs text-gray-500 block">auto-ajustado</span>
                </Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Ex: 25"
                  className="bg-blue-50 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="carbs">
                  Carboidratos (g)
                  <span className="text-xs text-gray-500 block">auto-ajustado</span>
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Ex: 10"
                  className="bg-blue-50 border-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="fat">
                  Gorduras (g)
                  <span className="text-xs text-gray-500 block">auto-ajustado</span>
                </Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="Ex: 5"
                  className="bg-blue-50 border-blue-200"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col space-y-3 mt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-10 mb-2"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (mode === 'add' ? 'Adicionar à Refeição' : 'Atualizar')}
            </Button>
            
            {mode === 'edit' ? (
              <div className="flex w-full gap-3">
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
                  className="h-10 flex-1"
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onClose()}
                  className="h-10 flex-1"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onClose()}
                className="w-full h-10"
              >
                Cancelar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}