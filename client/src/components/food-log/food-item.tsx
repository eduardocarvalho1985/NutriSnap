interface FoodItemProps {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function FoodItem({ name, quantity, unit, calories, protein, carbs, fat }: FoodItemProps) {
  // Format the unit label
  const getUnitLabel = (unitCode: string): string => {
    switch (unitCode) {
      case 'g': return 'g';
      case 'ml': return 'ml';
      case 'unit': return quantity > 1 ? 'unidades' : 'unidade';
      case 'portion': return quantity > 1 ? 'porções' : 'porção';
      default: return unitCode;
    }
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">
          {quantity} {getUnitLabel(unit)} • {calories} kcal
        </p>
      </div>
      <div className="text-xs text-gray-600">
        <span>{protein}p</span> • <span>{carbs}c</span> • <span>{fat}g</span>
      </div>
    </div>
  );
}
