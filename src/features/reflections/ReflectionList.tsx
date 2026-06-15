import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/dates';
import { BookOpen, Plus, Calendar, Search, Trash2 } from 'lucide-react';


export default function ReflectionList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [dreamFilter, setDreamFilter] = useState('all');

  // Queries
  const reflections = useLiveQuery(() => db.reflections.toArray());
  const dreams = useLiveQuery(() => db.dreams.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());

  // Filter
  const filteredRefs = reflections?.filter((ref) => {
    if (search.trim() && !(
      (ref.title && ref.title.toLowerCase().includes(search.toLowerCase())) ||
      ref.content.toLowerCase().includes(search.toLowerCase())
    )) return false;

    if (moodFilter !== 'all' && ref.mood !== moodFilter) return false;
    if (dreamFilter !== 'all' && ref.relatedDreamId !== dreamFilter) return false;

    return true;
  }) || [];

  // Sort: newest first
  const sortedRefs = [...filteredRefs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Delete reflection
  const handleDeleteRef = async (id: string) => {
    if (confirm('Are you sure you want to delete this reflection?')) {
      try {
        await db.reflections.delete(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const moods = ['😊', '🚀', '🧘', '🤔', '📈', '😴', '😔'];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all duration-300 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reflections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
            />
          </div>

          <button
            onClick={() => navigate('/reflections/new')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Write Entry</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Mood Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Mood:</span>
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-355 text-xs focus:outline-none"
            >
              <option value="all">All Moods</option>
              {moods.map((m) => (
                <option key={m} value={m}>{m}</option>
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

      {/* Reflections list */}
      {reflections === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : sortedRefs.length === 0 ? (
        <EmptyState
          title="Empty Journal"
          description={
            search || moodFilter !== 'all' || dreamFilter !== 'all'
              ? "No reflections match your current filter settings."
              : "Self-reflection is key to growth. Document your feelings, lessons, and insights on this journey."
          }
          icon={BookOpen}
          actionText={search === '' && moodFilter === 'all' && dreamFilter === 'all' ? "Write Entry" : undefined}
          onAction={() => navigate('/reflections/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedRefs.map((ref) => {
            const relDream = dreams?.find((d) => d.id === ref.relatedDreamId);
            const relGoal = goals?.find((g) => g.id === ref.relatedGoalId);

            return (
              <div
                key={ref.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  {/* Top line info */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Calendar className="h-4 w-4" />
                      {formatDate(ref.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {ref.mood && (
                        <span className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-lg shadow-sm border border-slate-100 dark:border-slate-800">
                          {ref.mood}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteRef(ref.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        aria-label="Delete reflection entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {ref.title && (
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white font-display mb-2 mt-0 leading-snug">
                      {ref.title}
                    </h3>
                  )}

                  <p className="text-sm text-slate-600 dark:text-slate-350 mt-1 mb-0 leading-relaxed whitespace-pre-line">
                    {ref.content}
                  </p>
                </div>

                {/* Chips */}
                {(relDream || relGoal) && (
                  <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-850 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
