import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export function FoodSearchModal({
  isOpen,
  onClose,
  onSelectFood,
}: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Load food categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Search foods when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchFoods();
    } else if (selectedCategory) {
      loadFoodsByCategory(selectedCategory);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await apiRequest("GET", "/api/food-database/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", `/api/food-database/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching foods:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFoodsByCategory = async (category: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", `/api/food-database/category/${encodeURIComponent(category)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error loading foods by category:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setSearchQuery("");
  };

  const handleFoodSelect = (food: FoodItem) => {
    onSelectFood(food);
    onClose();
  };

  const resetModal = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSearchResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetModal();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Alimentos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <Label htmlFor="search">Pesquisar alimentos</Label>
            <Input
              id="search"
              placeholder="Digite o nome do alimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Categories */}
          <div>
            <Label>Categorias</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div>
            <Label>
              Resultados {searchResults.length > 0 && `(${searchResults.length})`}
            </Label>
            <ScrollArea className="h-64 mt-2 border rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2 space-y-2">
                  {searchResults.map((food) => (
                    <div
                      key={food.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleFoodSelect(food)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{food.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{food.category}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-600">
                            <span>{food.calories} kcal</span>
                            <span>{food.protein}g prot</span>
                            <span>{food.carbs}g carb</span>
                            <span>{food.fat}g gord</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 || selectedCategory ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  Nenhum alimento encontrado
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  Digite pelo menos 2 caracteres ou selecione uma categoria
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}