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
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelectFood(food);
                  onClose();
                }}
              >
                <div>
                  <p className="font-medium">{food.name}</p>
                  <p className="text-sm text-gray-500">
                    {food.quantity} {food.unit} • {food.calories} kcal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}