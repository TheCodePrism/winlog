import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { triggerConfetti } from '../../utils/confetti';
import { formatDate } from '../../utils/dates';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Plus,
  Target,
  Trophy,
  BookOpen,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';

export default function DreamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Queries
  const dream = useLiveQuery(async () => {
    if (!id) return undefined;
    return await db.dreams.get(id);
  }, [id]);

  const goals = useLiveQuery(async () => {
    if (!id) return [];
    return await db.goals.where({ dreamId: id }).toArray();
  }, [id]) || [];

  const achievements = useLiveQuery(async () => {
    if (!id) return [];
    return await db.achievements.where({ relatedDreamId: id }).toArray();
  }, [id]) || [];

  const reflections = useLiveQuery(async () => {
    if (!id) return [];
    return await db.reflections.where({ relatedDreamId: id }).toArray();
  }, [id]) || [];


  if (dream === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (dream === null) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold">Dream not found</h3>
        <button onClick={() => navigate('/dreams')} className="mt-4 text-indigo-600 font-semibold hover:underline">
          Return to Dreams
        </button>
      </div>
    );
  }

  // Handle marking complete
  const handleMarkComplete = async () => {
    if (!id) return;
    try {
      await db.dreams.update(id, {
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      triggerConfetti();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle change status
  const handleChangeStatus = async (newStatus: any) => {
    if (!id) return;
    try {
      await db.dreams.update(id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    try {
      // Delete dream
      await db.dreams.delete(id);
      
      // Unlink goals from this dream (set dreamId to undefined)
      const linkedGoals = await db.goals.where({ dreamId: id }).toArray();
      await Promise.all(
        linkedGoals.map((g) => db.goals.update(g.id, { dreamId: undefined }))
      );

      // Unlink achievements
      const linkedAchievements = await db.achievements.where({ relatedDreamId: id }).toArray();
      await Promise.all(
        linkedAchievements.map((a) => db.achievements.update(a.id, { relatedDreamId: undefined }))
      );

      // Unlink reflections
      const linkedReflections = await db.reflections.where({ relatedDreamId: id }).toArray();
      await Promise.all(
        linkedReflections.map((r) => db.reflections.update(r.id, { relatedDreamId: undefined }))
      );

      navigate('/dreams');
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate overall goal completion stats
  const totalGoals = goals?.length || 0;
  const completedGoalsCount = goals?.filter((g) => g.status === 'completed').length || 0;
  const goalProgress = totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Back & Actions header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate('/dreams')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dreams</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {dream.status !== 'completed' && (
            <button
              onClick={handleMarkComplete}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer active:scale-95 shadow-sm shadow-emerald-100 dark:shadow-none"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark Completed</span>
            </button>
          )}

          {dream.status === 'paused' ? (
            <button
              onClick={() => handleChangeStatus('active')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Resume Dream
            </button>
          ) : dream.status === 'active' ? (
            <button
              onClick={() => handleChangeStatus('paused')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Pause Dream
            </button>
          ) : null}

          {dream.status !== 'archived' ? (
            <button
              onClick={() => handleChangeStatus('archived')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Archive
            </button>
          ) : (
            <button
              onClick={() => handleChangeStatus('active')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Activate
            </button>
          )}

          <button
            onClick={() => navigate(`/dreams/edit/${dream.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-950 text-rose-600 dark:text-rose-455 font-semibold text-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dream Overview & Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <Tag className="h-3.5 w-3.5" />
                {dream.category || 'General'}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-950 dark:text-indigo-400`}>
                {dream.status}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-display m-0 leading-tight">
              {dream.title}
            </h1>

            {dream.description && (
              <p className="text-slate-600 dark:text-slate-350 mt-4 mb-0 text-base leading-relaxed whitespace-pre-line">
                {dream.description}
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Started: {formatDate(dream.createdAt)}
              </span>
            </div>
          </div>

          {/* Linked Goals Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display m-0 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <span>Linked Goals ({totalGoals})</span>
              </h3>
              <Link
                to={`/goals/new?dreamId=${dream.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-305 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Goal</span>
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Break down this dream into concrete, manageable goals.
                </p>
                <Link
                  to={`/goals/new?dreamId=${dream.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-550 text-white font-semibold text-xs hover:bg-indigo-600 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Goal</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <Link
                    key={goal.id}
                    to={`/goals/${goal.id}`}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          goal.priority === 'high' 
                            ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/20 dark:text-rose-400' 
                            : goal.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400'
                            : 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {goal.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-display m-0 leading-snug">
                        {goal.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-850 text-xs font-semibold text-slate-455 dark:text-slate-400 flex justify-between items-center">
                      <span>Target: {goal.targetDate ? formatDate(goal.targetDate) : 'No date'}</span>
                      <span className="text-indigo-650 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Progress & Insights (Wins & Reflections) */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 font-display">
              Dream Progress
            </h3>
            
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display leading-none">
                {goalProgress}%
              </span>
              <span className="text-xs text-slate-400 font-medium pb-1">
                goals completed
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <span className="block text-xl font-black text-slate-800 dark:text-white font-display">
                  {completedGoalsCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                  Completed
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <span className="block text-xl font-black text-slate-850 dark:text-white font-display">
                  {totalGoals}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                  Total Goals
                </span>
              </div>
            </div>
          </div>

          {/* Related Achievements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 font-display m-0 flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
                <span>Wins & Achievements ({achievements.length})</span>
              </h3>
              <Link
                to={`/achievements/new?dreamId=${dream.id}`}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Log Win
              </Link>
            </div>

            {achievements.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 m-0 text-center">
                No achievements recorded for this dream yet. Celebrate your first win!
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
                {achievements.length > 3 && (
                  <Link to="/achievements" className="block text-center text-[10px] font-bold text-indigo-650 hover:underline">
                    View all achievements
                  </Link>
                )}
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
                to={`/reflections/new?dreamId=${dream.id}`}
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
                {reflections.length > 2 && (
                  <Link to="/reflections" className="block text-center text-[10px] font-bold text-indigo-650 hover:underline">
                    View all reflections
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-xl animate-in fade-in duration-200">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-500 mb-4 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white font-display m-0 leading-tight">
              Delete Dream?
            </h3>
            
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-2 mb-0 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-705 dark:text-white">"{dream.title}"</strong>? This will unlink all associated goals, achievements, and reflections.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
