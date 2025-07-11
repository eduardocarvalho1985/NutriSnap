import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { signOutUser, updateUserProfile } from "@/lib/firebase";
import { useLocation } from "wouter";
import {
  BellIcon,
  GlobeIcon,
  CreditCardIcon,
  ShieldIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(user?.dailyReminders ?? true);
  const [weeklyReports, setWeeklyReports] = useState(user?.weeklyReports ?? true);

  async function handleUpdateNotifications(type: 'daily' | 'weekly', value: boolean) {
    if (!user?.uid) return;
    
    try {
      const updateData = type === 'daily' 
        ? { dailyReminders: value }
        : { weeklyReports: value };
      
      await updateUserProfile(user.uid, updateData);
      updateUser(updateData);
      
      if (type === 'daily') {
        setDailyReminders(value);
      } else {
        setWeeklyReports(value);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar notificações",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function handleLanguageClick() {
    toast({
      title: "Outros idiomas",
      description: "Outros idiomas disponíveis em breve.",
    });
  }

  function handleSubscriptionClick() {
    toast({
      title: "Plano Premium",
      description: "Ainda não lançamos nosso plano premium. Continue usando gratuitamente e fique ligado para nosso lançamento oficial.",
    });
  }

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOutUser();
      setLocation("/auth/login");
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container min-h-screen flex flex-col bg-neutral-light pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold font-heading text-secondary">
            Ajustes
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="space-y-4">
          {/* Subscription Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Plano Gratuito</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ainda não lançamos nosso plano premium. Continue usando gratuitamente e fique ligado para nosso lançamento oficial.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Notificações</h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BellIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span>Lembretes diários</span>
                    </div>
                    <Switch 
                      checked={dailyReminders} 
                      onCheckedChange={(checked) => handleUpdateNotifications('daily', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BellIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span>Relatórios semanais</span>
                    </div>
                    <Switch 
                      checked={weeklyReports} 
                      onCheckedChange={(checked) => handleUpdateNotifications('weekly', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Geral</h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <button 
                    className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded"
                    onClick={handleLanguageClick}
                  >
                    <div className="flex items-center">
                      <GlobeIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span>Idioma</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <span className="mr-1">Português (BR)</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </div>
                  </button>

                  <Separator />

                  <button 
                    className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded"
                    onClick={handleSubscriptionClick}
                  >
                    <div className="flex items-center">
                      <CreditCardIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span>Gerenciar Assinatura</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  <Separator />

                  <button 
                    className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded"
                    onClick={() => setLocation("/settings/privacy")}
                  >
                    <div className="flex items-center">
                      <ShieldIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span>Privacidade</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  <Separator />

                  <button 
                    className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded"
                    onClick={() => setLocation("/settings/help")}
                  >
                    <div className="flex items-center">
                      <HelpCircleIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span>Ajuda</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  <Separator />

                  <Button
                    variant="ghost"
                    className="w-full flex justify-start text-red-500 hover:text-red-600 hover:bg-red-50 py-2"
                    onClick={handleSignOut}
                    disabled={isLoading}
                  >
                    <LogOutIcon className="h-5 w-5 mr-3" />
                    {isLoading ? "Saindo..." : "Sair da conta"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* App Info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>ForkFit v0.1.0</p>
            <p className="mt-1">&copy; 2025 ForkFit. Todos os direitos reservados.</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activePage="settings" />
    </div>
  );
}
