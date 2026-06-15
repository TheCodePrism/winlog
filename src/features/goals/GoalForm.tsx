import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { generateId } from '../../utils/ids';
import { getCurrentISODateTime } from '../../utils/dates';
import { ArrowLeft, Save, Target } from 'lucide-react';

export default function GoalForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Form states
  const [dreamId, setDreamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'paused'>('not_started');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch dreams to select parent
  const dreams = useLiveQuery(() => db.dreams.toArray());

  useEffect(() => {
    // If we have a query parameter for dreamId, pre-select it
    const queryDreamId = searchParams.get('dreamId');
    if (queryDreamId) {
      setDreamId(queryDreamId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEdit && id) {
      db.goals.get(id).then((goal) => {
        if (goal) {
          setTitle(goal.title);
          setDescription(goal.description || '');
          setDreamId(goal.dreamId || '');
          setTargetDate(goal.targetDate || '');
          setStatus(goal.status);
          setPriority(goal.priority);
        } else {
          setError('Goal not found');
        }
      });
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const now = getCurrentISODateTime();
      const goalData = {
        title: title.trim(),
        description: description.trim(),
        dreamId: dreamId || undefined,
        targetDate: targetDate || undefined,
        status,
        priority,
        updatedAt: now,
      };

      if (isEdit && id) {
        await db.goals.update(id, goalData);
      } else {
        const newGoal = {
          ...goalData,
          id: generateId(),
          createdAt: now,
        };
        await db.goals.add(newGoal);
      }
      
      // Navigate back
      if (dreamId) {
        navigate(`/dreams/${dreamId}`);
      } else {
        navigate(isEdit ? `/goals/${id}` : '/goals');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-955/40 flex items-center justify-center text-indigo-500">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-display m-0 leading-none">
              {isEdit ? 'Edit Goal' : 'Define a New Goal'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-none">
              Concrete target connected to a dream.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400 text-sm border border-rose-100 dark:border-rose-950">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              What is your goal? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete a rough draft of the first 5 chapters"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              maxLength={100}
              required
            />
          </div>

          {/* Connected Dream */}
          <div>
            <label htmlFor="dreamId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Connected Dream
            </label>
            <select
              id="dreamId"
              value={dreamId}
              onChange={(e) => setDreamId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
            >
              <option value="">-- No connected dream (Standalone Goal) --</option>
              {dreams?.map((dream) => (
                <option key={dream.id} value={dream.id}>
                  {dream.title}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Goal details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Define specific parameters, sub-goals, or reasons why this goal is important."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base resize-none"
            />
          </div>

          {/* Priority, Target Date, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="targetDate" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Date
              </label>
              <input
                type="date"
                id="targetDate"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed 🎉</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
