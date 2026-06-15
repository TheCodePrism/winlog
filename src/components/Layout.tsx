import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function Layout() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check local storage or system preference
    const saved = localStorage.getItem('winlog-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('winlog-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('winlog-theme', 'light');
    }
  }, [darkMode]);

  // Determine section title based on route
  const getSectionTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/dreams')) return 'Dreams';
    if (path.startsWith('/goals')) return 'Goals';
    if (path.startsWith('/milestones')) return 'Milestones';
    if (path.startsWith('/achievements')) return 'Wins & Achievements';
    if (path.startsWith('/reflections')) return 'Reflections Journal';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Winlog';
  };

  // Get motivational subtext based on route
  const getSectionSubtext = () => {
    const path = location.pathname;
    if (path === '/') return 'Every step counts. Track your path to success.';
    if (path.startsWith('/dreams')) return 'Dream big. Shape your long-term aspirations.';
    if (path.startsWith('/goals')) return 'Concrete steps. Turn your dreams into executable goals.';
    if (path.startsWith('/milestones')) return 'Key checkpoints. Break down goals into manageable milestones.';
    if (path.startsWith('/achievements')) return 'Celebrate every win. You earned this.';
    if (path.startsWith('/reflections')) return 'Reflect on your growth and internal insights.';
    if (path.startsWith('/settings')) return 'Manage your local data and backup settings.';
    return 'Celebrate your wins.';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 z-40 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display m-0 leading-none">
              {getSectionTitle()}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-none flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              {getSectionSubtext()}
            </p>
          </div>

          {/* Mobile Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
