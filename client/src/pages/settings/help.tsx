import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function Help() {
  const [, setLocation] = useLocation();

  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/settings")}
            className="mr-3 p-1"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold font-heading text-secondary">
            Ajuda
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="text-xl mr-2">❓</span>
            FAQ – Perguntas Frequentes
          </h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como registrar minha alimentação?
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Use a câmera ou escreva os alimentos manualmente. Vamos ajudar a identificar os macros automaticamente.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como usar a análise de alimentos por IA?
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Tire uma foto do seu prato. Nossa IA analisa e estimamos os nutrientes com base na imagem.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como definir minhas metas nutricionais?
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Na aba de perfil, toque em "Metas" e personalize seus objetivos diários de calorias, proteínas, carboidratos e gorduras.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como visualizar meu progresso?
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Acesse a aba "Progresso" para ver gráficos e relatórios semanais sobre sua alimentação e metas atingidas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Precisa de mais ajuda?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Nosso time está aqui para você! Em breve, esta seção incluirá nossos canais de suporte.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="settings" />
    </div>
  );
}