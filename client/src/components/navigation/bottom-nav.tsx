import { Link, useLocation } from "wouter";
import { HomeIcon, BarChart2Icon, DumbbellIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type BottomNavProps = {
  activePage: 'home' | 'progress' | 'workout' | 'settings' | 'profile';
};

export function BottomNav({ activePage }: BottomNavProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user has completed onboarding
    if (!user?.onboardingCompleted) {
      // New user - redirect to onboarding
      setLocation("/onboarding");
    } else {
      // Existing user - go to profile
      setLocation("/profile");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex justify-around">
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
          className={`flex flex-col items-center py-2 px-3 cursor-pointer ${activePage === 'profile' ? 'text-primary' : 'text-gray-500'} relative`}
        >
          <UserIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Perfil</span>
          {activePage === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
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
    console.log(`Navigating to: ${href}`);
    setLocation(href);
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex flex-col items-center py-2 px-3 cursor-pointer ${isActive ? 'text-primary' : 'text-gray-500'} relative`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
      )}
    </div>
  );
}
