import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type AddFoodOptionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
  date: string;
  selectedMeal: string | null;
};

export function AddFoodOptionsModal({
  isOpen,
  onClose,
  onSelectOption,
  date,
  selectedMeal,
}: AddFoodOptionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Adicionar Alimento
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary"
            onClick={() => {
              console.log("AI button clicked!");
              onSelectOption("ai-analysis");
            }}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-2">
              <span className="text-white">🤖</span>
            </div>
            <span className="text-sm font-medium">Análise por IA</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary"
            onClick={() => onSelectOption("manual-entry")}
          >
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600">✏️</span>
            </div>
            <span className="text-sm font-medium">Entrada manual</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary"
            onClick={() => onSelectOption("recently-logged")}
          >
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600">⏱️</span>
            </div>
            <span className="text-sm font-medium">Refeições recentes</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary"
            onClick={() => onSelectOption("saved-foods")}
          >
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600">⭐</span>
            </div>
            <span className="text-sm font-medium">Alimentos salvos</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary"
            onClick={() => onSelectOption("food-database")}
          >
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-gray-600">🔍</span>
            </div>
            <span className="text-sm font-medium">Banco de alimentos</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}