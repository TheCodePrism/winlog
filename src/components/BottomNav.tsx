import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Target, 
  Trophy, 
  Settings
} from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dreams', label: 'Dreams', icon: Sparkles },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/achievements', label: 'Wins', icon: Trophy },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-50 px-4 py-2 flex justify-around items-center transition-colors duration-300 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-all duration-200
              ${isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }
            `}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
