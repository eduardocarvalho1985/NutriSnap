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
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-xl mr-2">📄</span>
              Política de Privacidade
            </h2>
            <h3 className="text-base font-medium text-gray-800 mb-3">Como protegemos seus dados</h3>
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>
                Levamos sua privacidade a sério. Coletamos apenas o essencial para oferecer uma boa experiência no ForkFit — como nome, e-mail e suas escolhas alimentares. Tudo é armazenado com segurança e nunca será compartilhado sem seu consentimento.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <span className="text-xl mr-2">⚖️</span>
              Termos de Uso
            </h2>
            <h3 className="text-base font-medium text-gray-800 mb-3">Uso responsável do ForkFit</h3>
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              <p>
                Ao usar o ForkFit, você concorda em registrar informações reais e usar o app apenas para fins pessoais. Não nos responsabilizamos por decisões médicas — sempre consulte um profissional de saúde.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="settings" />
    </div>
  );
}