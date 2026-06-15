import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import EmptyState from '../../components/EmptyState';
import { Sparkles, Plus, ChevronRight, Tag } from 'lucide-react';

export default function DreamList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'paused' | 'archived'>('active');

  const dreams = useLiveQuery(() => db.dreams.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());

  // Filter dreams by active tab status
  const filteredDreams = dreams?.filter((d) => d.status === activeTab) || [];

  // Helper to calculate progress percentage for a dream
  const calculateDreamProgress = (dreamId: string) => {
    if (!goals) return 0;
    const dreamGoals = goals.filter((g) => g.dreamId === dreamId);
    if (dreamGoals.length === 0) return 0;
    const completedGoals = dreamGoals.filter((g) => g.status === 'completed');
    return Math.round((completedGoals.length / dreamGoals.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-950';
      case 'completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-950';
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-950';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const tabs: { value: typeof activeTab; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/20">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer
                ${activeTab === tab.value
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/dreams/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Dream</span>
        </button>
      </div>

      {/* Grid of Dreams */}
      {dreams === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : filteredDreams.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} dreams`}
          description={
            activeTab === 'active'
              ? "Every journey starts with a single vision. Add a big aspiration that inspires you to grow."
              : `You don't have any dreams marked as ${activeTab} yet.`
          }
          icon={Sparkles}
          actionText={activeTab === 'active' ? "Add a Dream" : undefined}
          onAction={activeTab === 'active' ? () => navigate('/dreams/new') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDreams.map((dream) => {
            const progress = calculateDreamProgress(dream.id);
            const dreamGoals = goals?.filter((g) => g.dreamId === dream.id) || [];
            
            return (
              <div
                key={dream.id}
                onClick={() => navigate(`/dreams/${dream.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    {/* Category badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <Tag className="h-3.5 w-3.5" />
                      {dream.category || 'General'}
                    </span>
                    
                    {/* Status badge (if not active tab, just in case) */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(dream.status)}`}>
                      {dream.status}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 font-display m-0 leading-tight">
                    {dream.title}
                  </h3>

                  {dream.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-0 line-clamp-2 leading-relaxed">
                      {dream.description}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5">
                    <span>{dreamGoals.length} Goal{dreamGoals.length !== 1 ? 's' : ''} Linked</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{progress}% Complete</span>
                  </div>
                  
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-850 flex justify-end">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform duration-200">
                      <span>View details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
