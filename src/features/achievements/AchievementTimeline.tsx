import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/dates';
import { Trophy, Plus, Calendar, Search, Trash2 } from 'lucide-react';


export default function AchievementTimeline() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dreamFilter, setDreamFilter] = useState('all');

  // Queries
  const achievements = useLiveQuery(() => db.achievements.toArray());
  const dreams = useLiveQuery(() => db.dreams.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());

  // Filter achievements
  const filteredWins = achievements?.filter((win) => {
    if (search.trim() && !win.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && win.category !== categoryFilter) return false;
    if (dreamFilter !== 'all' && win.relatedDreamId !== dreamFilter) return false;
    return true;
  }) || [];

  // Sort: newest achievement date first
  const sortedWins = [...filteredWins].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handle delete
  const handleDeleteWin = async (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      try {
        await db.achievements.delete(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const categories = [
    'Personal',
    'Career',
    'Health & Fitness',
    'Finance',
    'Travel & Adventure',
    'Relationships',
    'Creative & Hobbies',
    'Learning & Skills',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Top filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-300 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search wins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
            />
          </div>

          <button
            onClick={() => navigate('/achievements/new')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Log a Win</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Dream Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Dream:</span>
            <select
              value={dreamFilter}
              onChange={(e) => setDreamFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-350 text-xs focus:outline-none max-w-xs truncate"
            >
              <option value="all">All Dreams</option>
              {dreams?.map((dream) => (
                <option key={dream.id} value={dream.id}>
                  {dream.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline view */}
      {achievements === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : sortedWins.length === 0 ? (
        <EmptyState
          title="No achievements yet"
          description={
            search || categoryFilter !== 'all' || dreamFilter !== 'all'
              ? "No recorded wins match your current filters."
              : "Every victory deserves recognition. Log your first success to start building your victory archive!"
          }
          icon={Trophy}
          actionText={search === '' && categoryFilter === 'all' && dreamFilter === 'all' ? "Log a Win" : undefined}
          onAction={() => navigate('/achievements/new')}
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 py-4 space-y-8">
          {sortedWins.map((win) => {
            const relDream = dreams?.find((d) => d.id === win.relatedDreamId);
            const relGoal = goals?.find((g) => g.id === win.relatedGoalId);

            return (
              <div key={win.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-10.5 sm:-left-12.5 top-1.5 h-7 w-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 dark:shadow-none transition-transform duration-300 group-hover:scale-110 z-10">
                  <Trophy className="h-3.5 w-3.5" />
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {formatDate(win.date)}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-55 dark:bg-slate-800 dark:text-slate-400 text-slate-500 border border-slate-100 dark:border-slate-800">
                        {win.category || 'General'}
                      </span>
                      <button
                        onClick={() => handleDeleteWin(win.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Delete win log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white font-display m-0 leading-snug">
                    {win.title}
                  </h3>

                  {win.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-0 leading-relaxed">
                      {win.description}
                    </p>
                  )}

                  {/* Context chips */}
                  {(relDream || relGoal) && (
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-850 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {relDream && (
                        <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-950/20">
                          Dream: {relDream.title}
                        </span>
                      )}
                      {relGoal && (
                        <span className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                          Goal: {relGoal.title}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
