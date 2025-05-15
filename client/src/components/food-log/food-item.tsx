import { X } from "lucide-react";

interface FoodItemProps {
  id: string | number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function FoodItem({ 
  name, 
  quantity, 
  unit, 
  calories,
  protein,
  carbs,
  fat,
  onDelete,
  onEdit
}: FoodItemProps) {
  return (
    <div 
      className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 rounded px-1"
      onClick={onEdit}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-800">{name}</span>
          <span className="text-sm font-medium ml-2">{calories} kcal</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <span>{quantity} {unit}</span>
          {(protein || carbs || fat) && (
            <span className="ml-2">
              {protein ? `P: ${protein}g` : ''} 
              {carbs ? `${protein ? ' • ' : ''}C: ${carbs}g` : ''}
              {fat ? `${protein || carbs ? ' • ' : ''}G: ${fat}g` : ''}
            </span>
          )}
        </div>
      </div>
      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering parent onClick
            onDelete();
          }}
          className="p-1 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}