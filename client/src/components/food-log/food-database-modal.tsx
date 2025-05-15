import { useState } from "react";
import { X, Search, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FoodItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type FoodDatabaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
  onAddNewFood: () => void;
};

export function FoodDatabaseModal({
  isOpen,
  onClose,
  onSelectFood,
  onAddNewFood,
}: FoodDatabaseModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Placeholder para futura implementação - buscar no banco de dados
  const isLoading = false;
  const foods: FoodItem[] = [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Banco de Alimentos
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
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              O banco de alimentos está em desenvolvimento
            </p>
            <Button
              onClick={() => {
                onClose();
                onAddNewFood();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar novo alimento
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}