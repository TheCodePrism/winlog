import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/dates';
import { Target, Plus, Tag, ChevronRight, Calendar, Search } from 'lucide-react';


export default function GoalList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dreamFilter, setDreamFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'paused'>('active');

  // Queries
  const goals = useLiveQuery(() => db.goals.toArray());
  const dreams = useLiveQuery(() => db.dreams.toArray());
  const milestones = useLiveQuery(() => db.milestones.toArray());

  // Filter goals
  const filteredGoals = goals?.filter((goal) => {
    // Tab filters
    if (activeTab === 'active' && (goal.status === 'completed' || goal.status === 'paused')) return false;
    if (activeTab === 'completed' && goal.status !== 'completed') return false;
    if (activeTab === 'paused' && goal.status !== 'paused') return false;

    // Search filter
    if (search.trim() && !goal.title.toLowerCase().includes(search.toLowerCase())) return false;

    // Priority filter
    if (priorityFilter !== 'all' && goal.priority !== priorityFilter) return false;

    // Dream filter
    if (dreamFilter !== 'all' && goal.dreamId !== dreamFilter) return false;

    return true;
  }) || [];

  // Helper to calculate milestone progress for a goal
  const calculateGoalProgress = (goalId: string) => {
    if (!milestones) return 0;
    const goalMilestones = milestones.filter((m) => m.goalId === goalId);
    if (goalMilestones.length === 0) return 0;
    const completed = goalMilestones.filter((m) => m.status === 'completed');
    return Math.round((completed.length / goalMilestones.length) * 100);
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-950';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-950';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const tabs: { value: typeof activeTab; label: string }[] = [
    { value: 'active', label: 'Active Goals' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm transition-all duration-300 space-y-4">
        {/* Row 1: Search & Add button */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search goals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
            />
          </div>

          <button
            onClick={() => navigate('/goals/new')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Row 2: Select Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Dream Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Dream:</span>
            <select
              value={dreamFilter}
              onChange={(e) => setDreamFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:outline-none max-w-xs truncate"
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

      {/* Tab Selectors */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/20 w-max">
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

      {/* Goal Cards Grid */}
      {goals === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          title={`No goals found`}
          description={
            activeTab === 'active'
              ? "Every great dream is achieved through small steps. Define your first actionable goal now."
              : `No goals match your current status or filter options.`
          }
          icon={Target}
          actionText={activeTab === 'active' && search === '' && priorityFilter === 'all' && dreamFilter === 'all' ? "Add a Goal" : undefined}
          onAction={activeTab === 'active' ? () => navigate('/goals/new') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => {
            const progress = calculateGoalProgress(goal.id);
            const parentDream = dreams?.find((d) => d.id === goal.dreamId);
            const goalMilestones = milestones?.filter((m) => m.goalId === goal.id) || [];
            const completedMilestones = goalMilestones.filter((m) => m.status === 'completed').length;

            return (
              <div
                key={goal.id}
                onClick={() => navigate(`/goals/${goal.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    {/* Priority badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(goal.priority)}`}>
                      {goal.priority} Priority
                    </span>
                    
                    {/* Due Date or Status */}
                    {goal.targetDate ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(goal.targetDate)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {goal.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-display m-0 leading-tight">
                    {goal.title}
                  </h3>

                  {parentDream && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-455">
                      <Tag className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[200px]">{parentDream.title}</span>
                    </div>
                  )}

                  {goal.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-0 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress calculation */}
                <div className="mt-6">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5">
                    <span>
                      {completedMilestones}/{goalMilestones.length} Milestone{goalMilestones.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-700 dark:text-slate-350 font-bold">{progress}% Done</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-850 flex justify-end">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform duration-200">
                      <span>View goal details</span>
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
