import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { MacroProgress } from "@/components/dashboard/macro-progress";
import { MealSection } from "@/components/food-log/meal-section";
import { AddFoodModal } from "@/components/food-log/add-food-modal";
import { getFoodLogs, addFoodLog } from "@/lib/firebase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { AddFoodOptionsModal } from "@/components/food-log/add-food-options-modal";
import { SavedFoodsModal } from "@/components/food-log/saved-foods-modal";
import { FoodDatabaseModal } from "@/components/food-log/food-database-modal";
import { EditFoodModal } from "@/components/food-log/edit-food-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define type for SavedFood
type SavedFood = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Move useQueryClient hook to component level
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showAddFoodOptionsModal, setShowAddFoodOptionsModal] = useState(false);
  const [showSavedFoodsModal, setShowSavedFoodsModal] = useState(false);
  const [showFoodDatabaseModal, setShowFoodDatabaseModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [selectedFoodToEdit, setSelectedFoodToEdit] = useState<Food | null>(null);

  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "dd MMM", { locale: ptBR });
  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const { data: foodLogs = [], isLoading: isLoadingFoodLogs } = useQuery({
    queryKey: ["/api/food-logs", user?.uid, formattedDate],
    queryFn: async () => {
      if (!user?.uid) return [];
      return getFoodLogs(user.uid, formattedDate);
    },
    enabled: !!user?.uid
  });

  // Group food logs by meal type
  const mealTypes = ["Café da Manhã", "Almoço", "Lanche", "Jantar", "Ceia"];
  const foodLogsByMeal = mealTypes.map(mealType => {
    const logs = foodLogs.filter(log => log.mealType === mealType);
    const calories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);

    return {
      type: mealType,
      foods: logs,
      calories
    };
  });

  // Calculate totals
  const totalCaloriesConsumed = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProteinConsumed = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbsConsumed = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFatConsumed = foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  // Get user targets
  const targetCalories = user?.calories || 2000;
  const targetProtein = user?.protein || 150;
  const targetCarbs = user?.carbs || 200;
  const targetFat = user?.fat || 70;

  const remainingCalories = targetCalories - totalCaloriesConsumed;
  const caloriesProgress = (totalCaloriesConsumed / targetCalories) * 100;

  function handlePreviousDay() {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  }

  function handleNextDay() {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  }

  function handleAddFood(mealType: string) {
    setSelectedMeal(mealType);
    setShowAddFoodOptionsModal(true); // Open options modal instead of directly adding food
  }

  function handleAddMeal() {
    setSelectedMeal(null);
    setShowAddFoodOptionsModal(true); // Open options modal instead of directly adding food
  }

  function handleAddFoodOptionSelect(option: string) {
    setShowAddFoodOptionsModal(false);
    switch (option) {
      case "manual-entry":
        setShowAddFoodModal(true);
        break;
      case "saved-foods":
        setShowSavedFoodsModal(true);
        break;
      case "food-database":
        setShowFoodDatabaseModal(true);
        break;
      case "recently-logged":
        // This will be implemented later
        toast({
          title: "Em breve",
          description: "Esta funcionalidade será implementada em breve.",
        });
        break;
      default:
        break;
    }
  }

  // Handler for editing a food entry
  function handleEditFood(food: Food) {
    setSelectedFoodToEdit({
      ...food,
      mealType: food.mealType
    });
    setShowEditFoodModal(true);
  }

  // Function to handle food selection
  async function handleFoodSelection(food: SavedFood) {
    if (!user?.uid) return;

    try {
      // Determine which meal to use - if no meal is selected, use "Lanche" as default
      const mealToUse = selectedMeal || "Lanche";

      // Add selected food to log
      await addFoodLog(user.uid, formattedDate, mealToUse, {
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0
      });

      // Invalidate queries after the food is added
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs", user.uid, formattedDate] });

      toast({
        title: "Alimento adicionado",
        description: `${food.name} foi adicionado ao seu registro como ${mealToUse}.`
      });
    } catch (error) {
      console.error("Error adding food from saved foods:", error);
      toast({
        title: "Erro ao adicionar alimento",
        description: "Ocorreu um erro ao adicionar este alimento ao seu registro.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-secondary">
            <span className="text-primary">Nutri</span>Snap
          </h1>
          <button className="text-primary p-1 rounded-full hover:bg-gray-100">
            <BellIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5 pb-20">
        {/* Date Selector */}
        <div className="flex justify-between items-center mb-6">
          <button 
            className="text-gray-600 p-1"
            onClick={handlePreviousDay}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium">
            <span className="font-semibold">{isToday ? "Hoje" : format(currentDate, "EEEE", { locale: ptBR })}</span>
            <span className="text-gray-500 text-sm ml-1">{displayDate}</span>
          </h2>
          <button 
            className="text-gray-600 p-1"
            onClick={handleNextDay}
            disabled={isToday}
          >
            <ChevronRightIcon className={`h-5 w-5 ${isToday ? 'text-gray-300' : ''}`} />
          </button>
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Resumo Diário</h3>

          {/* Calories Progress Ring */}
          <div className="flex flex-col items-center justify-center mb-5">
            <ProgressRing 
              percentage={caloriesProgress > 100 ? 100 : caloriesProgress} 
              size={150} 
              strokeWidth={8}
              color={caloriesProgress > 100 ? 'var(--status-error)' : 'var(--primary)'}
              backgroundColor="var(--muted)"
            >
              <div className="text-center">
                <span className="block text-3xl font-semibold font-body">{totalCaloriesConsumed}</span>
                <span className="block text-sm text-gray-500">/ {targetCalories} kcal</span>
              </div>
            </ProgressRing>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-700">
                Restante: <span className="font-medium">{remainingCalories} kcal</span>
              </p>
            </div>
          </div>

          {/* Macros Progress */}
          <div className="grid grid-cols-3 gap-4 mt-3">
            {/* Protein */}
            <MacroProgress 
              label="Proteína"
              current={totalProteinConsumed}
              target={targetProtein}
              unit="g"
              color="bg-blue-500"
            />

            {/* Carbs */}
            <MacroProgress 
              label="Carbs"
              current={totalCarbsConsumed}
              target={targetCarbs}
              unit="g"
              color="bg-yellow-500"
            />

            {/* Fat */}
            <MacroProgress 
              label="Gordura"
              current={totalFatConsumed}
              target={targetFat}
              unit="g"
              color="bg-red-500"
            />
          </div>
        </div>

        {/* Food Log Section */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="text-lg font-semibold mb-3">Refeições de {isToday ? 'Hoje' : format(currentDate, "dd 'de' MMMM", { locale: ptBR })}</h3>

          {/* Meal sections */}
          <div className="space-y-5">
            {foodLogsByMeal.map((meal, index) => (
              <MealSection 
                key={meal.type}
                title={meal.type}
                calories={meal.calories}
                foods={meal.foods}
                isLast={index === foodLogsByMeal.length - 1}
                onAddFood={() => handleAddFood(meal.type)}
                onEditFood={handleEditFood}
                onDeleteFood={async (food) => {
                  if (!user?.uid || !food.id) return;

                  try {
                    await apiRequest(
                      "DELETE", 
                      `/api/users/${user.uid}/food-logs/${food.id}`
                    );

                    // Show success toast
                    toast({
                      title: "Alimento removido",
                      description: "O alimento foi removido com sucesso"
                    });

                    // Invalidate queries to refresh the data
                    queryClient.invalidateQueries({
                      queryKey: ["/api/food-logs", user.uid, formattedDate]
                    });
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
            ))}
          </div>

          {/* Add meal button */}
          <Button
            variant="outline"
            className="mt-4 text-center w-full py-3 border-dashed border-gray-300 text-primary font-medium hover:bg-gray-50 flex items-center justify-center"
            onClick={handleAddMeal}
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Adicionar Refeição
          </Button>
        </div>
      </main>

      {/* Add Food Floating Button */}
      <div className="fixed bottom-20 right-5 z-10">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark"
          onClick={() => setShowAddFoodOptionsModal(true)}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Food Adding Modals */}
      {showAddFoodOptionsModal && (
        <AddFoodOptionsModal
          isOpen={showAddFoodOptionsModal}
          onClose={() => setShowAddFoodOptionsModal(false)}
          onSelectOption={handleAddFoodOptionSelect}
          date={formattedDate}
          selectedMeal={selectedMeal}
        />
      )}

      {showAddFoodModal && (
        <AddFoodModal
          onClose={() => setShowAddFoodModal(false)}
          date={formattedDate}
          selectedMeal={selectedMeal}
        />
      )}

      {showSavedFoodsModal && (
        <SavedFoodsModal
          isOpen={showSavedFoodsModal}
          onClose={() => setShowSavedFoodsModal(false)}
          onSelectFood={(food) => {
            handleFoodSelection(food);
            setShowSavedFoodsModal(false);
          }}
        />
      )}

      {showFoodDatabaseModal && (
        <FoodDatabaseModal
          isOpen={showFoodDatabaseModal}
          onClose={() => setShowFoodDatabaseModal(false)}
          onSelectFood={(food) => {
            handleFoodSelection(food);
            setShowFoodDatabaseModal(false);
          }}
          onAddNewFood={() => {
            setShowAddFoodModal(true);
          }}
        />
      )}

      {/* Edit Food Modal */}
      {showEditFoodModal && selectedFoodToEdit && (
        <EditFoodModal
          food={selectedFoodToEdit}
          onClose={() => {
            setShowEditFoodModal(false);
            setSelectedFoodToEdit(null);
          }}
          onDelete={async () => {
            if (!user?.uid || !selectedFoodToEdit?.id) return;

            try {
              await apiRequest(
                "DELETE", 
                `/api/users/${user.uid}/food-logs/${selectedFoodToEdit.id}`
              );

              // Show success toast
              toast({
                title: "Alimento removido",
                description: "O alimento foi removido com sucesso"
              });

              // Invalidate queries to refresh the data
              queryClient.invalidateQueries({
                queryKey: ["/api/food-logs", user.uid, formattedDate]
              });
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
      )}

      {/* Bottom Navigation */}
      <BottomNav activePage="home" />
    </div>
  );
}