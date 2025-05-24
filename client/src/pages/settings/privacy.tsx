import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
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
            Privacidade
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Política de Privacidade</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Esta página será preenchida com nossa política de privacidade completa.
            </p>
            <p>
              Aqui incluiremos informações sobre como coletamos, usamos e protegemos
              seus dados pessoais no ForkFit.
            </p>
          </div>

          <h2 className="text-lg font-semibold mb-4 mt-8">Termos de Uso</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Esta seção conterá nossos termos de uso e condições de serviço.
            </p>
            <p>
              Definiremos aqui as regras e responsabilidades para o uso do aplicativo ForkFit.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="settings" />
    </div>
  );
}