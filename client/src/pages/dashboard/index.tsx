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
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, Flame } from "lucide-react";
import { AddFoodOptionsModal } from "@/components/food-log/add-food-options-modal";
import { SavedFoodsModal } from "@/components/food-log/saved-foods-modal";
import { FoodDatabaseModal } from "@/components/food-log/food-database-modal";
import { FoodSearchModal } from "@/components/food-log/food-search-modal";
import { EditFoodModal } from "@/components/food-log/edit-food-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define type for Food
type Food = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType?: string;
};

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
  const [showFoodSearchModal, setShowFoodSearchModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [selectedFoodToEdit, setSelectedFoodToEdit] = useState<Food | null>(null);
  const [editFoodMode, setEditFoodMode] = useState<'edit' | 'add'>('edit');
  const [selectedFoodForAdding, setSelectedFoodForAdding] = useState<SavedFood | null>(null);

  const formattedDate = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "dd MMM", { locale: ptBR });
  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const { data: foodLogs = [], isLoading: isLoadingFoodLogs, refetch: refetchFoodLogs } = useQuery({
    queryKey: ["/api/food-logs", user?.uid, formattedDate],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      // Use the API directly instead of Firebase
      try {
        const response = await apiRequest("GET", `/api/users/${user.uid}/food-logs/${formattedDate}`);
        const data = await response.json();
        console.log("Fetched food logs:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching food logs:", error);
        return [];
      }
    },
    enabled: !!user?.uid
  });

  // Group food logs by meal type
  const mealTypes = ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Lanche", "Jantar", "Ceia"];
  
  // Log the mealTypes for debugging
  console.log("All food logs:", foodLogs); 
  
  const foodLogsByMeal = mealTypes.map(mealType => {
    const logs = foodLogs.filter(log => log.mealType === mealType);
    const calories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);

    return {
      type: mealType,
      foods: logs,
      calories
    };
  });

  // Calculate totals with proper rounding (1 decimal place max)
  const totalCaloriesConsumed = Math.round(foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0) * 10) / 10;
  const totalProteinConsumed = Math.round(foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0) * 10) / 10;
  const totalCarbsConsumed = Math.round(foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0) * 10) / 10;
  const totalFatConsumed = Math.round(foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0) * 10) / 10;

  // Get user targets
  const targetCalories = user?.calories || 2000;
  const targetProtein = user?.protein || 150;
  const targetCarbs = user?.carbs || 200;
  const targetFat = user?.fat || 70;

  const remainingCalories = Math.round((targetCalories - totalCaloriesConsumed) * 10) / 10;
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
        setShowFoodSearchModal(true);
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
    console.log("Dashboard: Edit food triggered with:", food);
    
    if (!food || !food.id) {
      console.error("Dashboard: Received invalid food for editing", food);
      toast({
        title: "Erro",
        description: "Não foi possível editar este alimento. Dados inválidos.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a properly formatted food object for editing
    const foodForEdit = {
      id: food.id,
      name: food.name || "Item sem nome",
      quantity: food.quantity || 0,
      unit: food.unit || "g",
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      mealType: food.mealType || ""
    };
    
    setSelectedFoodToEdit(foodForEdit);
    setEditFoodMode('edit');
    setShowEditFoodModal(true);
  }

  // Function to handle food selection - open EditFoodModal in add mode
  function handleFoodSelection(food: SavedFood) {
    console.log("Handling food selection:", food);
    setShowSavedFoodsModal(false);
    
    // Convert SavedFood to FoodItem format for EditFoodModal
    const foodForAdding = {
      id: `temp-${Date.now()}`, // Temporary ID for add mode
      name: food.name,
      quantity: food.quantity,
      unit: food.unit,
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      mealType: "" // Empty initially, user will select in modal
    };
    
    setSelectedFoodToEdit(foodForAdding);
    setEditFoodMode('add');
    setShowEditFoodModal(true);
  }

  // Function to handle Brazilian food database selection - open EditFoodModal in add mode
  function handleFoodDatabaseSelection(food: any) {
    console.log("Handling Brazilian food database selection:", food);
    setShowFoodSearchModal(false);
    
    // Convert food database item to FoodItem format for EditFoodModal
    const foodForAdding = {
      id: `temp-${Date.now()}`, // Temporary ID for add mode
      name: food.name,
      quantity: 100, // Default 100g since database shows per 100g
      unit: "g",
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      mealType: "" // Empty initially, user will select in modal
    };
    
    setSelectedFoodToEdit(foodForAdding);
    setEditFoodMode('add');
    setShowEditFoodModal(true);
  }

  return (
    <div className="app-container min-h-screen flex flex-col pb-16" style={{backgroundColor: '#FFF8F6'}}>
      {/* Header */}
      <header className="forkfit-gradient px-4 py-6 text-primary-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-primary-foreground">
              ForkFit
            </h1>
            <i className="fas fa-utensils text-primary-foreground text-lg"></i>
          </div>
          <button className="text-primary-foreground/80 p-2 rounded-full hover:bg-white/10 transition-all duration-300">
            <BellIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5 pb-20">
        {/* Date Selector */}
        <div className="mobile-card bg-white p-4 mb-6 flex justify-between items-center">
          <button 
            className="text-primary p-2 rounded-full hover:bg-primary/10 transition-all duration-300"
            onClick={handlePreviousDay}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-center">
            <span className="font-bold text-slate-800">{isToday ? "Hoje" : format(currentDate, "EEEE", { locale: ptBR })}</span>
            <span className="text-slate-500 text-sm block">{displayDate}</span>
          </h2>
          <button 
            className={`p-2 rounded-full transition-all duration-300 ${
              isToday 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-primary hover:bg-primary/10'
            }`}
            onClick={handleNextDay}
            disabled={isToday}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Summary */}
        <div className="mobile-card bg-gradient-to-br from-white to-slate-50 p-6 mb-6 border border-slate-100 shadow-lg">
          <h3 className="text-xl font-bold mb-5 text-slate-800 text-center tracking-wide">Resumo Diário</h3>

          {/* Calories Progress Ring */}
          <div className="flex flex-col items-center justify-center mb-4">
            <ProgressRing 
              percentage={caloriesProgress > 100 ? 100 : caloriesProgress} 
              size={170} 
              strokeWidth={10}
              color={caloriesProgress > 100 ? 'var(--status-error)' : 'var(--primary)'}
              backgroundColor="var(--muted)"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="h-7 w-7 text-orange-500" />
                  <span className="text-4xl font-bold font-body text-slate-800">{totalCaloriesConsumed}</span>
                </div>
                <span className="block text-base text-slate-600 font-medium">/ {targetCalories} kcal</span>
              </div>
            </ProgressRing>
            <div className="mt-3 text-center bg-slate-100 px-4 py-2 rounded-xl">
              <p className="text-base text-slate-700">
                Restante: <span className="font-bold text-lg text-slate-800">{remainingCalories} kcal</span>
              </p>
            </div>
          </div>

          {/* Macros Progress */}
          <div className="grid grid-cols-3 gap-5 mt-6">
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
              color="bg-orange-500"
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
                date={formattedDate}
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

      {/* Brazilian Food Search Modal */}
      {showFoodSearchModal && (
        <FoodSearchModal
          isOpen={showFoodSearchModal}
          onClose={() => setShowFoodSearchModal(false)}
          onSelectFood={handleFoodDatabaseSelection}
        />
      )}

      {/* Edit Food Modal */}
      {showEditFoodModal && selectedFoodToEdit && (
        <EditFoodModal
          isOpen={showEditFoodModal}
          foodItem={selectedFoodToEdit}
          date={formattedDate}
          mode={editFoodMode}
          onClose={() => {
            setShowEditFoodModal(false);
            setSelectedFoodToEdit(null);
            setEditFoodMode('edit');
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