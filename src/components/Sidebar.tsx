import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Target, 
  Milestone, 
  Trophy, 
  BookOpen, 
  Settings,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Sidebar({ darkMode, setDarkMode }: SidebarProps) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dreams', label: 'Dreams', icon: Sparkles },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/milestones', label: 'Milestones', icon: Milestone },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
    { to: '/reflections', label: 'Reflections', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 transition-colors duration-300">
      <div className="flex flex-col flex-1 py-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent m-0 font-display">
              Winlog
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold m-0 leading-none mt-0.5">
              Success Tracker
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all duration-200"
          aria-label="Toggle theme"
        >
          <span className="flex items-center gap-3">
            {darkMode ? (
              <>
                <Moon className="h-5 w-5 text-indigo-400" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-5 w-5 text-amber-500" />
                <span>Light Mode</span>
              </>
            )}
          </span>
          <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-slate-700 relative transition-colors duration-200">
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              darkMode ? 'translate-x-4.5 bg-indigo-500' : 'translate-x-0.5'
            }`} />
          </div>
        </button>
      </div>
    </aside>
  );
}
