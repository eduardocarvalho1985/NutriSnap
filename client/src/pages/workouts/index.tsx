import { BottomNav } from "@/components/navigation/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DumbbellIcon } from "lucide-react";

export default function Workouts() {
  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-secondary">Treinos</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        <Card className="my-8">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <DumbbellIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Em Breve</h2>
            <p className="text-gray-600 mb-6">
              O módulo de treinos será disponibilizado em uma atualização futura. 
              Aguarde novidades!
            </p>
            <Button variant="outline">Voltar para o Dashboard</Button>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="workout" />
    </div>
  );
}
