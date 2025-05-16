import { useState } from "react";
import { FoodItem } from "@/components/food-log/food-item";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddFoodOptionsModal } from "./add-food-options-modal";
import { AddFoodModal } from "./add-food-modal";
import { SavedFoodsModal } from "./saved-foods-modal";
import { FoodDatabaseModal } from "./food-database-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { QueryClient } from "@tanstack/react-query";

// Para tipagem da API Firebase
declare global {
  interface Window {
    firebase?: {
      auth?: () => {
        currentUser: {
          uid: string;
        } | null;
      };
    };
  }
}

interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealSectionProps {
  title: string;
  calories: number;
  foods: Food[];
  isLast?: boolean;
  onAddFood: () => void;
  onEditFood?: (food: Food) => void;
  onDeleteFood?: (food: Food) => void;
}

export function MealSection({ 
  title, 
  calories, 
  foods, 
  isLast = false, 
  onAddFood, 
  onEditFood,
  onDeleteFood
}: MealSectionProps) {
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isSavedFoodsModalOpen, setIsSavedFoodsModalOpen] = useState(false);
  const [isFoodDatabaseModalOpen, setIsFoodDatabaseModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Data atual
  const today = new Date().toISOString().split('T')[0];

  const handleSelectOption = (option: string) => {
    setIsOptionsModalOpen(false);

    switch(option) {
      case "recently-logged":
        // Por enquanto, abrir o modal padrão para alimentos recentes
        setIsAddFoodModalOpen(true);
        break;
      case "saved-foods":
        setIsSavedFoodsModalOpen(true);
        break;
      case "food-database":
        setIsFoodDatabaseModalOpen(true);
        break;
      case "scan-food":
        // Por enquanto, abrir o modal padrão para scan de alimentos
        setIsAddFoodModalOpen(true);
        break;
      default:
        setIsAddFoodModalOpen(true);
        break;
    }
  };

  const handleAddFood = () => {
    setIsOptionsModalOpen(true);
  };

  // Função para adicionar alimento do banco de dados ou salvos
  const handleSelectFood = async (food: any) => {
    try {
      if (!food || !food.name) {
        console.error("Alimento inválido", food);
        return;
      }

      console.log("Alimento selecionado:", food);

      if (!user || !user.uid) {
        console.error("Usuário não autenticado");
        toast({
          title: "Erro ao adicionar alimento",
          description: "Você precisa estar logado para adicionar alimentos",
          variant: "destructive"
        });
        return;
      }

      // Adicionar ao registro diário através da API
      await apiRequest("POST", `/api/users/${user.uid}/food-logs`, {
        date: today,
        mealType: title,
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0
      });

      toast({
        title: "Alimento adicionado",
        description: `${food.name} foi adicionado à sua refeição.`
      });

      // Chamar a callback para atualizar a UI
      onAddFood();
    } catch (error: any) {
      console.error("Erro ao adicionar alimento:", error);

      toast({
        title: "Erro ao adicionar alimento",
        description: error.message || "Ocorreu um erro ao adicionar este alimento",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className={`meal-section ${!isLast ? 'border-b border-gray-100 pb-4' : 'pb-4'}`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800">{title}</h4>
          <span className="text-sm text-gray-500">{calories} kcal</span>
        </div>

        {/* Food items list */}
        <div className="space-y-3">
          {foods.length > 0 ? (
            foods.map((food) => (
              <FoodItem
                key={food.id}
                id={food.id}
                name={food.name}
                quantity={food.quantity}
                unit={food.unit}
                calories={food.calories}
                protein={food.protein}
                carbs={food.carbs}
                fat={food.fat}
                onEdit={() => onEditFood && onEditFood(food)}
                onDelete={async () => {
                  try {
                    if (!user || !user.uid) return;

                    await apiRequest(
                      "DELETE", 
                      `/api/users/${user.uid}/food-logs/${food.id}`
                    );

                    // Show success toast
                    toast({
                      title: "Alimento removido",
                      description: "O alimento foi removido com sucesso"
                    });

                    // Call the callback to refresh the UI
                    onAddFood();
                  } catch (error: any) {
                    console.error("Erro ao deletar alimento:", error);
                    toast({
                      title: "Erro ao remover alimento",
                      description: error.message || "Ocorreu um erro ao remover este alimento",
                      variant: "destructive"
                    });
                  }
                }}
              />
            ))
          ) : (
            <div className="py-3 text-center text-gray-500 text-sm border-b border-gray-50">
              Nenhum alimento registrado
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          className="mt-3 text-primary text-sm font-medium flex items-center w-full justify-center"
          onClick={handleAddFood}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Adicionar alimento
        </Button>
      </div>

      {/* Modais */}
      {isOptionsModalOpen && (
        <AddFoodOptionsModal
          isOpen={true}
          onClose={() => setIsOptionsModalOpen(false)}
          onSelectOption={handleSelectOption}
          date={today}
          selectedMeal={title}
        />
      )}

      {isAddFoodModalOpen && (
        <AddFoodModal
          onClose={() => setIsAddFoodModalOpen(false)}
          date={today}
          selectedMeal={title}
        />
      )}

      {isSavedFoodsModalOpen && (
        <SavedFoodsModal
          isOpen={true}
          onClose={() => setIsSavedFoodsModalOpen(false)}
          onSelectFood={handleSelectFood}
        />
      )}

      {isFoodDatabaseModalOpen && (
        <FoodDatabaseModal
          isOpen={true}
          onClose={() => setIsFoodDatabaseModalOpen(false)}
          onSelectFood={handleSelectFood}
          onAddNewFood={() => {
            setIsFoodDatabaseModalOpen(false);
            setIsAddFoodModalOpen(true);
          }}
        />
      )}
    </>
  );
}