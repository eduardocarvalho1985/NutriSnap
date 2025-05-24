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
          <h2 className="text-lg font-semibold">Perguntas Frequentes</h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como registrar minha alimentação?
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Esta pergunta será respondida em breve com instruções detalhadas.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como usar a análise de alimentos por IA?
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Instruções sobre como usar a funcionalidade de IA serão adicionadas aqui.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como definir minhas metas nutricionais?
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Guia sobre configuração de metas será incluído nesta seção.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Como visualizar meu progresso?
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Explicação sobre os gráficos e relatórios será adicionada aqui.
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
              <p className="text-gray-700 text-sm mb-4">
                Entre em contato conosco para suporte adicional.
              </p>
              <p className="text-gray-600 text-xs">
                Informações de contato serão adicionadas em breve.
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