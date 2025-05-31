import { useState, useEffect } from "react";
import { X, Search, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditSavedFoodModal } from "./edit-saved-food-modal";

type SavedFood = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type SavedFoodsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: SavedFood) => void;
};

export function SavedFoodsModal({
  isOpen,
  onClose,
  onSelectFood,
}: SavedFoodsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFood, setEditingFood] = useState<SavedFood | null>(null);
  const [deletingFood, setDeletingFood] = useState<SavedFood | null>(null);

  const { data: savedFoods, isLoading, isError } = useQuery({
    queryKey: ["/api/users", user?.uid, "saved-foods"],
    queryFn: async () => {
      if (!user?.uid) return [];
      try {
        const response = await apiRequest("GET", `/api/users/${user.uid}/saved-foods`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Erro ao buscar alimentos salvos:", error);
        return [];
      }
    },
    enabled: !!user?.uid && isOpen,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Garantir que temos um array válido para trabalhar
  const safeData = savedFoods || [];
  
  const filteredFoods = searchTerm.trim() === '' 
    ? safeData 
    : safeData.filter((food) => 
        food.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
  // Mostrar mensagem de erro em um useEffect para evitar problemas de renderização
  useEffect(() => {
    if (isError && isOpen) {
      toast({
        title: "Erro ao carregar alimentos",
        description: "Não foi possível carregar seus alimentos salvos",
        variant: "destructive",
      });
    }
  }, [isError, isOpen, toast]);

  const handleDelete = async (food: SavedFood) => {
    if (!user?.uid) return;

    try {
      const response = await apiRequest(
        "DELETE",
        `/api/users/${user.uid}/saved-foods/${food.id}`
      );

      if (response.ok) {
        toast({
          title: "Alimento removido",
          description: `${food.name} foi removido dos seus alimentos salvos.`,
        });
        // Refresh the saved foods list
        queryClient.invalidateQueries({
          queryKey: ["/api/users", user.uid, "saved-foods"],
        });
      } else {
        throw new Error("Falha ao deletar alimento");
      }
    } catch (error) {
      console.error("Error deleting saved food:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o alimento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingFood(null);
    }
  };

  const handleFoodUpdated = () => {
    // Refresh the saved foods list after editing
    if (user?.uid) {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", user.uid, "saved-foods"],
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Alimentos Salvos
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="relative mb-4">
          <Input
            placeholder="Buscar alimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Nenhum alimento salvo encontrado
            </p>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                // Aqui podemos abrir o modal para adicionar um novo alimento
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar novo alimento
            </Button>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectFood(food);
                    onClose();
                  }}
                >
                  <p className="font-medium">{food.name}</p>
                  <p className="text-sm text-gray-500">
                    {food.quantity} {food.unit} • {food.calories} kcal
                  </p>
                  <p className="text-sm text-gray-400">
                    P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFood(food);
                    }}
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingFood(food);
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>

      {/* Edit Modal */}
      {editingFood && (
        <EditSavedFoodModal
          isOpen={!!editingFood}
          onClose={() => setEditingFood(null)}
          food={editingFood}
          onFoodUpdated={handleFoodUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFood} onOpenChange={() => setDeletingFood(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Alimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{deletingFood?.name}" dos seus alimentos salvos?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFood && handleDelete(deletingFood)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}