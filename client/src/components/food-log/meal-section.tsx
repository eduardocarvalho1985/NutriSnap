import { useState } from "react";
import { FoodItem } from "@/components/food-log/food-item";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddFoodOptionsModal } from "./add-food-options-modal";
import { AddFoodModal } from "./add-food-modal";
import { SavedFoodsModal } from "./saved-foods-modal";
import { FoodDatabaseModal } from "./food-database-modal";
import { AIFoodAnalysisModal } from "./ai-food-analysis-modal";
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
  mealType?: string;
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
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false);
  
  // Debug: Log AI modal state changes
  console.log("AI Modal state:", isAIAnalysisModalOpen);
  const { toast } = useToast();
  const { user } = useAuth();

  // Data atual
  const today = new Date().toISOString().split('T')[0];

  const handleSelectOption = (option: string) => {
    console.log("Option selected:", option);
    setIsOptionsModalOpen(false);

    switch(option) {
      case "ai-analysis":
        console.log("Opening AI analysis modal");
        setIsAIAnalysisModalOpen(true);
        break;
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

  // Função para lidar com dados analisados pela IA
  const handleFoodAnalyzed = async (foodData: any) => {
    try {
      if (!user || !user.uid) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar alimentos",
          variant: "destructive"
        });
        return;
      }

      console.log("Dados analisados pela IA:", foodData);

      // Criar o alimento com os dados da IA
      const response = await apiRequest("POST", `/api/users/${user.uid}/food-logs`, {
        name: foodData.food,
        quantity: foodData.quantity,
        unit: foodData.unit,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        mealType: foodData.mealType,
        date: foodData.date
      });

      if (response.ok) {
        toast({
          title: "Sucesso! 🎉",
          description: `${foodData.food} foi adicionado com IA`,
        });
        
        // Recarregar a página para mostrar o novo alimento
        window.location.reload();
      } else {
        throw new Error("Falha ao salvar alimento");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar alimento analisado pela IA:", error);
      toast({
        title: "Erro ao adicionar alimento",
        description: error.message || "Não foi possível adicionar o alimento",
        variant: "destructive"
      });
    }
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
            foods.filter(food => food !== undefined && food !== null).map((food) => (
              <FoodItem
                key={food.id}
                food={{
                  id: food.id,
                  name: food.name || "Untitled Food",
                  quantity: food.quantity || 0,
                  unit: food.unit || "g",
                  calories: food.calories || 0,
                  protein: food.protein || 0,
                  carbs: food.carbs || 0,
                  fat: food.fat || 0,
                  mealType: title // Use the current meal section title as the mealType
                }}
                onEditFood={(foodItem) => {
                  console.log("Edit food called from MealSection:", foodItem);
                  if (onEditFood && typeof onEditFood === 'function') {
                    onEditFood(food);
                  }
                }}
                onDeleteFood={(foodItem) => {
                  console.log("Delete food called from MealSection:", foodItem);
                  const deleteFood = async () => {
                    try {
                      if (!user || !user.uid) {
                        console.error("No user found for delete operation");
                        return;
                      }
                      
                      if (!food.id) {
                        console.error("No food ID found for delete operation");
                        return;
                      }

                      console.log("Deleting food with ID:", food.id);
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
                  };
                  
                  deleteFood().catch(err => console.error("Error in delete handler:", err));
                }}
              />
            )).filter(Boolean)
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
          onSelectOption={(option) => {
            console.log("MealSection received option:", option);
            handleSelectOption(option);
          }}
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

      {isAIAnalysisModalOpen && (
        <AIFoodAnalysisModal
          isOpen={true}
          onClose={() => setIsAIAnalysisModalOpen(false)}
          onFoodAnalyzed={handleFoodAnalyzed}
          date={today}
          selectedMeal={title}
        />
      )}
    </>
  );
}