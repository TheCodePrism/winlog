import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { triggerConfetti } from '../../utils/confetti';
import { formatDate, getDaysRemaining } from '../../utils/dates';
import EmptyState from '../../components/EmptyState';
import { Milestone, Calendar, Clock, Tag } from 'lucide-react';

export default function MilestoneList() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  // Queries
  const milestones = useLiveQuery(() => db.milestones.toArray());
  const goals = useLiveQuery(() => db.goals.toArray());
  const dreams = useLiveQuery(() => db.dreams.toArray());

  // Filter & Sort milestones
  const filteredMilestones = milestones?.filter((m) => m.status === activeTab) || [];
  
  // Sort pending by due date (nulls last), completed by completedAt (newest first)
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    if (activeTab === 'pending') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }
  });

  // Toggle completion
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

  const tabs: { value: typeof activeTab; label: string }[] = [
    { value: 'pending', label: 'Upcoming / Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
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

      {/* List */}
      {milestones === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : sortedMilestones.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} milestones`}
          description={
            activeTab === 'pending'
              ? "All caught up! Any new checkpoints you create under your goals will appear here."
              : "Keep pushing forward! Check off your first checkpoint from any goal details page."
          }
          icon={Milestone}
        />
      ) : (
        <div className="space-y-4">
          {sortedMilestones.map((m) => {
            const mGoal = goals?.find((g) => g.id === m.goalId);
            const mDream = dreams?.find((d) => d.id === mGoal?.dreamId);
            const daysRemaining = getDaysRemaining(m.dueDate);

            return (
              <div
                key={m.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm transition-all duration-200 gap-4 ${
                  m.status === 'completed'
                    ? 'border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20 dark:bg-emerald-955/5'
                    : 'border-slate-100 dark:border-slate-850 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleMilestone(m.id, m.status)}
                    className={`mt-0.5 rounded-full h-6 w-6 shrink-0 flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                      m.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'border-slate-350 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {m.status === 'completed' && (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <span className={`text-base font-bold block leading-tight ${
                      m.status === 'completed'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-250'
                    }`}>
                      {m.title}
                    </span>

                    {/* Context info: Goal and Dream */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-400">
                      {mGoal && (
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                          Goal: {mGoal.title}
                        </span>
                      )}
                      {mDream && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Dream: {mDream.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date Info */}
                <div className="shrink-0 flex items-center sm:justify-end text-xs font-semibold text-slate-455">
                  {m.status === 'completed' ? (
                    <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-950 px-2.5 py-1 rounded-xl">
                      Done {formatDate(m.completedAt || m.updatedAt)}
                    </span>
                  ) : m.dueDate ? (
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(m.dueDate)}
                      </span>
                      {daysRemaining && (
                        <span className={`flex items-center gap-1 font-bold ${daysRemaining.urgent ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400'}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {daysRemaining.text}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No due date</span>
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
