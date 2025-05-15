import { useState } from "react";
import { FoodItem } from "@/components/food-log/food-item";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddFoodOptionsModal } from "./add-food-options-modal";
import { AddFoodModal } from "./add-food-modal";
import { SavedFoodsModal } from "./saved-foods-modal";
import { FoodDatabaseModal } from "./food-database-modal";

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
}

export function MealSection({ title, calories, foods, isLast = false, onAddFood }: MealSectionProps) {
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isSavedFoodsModalOpen, setIsSavedFoodsModalOpen] = useState(false);
  const [isFoodDatabaseModalOpen, setIsFoodDatabaseModalOpen] = useState(false);
  
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
  const handleSelectFood = (food: any) => {
    // Aqui implementaremos a adição do alimento salvado ao diário
    console.log("Alimento selecionado:", food);
    // Chamar a callback de adição
    onAddFood();
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
                name={food.name}
                quantity={food.quantity}
                unit={food.unit}
                calories={food.calories}
                protein={food.protein}
                carbs={food.carbs}
                fat={food.fat}
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
      <AddFoodOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onSelectOption={handleSelectOption}
        date={today}
        selectedMeal={title}
      />
      
      <AddFoodModal
        onClose={() => setIsAddFoodModalOpen(false)}
        date={today}
        selectedMeal={title}
      />
      
      <SavedFoodsModal
        isOpen={isSavedFoodsModalOpen}
        onClose={() => setIsSavedFoodsModalOpen(false)}
        onSelectFood={handleSelectFood}
      />
      
      <FoodDatabaseModal
        isOpen={isFoodDatabaseModalOpen}
        onClose={() => setIsFoodDatabaseModalOpen(false)}
        onSelectFood={handleSelectFood}
        onAddNewFood={() => {
          setIsFoodDatabaseModalOpen(false);
          setIsAddFoodModalOpen(true);
        }}
      />
    </>
  );
}
