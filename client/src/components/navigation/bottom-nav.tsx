import { Link, useLocation } from "wouter";
import { HomeIcon, BarChart2Icon, DumbbellIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type BottomNavProps = {
  activePage: 'home' | 'progress' | 'workout' | 'settings' | 'profile';
};

export function BottomNav({ activePage }: BottomNavProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log("Profile clicked - bypassing onboarding check");
    
    // Always redirect to profile directly, bypassing onboarding check
    window.location.href = "/profile";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/20 z-50 backdrop-blur-xl">
      <div className="flex justify-around py-1">
        <NavItem 
          href="/dashboard" 
          icon={<HomeIcon className="h-6 w-6" />}
          label="Home"
          isActive={activePage === 'home'}
        />
        
        <NavItem 
          href="/progress" 
          icon={<BarChart2Icon className="h-6 w-6" />}
          label="Progresso"
          isActive={activePage === 'progress'}
        />
        
        <NavItem 
          href="/workouts" 
          icon={<DumbbellIcon className="h-6 w-6" />}
          label="Treinos"
          isActive={activePage === 'workout'}
        />
        
        <NavItem 
          href="/settings" 
          icon={<SettingsIcon className="h-6 w-6" />}
          label="Ajustes"
          isActive={activePage === 'settings'}
        />
        
        {/* Smart Profile Navigation */}
        <div
          onClick={handleProfileClick}
          className={`flex flex-col items-center py-3 px-4 cursor-pointer transition-all duration-300 ${
            activePage === 'profile' 
              ? 'text-primary transform scale-110' 
              : 'text-slate-500 hover:text-primary/70'
          } relative`}
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Perfil</span>
          {activePage === 'profile' && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          )}
        </div>
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🚀 Button clicked! Navigating to: ${href}`);
    
    // Use window.location for direct navigation
    window.location.href = href;
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex flex-col items-center py-3 px-4 cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'text-primary transform scale-110' 
          : 'text-slate-500 hover:text-primary/70'
      } relative`}
    >
      <div className="h-5 w-5">{icon}</div>
      <span className="text-xs mt-1 font-medium">{label}</span>
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
      )}
    </div>
  );
}
