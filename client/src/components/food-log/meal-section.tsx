import { FoodItem } from "@/components/food-log/food-item";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

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
  return (
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
        className="mt-3 text-primary text-sm font-medium flex items-center"
        onClick={onAddFood}
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Adicionar alimento
      </Button>
    </div>
  );
}
