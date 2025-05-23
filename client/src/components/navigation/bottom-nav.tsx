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
    
    console.log("Profile clicked - user onboarding status:", user?.onboardingCompleted);
    
    // For users who might have just completed onboarding, check the database directly
    if (user?.uid) {
      try {
        const response = await fetch(`/api/users/${user.uid}`);
        if (response.ok) {
          const latestUserData = await response.json();
          console.log("Full user data from database:", latestUserData);
          console.log("Onboarding completed field:", latestUserData.onboardingCompleted);
          console.log("Type of onboardingCompleted:", typeof latestUserData.onboardingCompleted);
          
          // Check for both boolean true and string 'true' (PostgreSQL might return 't')
          const isOnboardingCompleted = latestUserData.onboardingCompleted === true || 
                                       latestUserData.onboardingCompleted === 't' ||
                                       latestUserData.onboarding_completed === true ||
                                       latestUserData.onboarding_completed === 't';
          
          console.log("Is onboarding completed?", isOnboardingCompleted);
          
          if (!isOnboardingCompleted) {
            console.log("Redirecting to onboarding");
            window.location.href = "/onboarding";
          } else {
            console.log("Redirecting to profile");
            window.location.href = "/profile";
          }
          return;
        }
      } catch (error) {
        console.log("Error checking user status, falling back to cached data");
      }
    }
    
    // Fallback to cached user data
    if (!user?.onboardingCompleted) {
      console.log("Redirecting to onboarding (fallback)");
      window.location.href = "/onboarding";
    } else {
      console.log("Redirecting to profile (fallback)");
      window.location.href = "/profile";
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
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
    e.stopPropagation();
    console.log(`🚀 Button clicked! Navigating to: ${href}`);
    
    // Use window.location for direct navigation
    window.location.href = href;
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
