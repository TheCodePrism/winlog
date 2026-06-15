import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { triggerConfetti } from '../../utils/confetti';
import { formatDate } from '../../utils/dates';
import {
  Sparkles,
  Target,
  Milestone,
  Trophy,
  BookOpen,
  ArrowRight,
  Heart
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reflectionPrompt, setReflectionPrompt] = useState('');

  // Queries
  const dreams = useLiveQuery(() => db.dreams.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());
  const milestones = useLiveQuery(() => db.milestones.toArray());
  const achievements = useLiveQuery(() => db.achievements.toArray());

  // Motivational prompts
  const prompts = [
    "What progress did you make today? Celebrate the small steps.",
    "What are you proud of this week? Own your wins.",
    "What is one small next step you can take today?",
    "What obstacle did you overcome recently, and what did it teach you?",
    "Which dream still excites you the most?",
    "Take a breath. You are making progress, even if it feels slow."
  ];

  useEffect(() => {
    // Select a random prompt on mount
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setReflectionPrompt(randomPrompt);
  }, []);

  // Compute counts
  const totalDreams = dreams?.length || 0;
  const activeGoals = goals?.filter((g) => g.status === 'in_progress' || g.status === 'not_started').length || 0;
  
  const totalMilestones = milestones?.length || 0;
  const completedMilestones = milestones?.filter((m) => m.status === 'completed').length || 0;
  
  const recentWins = achievements
    ? [...achievements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    : [];

  const upcomingMilestones = milestones
    ? [...milestones]
        .filter((m) => m.status === 'pending' && m.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 3)
    : [];

  const handleToggleMilestone = async (mId: string, currentStatus: string) => {
    try {
      const isCompleteNow = currentStatus === 'pending';
      const now = new Date().toISOString();
      await db.milestones.update(mId, {
        status: isCompleteNow ? 'completed' : 'pending',
        completedAt: isCompleteNow ? now : undefined,
        updatedAt: now,
      });

      if (isCompleteNow) {
        triggerConfetti();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    {
      title: 'Total Dreams',
      value: totalDreams,
      icon: Sparkles,
      color: 'indigo',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      link: '/dreams',
    },
    {
      title: 'Active Goals',
      value: activeGoals,
      icon: Target,
      color: 'blue',
      bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
      link: '/goals',
    },
    {
      title: 'Completed Milestones',
      value: `${completedMilestones}/${totalMilestones}`,
      icon: Milestone,
      color: 'emerald',
      bg: 'bg-emerald-50 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-400',
      link: '/milestones',
    },
    {
      title: 'Recent Wins',
      value: achievements?.length || 0,
      icon: Trophy,
      color: 'amber',
      bg: 'bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400',
      link: '/achievements',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome & Prompt banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-md">
        {/* Background blobs for premium depth */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/25">
            <Heart className="h-3.5 w-3.5 fill-indigo-400/30" />
            <span>Success Journal</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight font-display m-0">
            Welcome to your growth space.
          </h1>

          <p className="text-sm md:text-base text-indigo-200/90 leading-relaxed font-medium m-0 font-display italic">
            "{reflectionPrompt}"
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/reflections/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-105 text-indigo-950 font-bold text-xs shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Write Reflection</span>
            </button>
            
            <button
              onClick={() => navigate('/achievements/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-650 text-white font-bold text-xs border border-indigo-400/20 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Trophy className="h-4 w-4" />
              <span>Log a Win</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`h-9 w-9 rounded-xl ${card.bg} flex items-center justify-center transition-transform duration-300 group-hover:rotate-12`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white font-display leading-none">
                  {card.value}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-455 mt-3 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Split Section: Upcoming Milestones & Recent Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Milestones */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display m-0 flex items-center gap-2">
              <Milestone className="h-5 w-5 text-indigo-500" />
              <span>Upcoming Milestones</span>
            </h3>
            <Link to="/milestones" className="text-xs font-bold text-indigo-650 hover:underline">
              View All
            </Link>
          </div>

          {upcomingMilestones.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No upcoming milestones due. Set a due date on a goal checkpoint to see it here!
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMilestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <button
                      onClick={() => handleToggleMilestone(m.id, m.status)}
                      className="rounded-full h-5 w-5 border border-slate-350 dark:border-slate-600 hover:border-indigo-550 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <span className="sr-only">Complete</span>
                    </button>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {m.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-950/20 px-2 py-0.5 rounded-lg shrink-0">
                    Due {formatDate(m.dueDate!)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wins */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display m-0 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Recent Wins</span>
            </h3>
            <Link to="/achievements" className="text-xs font-bold text-indigo-650 hover:underline">
              View Timeline
            </Link>
          </div>

          {recentWins.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No wins logged yet. Remember, even small accomplishments are worth celebrating!
            </div>
          ) : (
            <div className="space-y-3">
              {recentWins.map((win) => (
                <div
                  key={win.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block leading-tight">
                      {win.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                      {win.category || 'General'}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {formatDate(win.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
