import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { triggerConfetti } from '../../utils/confetti';
import { generateId } from '../../utils/ids';
import { formatDate, getDaysRemaining, getCurrentISODateTime } from '../../utils/dates';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Milestone,
  Trophy,
  BookOpen,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Local UI states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Queries
  const goal = useLiveQuery(async () => {
    if (!id) return undefined;
    return await db.goals.get(id);
  }, [id]);

  const parentDream = useLiveQuery(async () => {
    if (!goal || !goal.dreamId) return undefined;
    return await db.dreams.get(goal.dreamId);
  }, [goal?.dreamId]);

  const milestones = useLiveQuery(async () => {
    if (!id) return [];
    return await db.milestones.where({ goalId: id }).toArray();
  }, [id]) || [];

  const achievements = useLiveQuery(async () => {
    if (!id) return [];
    return await db.achievements.where({ relatedGoalId: id }).toArray();
  }, [id]) || [];

  const reflections = useLiveQuery(async () => {
    if (!id) return [];
    return await db.reflections.where({ relatedGoalId: id }).toArray();
  }, [id]) || [];


  if (goal === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (goal === null) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold">Goal not found</h3>
        <button onClick={() => navigate('/goals')} className="mt-4 text-indigo-600 font-semibold hover:underline">
          Return to Goals
        </button>
      </div>
    );
  }

  // Complete Goal
  const handleMarkComplete = async () => {
    if (!id) return;
    try {
      await db.goals.update(id, {
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      triggerConfetti();
    } catch (err) {
      console.error(err);
    }
  };

  // Change Status
  const handleChangeStatus = async (newStatus: any) => {
    if (!id) return;
    try {
      await db.goals.update(id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle milestone completion
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

  // Delete Milestone
  const handleDeleteMilestone = async (mId: string) => {
    try {
      await db.milestones.delete(mId);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Milestone Inline
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !id) return;

    setAddingMilestone(true);
    try {
      const now = getCurrentISODateTime();
      const newM = {
        id: generateId(),
        goalId: id,
        title: newMilestoneTitle.trim(),
        status: 'pending' as const,
        dueDate: newMilestoneDueDate || undefined,
        createdAt: now,
        updatedAt: now,
      };
      await db.milestones.add(newM);
      setNewMilestoneTitle('');
      setNewMilestoneDueDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMilestone(false);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async () => {
    if (!id) return;
    try {
      await db.goals.delete(id);

      // Clean up linked milestones
      const linkedM = await db.milestones.where({ goalId: id }).toArray();
      await Promise.all(linkedM.map((m) => db.milestones.delete(m.id)));

      // Unlink achievements
      const linkedA = await db.achievements.where({ relatedGoalId: id }).toArray();
      await Promise.all(
        linkedA.map((a) => db.achievements.update(a.id, { relatedGoalId: undefined }))
      );

      // Unlink reflections
      const linkedR = await db.reflections.where({ relatedGoalId: id }).toArray();
      await Promise.all(
        linkedR.map((r) => db.reflections.update(r.id, { relatedGoalId: undefined }))
      );

      if (goal.dreamId) {
        navigate(`/dreams/${goal.dreamId}`);
      } else {
        navigate('/goals');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Progress stats
  const totalM = milestones.length;
  const completedM = milestones.filter((m) => m.status === 'completed').length;
  const progress = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;
  const daysLeft = getDaysRemaining(goal.targetDate);

  const getPriorityBadgeClass = (prio: string) => {
    switch (prio) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-950';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-950';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back and Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {goal.status !== 'completed' && (
            <button
              onClick={handleMarkComplete}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95 shadow-sm shadow-emerald-100 dark:shadow-none"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark Completed</span>
            </button>
          )}

          <select
            value={goal.status}
            onChange={(e) => handleChangeStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 font-semibold text-sm focus:outline-none"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed 🎉</option>
            <option value="paused">Paused</option>
          </select>

          <button
            onClick={() => navigate(`/goals/edit/${goal.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-950 text-rose-600 dark:text-rose-455 font-semibold text-sm hover:bg-rose-50 dark:hover:bg-rose-955/20 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Goal Details & Milestones */}
        <div className="lg:col-span-2 space-y-8">
          {/* Goal Header Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${getPriorityBadgeClass(goal.priority)}`}>
                {goal.priority} Priority
              </span>
              {parentDream && (
                <Link
                  to={`/dreams/${parentDream.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 border border-indigo-100/50 dark:bg-indigo-950/40 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Dream: {parentDream.title}
                </Link>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-display m-0 leading-tight">
              {goal.title}
            </h1>

            {goal.description && (
              <p className="text-slate-600 dark:text-slate-350 mt-4 mb-0 text-base leading-relaxed whitespace-pre-line">
                {goal.description}
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Target Date: {goal.targetDate ? formatDate(goal.targetDate) : 'No date'}
              </span>
              {daysLeft && (
                <span className={`flex items-center gap-1.5 font-bold ${daysLeft.urgent ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400'}`}>
                  <Clock className="h-4 w-4" />
                  {daysLeft.text}
                </span>
              )}
            </div>
          </div>

          {/* Milestones Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display m-0 flex items-center gap-2">
              <Milestone className="h-5 w-5 text-indigo-500" />
              <span>Milestones & Checkpoints ({totalM})</span>
            </h3>

            {/* List */}
            {milestones.length === 0 ? (
              <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No checkpoints added yet. Create one below to track your incremental progress.
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m) => {
                  const mDays = getDaysRemaining(m.dueDate);
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm transition-all duration-200 ${
                        m.status === 'completed' 
                          ? 'border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20 dark:bg-emerald-955/5' 
                          : 'border-slate-100 dark:border-slate-850'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                        <button
                          onClick={() => handleToggleMilestone(m.id, m.status)}
                          className={`mt-0.5 rounded-full h-5 w-5 shrink-0 flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                            m.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {m.status === 'completed' && (
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                            </svg>
                          )}
                        </button>

                        <div className="min-w-0">
                          <span className={`text-sm font-semibold block leading-tight ${
                            m.status === 'completed' 
                              ? 'line-through text-slate-400 dark:text-slate-500' 
                              : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {m.title}
                          </span>
                          
                          {m.dueDate && (
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Due: {formatDate(m.dueDate)}
                              {m.status !== 'completed' && mDays && (
                                <span className={`ml-2 font-bold ${mDays.urgent ? 'text-amber-600' : 'text-slate-400'}`}>
                                  ({mDays.text})
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors duration-200 cursor-pointer"
                        aria-label="Delete milestone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Add Form */}
            <form onSubmit={handleAddMilestone} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="New milestone checkpoint title..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                maxLength={80}
                required
              />
              <input
                type="date"
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={addingMilestone}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
              >
                Add Checkpoint
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Goal Analytics, wins, reflections */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 font-display">
              Milestone Progress
            </h3>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display leading-none">
                {progress}%
              </span>
              <span className="text-xs text-slate-400 font-medium pb-1">
                checkpoints complete
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <span className="block text-xl font-black text-slate-800 dark:text-white font-display">
                  {completedM}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                  Completed
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <span className="block text-xl font-black text-slate-850 dark:text-white font-display">
                  {totalM}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                  Checkpoints
                </span>
              </div>
            </div>
          </div>

          {/* Connected Achievements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 font-display m-0 flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
                <span>Goal Wins ({achievements.length})</span>
              </h3>
              <Link
                to={`/achievements/new?goalId=${goal.id}${goal.dreamId ? `&dreamId=${goal.dreamId}` : ''}`}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Log Win
              </Link>
            </div>

            {achievements.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 m-0 text-center">
                No achievements recorded for this goal yet. Record your wins!
              </p>
            ) : (
              <div className="space-y-3">
                {achievements.slice(0, 3).map((win) => (
                  <div key={win.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/30">
                    <span className="block font-bold text-slate-700 dark:text-slate-300 leading-snug">
                      {win.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatDate(win.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Journal Reflections */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 font-display m-0 flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
                <span>Reflections ({reflections.length})</span>
              </h3>
              <Link
                to={`/reflections/new?goalId=${goal.id}${goal.dreamId ? `&dreamId=${goal.dreamId}` : ''}`}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Write Entry
              </Link>
            </div>

            {reflections.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 m-0 text-center">
                No reflections recorded yet. Record thoughts about your progress.
              </p>
            ) : (
              <div className="space-y-3">
                {reflections.slice(0, 2).map((ref) => (
                  <div key={ref.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/30">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-350 truncate block">
                        {ref.title || 'Untitled reflection'}
                      </span>
                      {ref.mood && <span className="text-sm shrink-0">{ref.mood}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 m-0 leading-relaxed">
                      {ref.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-xl animate-in fade-in duration-200">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-500 mb-4 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white font-display m-0 leading-tight">
              Delete Goal?
            </h3>

            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-2 mb-0 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-705 dark:text-white">"{goal.title}"</strong>? This will delete all milestones and unlink all associated achievements/reflections.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
