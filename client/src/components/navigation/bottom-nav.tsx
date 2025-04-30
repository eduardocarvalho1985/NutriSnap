import { Link } from "wouter";
import { HomeIcon, BarChart2Icon, DumbbellIcon, SettingsIcon, UserIcon } from "lucide-react";

type BottomNavProps = {
  activePage: 'home' | 'progress' | 'workout' | 'settings' | 'profile';
};

export function BottomNav({ activePage }: BottomNavProps) {
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
        
        <NavItem 
          href="/profile" 
          icon={<UserIcon className="h-6 w-6" />}
          label="Perfil"
          isActive={activePage === 'profile'}
        />
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
  return (
    <Link href={href}>
      <a className={`flex flex-col items-center py-2 px-3 ${isActive ? 'text-primary' : 'text-gray-500'} relative`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        )}
      </a>
    </Link>
  );
}
