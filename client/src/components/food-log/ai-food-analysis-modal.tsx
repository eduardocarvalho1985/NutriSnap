import { useState, useRef } from "react";
import { X, Camera, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

type AIFoodAnalysisModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFoodAnalyzed: (foodData: any) => void;
  date: string;
  selectedMeal: string | null;
};

export function AIFoodAnalysisModal({
  isOpen,
  onClose,
  onFoodAnalyzed,
  date,
  selectedMeal,
}: AIFoodAnalysisModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !user?.uid) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await apiRequest("POST", `/api/users/${user.uid}/food-image`, {
        image: selectedImage,
        mealType: selectedMeal || "Lanche",
        date: date,
      });

      const foodData = await response.json();

      if (response.ok) {
        toast({
          title: "Análise concluída! 🎉",
          description: `Detectado: ${foodData.food}`,
        });
        onFoodAnalyzed(foodData);
        handleClose();
      } else {
        throw new Error(foodData.message || "Erro na análise");
      }
    } catch (error: any) {
      console.error("Erro na análise por IA:", error);
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a imagem",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setIsAnalyzing(false);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Análise por IA 🤖
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedImage ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 text-sm">
                Tire uma foto ou selecione uma imagem do seu alimento
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-8 w-8 text-gray-500" />
                  <span className="text-sm">Câmera</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-8 w-8 text-gray-500" />
                  <span className="text-sm">Galeria</span>
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Food to analyze"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Pronto para analisar este alimento?
                </p>
                <p className="text-xs text-gray-500">
                  A IA irá identificar o alimento e calcular os valores nutricionais
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImage(null)}
                  disabled={isAnalyzing}
                >
                  Trocar Foto
                </Button>
                
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    "Analisar 🤖"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}